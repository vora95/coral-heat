// Aktivitas sampingan: balapan jalanan, taksi, dan antar paket.
// Berjalan di atas dunia yang sama; hadiah tunai + progres misi.
import { CARS } from './config.js';
import { completeMission, missionProgress } from './missions.js';
import { spawnPopup } from './effects.js';

export function startRace(G) {
  const p = G.player;
  const rivals = [];
  for (let i = 0; i < 3; i++) {
    const model = (i + 1) % CARS.length;
    const rival = {
      kind: 'car', seg: p.seg + 2 + i * 1.5, x: (i - 1) * 0.5,
      speed: 7000 + i * 300, car: CARS[model], model, braking: false,
      police: false, counted: true, wander: 0, rival: true,
    };
    rivals.push(rival);
    G.traffic.push(rival); // dirender + bertabrakan seperti mobil biasa
  }
  G.activity = {
    type: 'race', checkpoints: [p.seg + 30, p.seg + 60, p.seg + 90], finish: p.seg + 120,
    next: 0, rivals, time: 0, state: 'run',
  };
  G.activityTargetSeg = G.activity.checkpoints[0];
  return 'Race started! Hit the checkpoints before the rivals.';
}

export function startTaxi(G) {
  const p = G.player;
  const stands = G.world.spots.taxiStands;
  const stand = stands[Math.floor(Math.random() * stands.length)];
  G.activity = { type: 'taxi', state: 'pickup', pickup: stand.seg, drop: null, fares: 0, time: 0 };
  G.activityTargetSeg = stand.seg;
  return 'Taxi: pick up the passenger at the stand.';
}

export function startDelivery(G) {
  const p = G.player;
  const points = G.world.spots.deliveries.map((d) => d.seg);
  G.activity = { type: 'delivery', points, next: 0, time: 0 };
  G.activityTargetSeg = points[0];
  return 'Delivery: collect the packages (3 stops).';
}

function segForward(a, b) {
  let d = (b - a) % 720;
  if (d < 0) d += 720;
  return d;
}

export function updateActivities(G, dt) {
  const a = G.activity;
  if (!a) return;
  const p = G.player;
  a.time += dt;
  if (a.type === 'race') {
    // Rival melaju dengan kecepatan tetap + sedikit variasi.
    for (const r of a.rivals) r.seg += (r.speed * dt) / 200;
    const cp = a.checkpoints[a.next];
    if (cp !== undefined && segForward(p.seg, cp) < 1.5) {
      a.next += 1;
      spawnPopup(G, 640, 300, `CHECKPOINT ${a.next}/3`, '#ffd60a');
      G.activityTargetSeg = a.checkpoints[a.next] ?? a.finish;
    }
    if (segForward(p.seg, a.finish) < 1.5) {
      // Menang bila semua rival masih di belakang saat pemain finis.
      finishRace(G, a.rivals.every((r) => r.seg < p.seg));
    } else if (a.rivals.some((r) => segForward(r.seg, a.finish) < 0.5)) {
      finishRace(G, false);
    }
  } else if (a.type === 'taxi') {
    if (a.state === 'pickup' && segForward(p.seg, a.pickup) < 1.5) {
      a.state = 'drop';
      a.drop = p.seg + 40 + Math.random() * 60;
      G.activityTargetSeg = a.drop;
      G.message = 'Passenger aboard — drive to the destination.';
      G.messageT = 3;
    } else if (a.state === 'drop' && a.drop !== null && segForward(p.seg, a.drop) < 1.5) {
      const fare = 90 + Math.floor(Math.random() * 80);
      p.cash += fare;
      a.fares += 1;
      spawnPopup(G, 640, 300, `FARE +$${fare}`, '#30d158');
      missionProgress(G, 1);
      if (a.fares >= 3) {
        G.activity = null;
        G.activityTargetSeg = null;
      } else {
        a.state = 'pickup';
        a.pickup = p.seg + 30 + Math.random() * 50;
        G.activityTargetSeg = a.pickup;
      }
    }
  } else if (a.type === 'delivery') {
    const pt = a.points[a.next];
    if (pt !== undefined && segForward(p.seg, pt) < 1.5) {
      a.next += 1;
      p.cash += 120;
      spawnPopup(G, 640, 300, 'PACKAGE +$120', '#30d158');
      missionProgress(G, 1);
      if (a.next >= a.points.length) {
        G.activity = null;
        G.activityTargetSeg = null;
      } else {
        G.activityTargetSeg = a.points[a.next];
      }
    }
  }
}

function finishRace(G, won) {
  const a = G.activity;
  for (const r of a.rivals) {
    const idx = G.traffic.indexOf(r);
    if (idx >= 0) G.traffic.splice(idx, 1);
  }
  if (won) {
    G.player.cash += 800;
    spawnPopup(G, 640, 300, 'RACE WON +$800', '#30d158');
    const m = G.missions.active;
    if (m && m.type === 'race') completeMission(G, m);
  } else {
    spawnPopup(G, 640, 300, 'RACE LOST', '#ff3b30');
  }
  G.activity = null;
  G.activityTargetSeg = null;
}

export function activityTargetSeg(G) {
  return G.activityTargetSeg ?? null;
}
