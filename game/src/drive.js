// Fisika nyetir & jalan kaki: akselerasi, belok, drift, nitro, tabrakan, near-miss.
import { SEG_LEN, MAX_SPEED, WALK_SPEED, CARS, VIEW } from './config.js';
import { addWanted } from './player.js';
import { spawnSmoke, spawnFlame, spawnSparks, spawnPopup } from './effects.js';
import { shakeCamera } from './camera.js';

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

export function updateDriving(G, dt) {
  const p = G.player;
  const inp = G.input;
  const car = CARS[p.carModel];
  const engineMul = p.upgrades.engine ? 1.15 : 1;
  // Nitro: Shift + bahan bakar tersisa.
  p.nitroActive = (inp.held.has('ShiftLeft') || inp.held.has('ShiftRight')) && p.nitro > 1 && p.speed > 1500;
  if (p.nitroActive) {
    p.nitro = Math.max(0, p.nitro - 30 * dt);
    spawnFlame(G, VIEW.w / 2 + p.steer * 46 - 40, VIEW.h - 12);
    spawnFlame(G, VIEW.w / 2 + p.steer * 46 + 40, VIEW.h - 12);
  } else {
    p.nitro = Math.min(100, p.nitro + 4 * dt);
  }
  const maxSpeed = car.max * engineMul + (p.nitroActive ? 2600 : 0);
  if (inp.held.has('ArrowUp') || inp.held.has('KeyW')) p.speed += car.accel * engineMul * dt;
  else p.speed -= 1300 * dt;
  p.braking = inp.held.has('ArrowDown') || inp.held.has('KeyS');
  if (p.braking) p.speed -= 5200 * dt;
  p.speed = clamp(p.speed, -1400, maxSpeed);
  // Off-road: bahu jalan memperlambat + bergetar.
  const offroad = Math.abs(p.x) > 1.05;
  if (offroad && p.speed > 0) {
    p.speed -= 1500 * dt;
    if (Math.random() < 0.3) G.camera.shake = Math.max(G.camera.shake, 0.25);
  }
  // Belok: makin cepat makin responsif, grip memengaruhi.
  const steerTarget = (inp.held.has('ArrowRight') || inp.held.has('KeyD') ? 1 : 0) - (inp.held.has('ArrowLeft') || inp.held.has('KeyA') ? 1 : 0);
  const gripMul = (p.upgrades.grip ? 1.25 : 1) * car.grip;
  p.steer += (steerTarget - p.steer) * Math.min(1, dt * 7);
  p.x += p.steer * 2.1 * (Math.abs(p.speed) / MAX_SPEED) * gripMul * dt * (p.speed < 0 ? -1 : 1);
  p.x = clamp(p.x, -1.35, 1.35);
  // Drift: Spasi + belok di kecepatan tinggi.
  const drifting = (inp.held.has('Space')) && Math.abs(p.speed) > 3500 && steerTarget !== 0;
  if (drifting) {
    p.drift += dt;
    p.driftAngle = p.steer * 0.55;
    p.driftCash += Math.abs(p.speed) * dt * 0.02;
    spawnSmoke(G, VIEW.w / 2 + p.steer * 46 - 70, VIEW.h - 20, 2);
    spawnSmoke(G, VIEW.w / 2 + p.steer * 46 + 70, VIEW.h - 20, 2);
    p.speed -= 500 * dt;
  } else {
    if (p.drift > 0.8 && p.driftCash > 40) {
      const gain = Math.round(p.driftCash);
      p.cash += gain;
      spawnPopup(G, VIEW.w / 2, VIEW.h - 260, `DRIFT x${Math.max(1, Math.round(p.drift))} +$${gain}`);
    }
    p.drift = 0;
    p.driftCash = 0;
    p.driftAngle *= Math.max(0, 1 - dt * 8);
  }
  p.seg += (p.speed * dt) / SEG_LEN;
  // Tabrakan & near-miss dengan lalu lintas.
  if (p.nearMissCd > 0) p.nearMissCd -= dt;
  for (const c of G.traffic) {
    const dSeg = c.seg - p.seg;
    const dx = Math.abs(c.x - p.x);
    if (Math.abs(dSeg) < 0.55 && dx < 0.45) {
      if (Math.abs(p.speed) > 1200) {
        p.speed *= 0.45;
        c.speed *= 0.5;
        c.x += (c.x < p.x ? -0.4 : 0.4);
        spawnSparks(G, VIEW.w / 2 + (c.x - p.x) * 160, VIEW.h - 130, 12);
        shakeCamera(G, 0.6);
        addWanted(G, 1);
        spawnPopup(G, VIEW.w / 2, VIEW.h - 300, 'CRASH!', '#ff3b30');
      }
    } else if (Math.abs(dSeg) < 0.9 && dx >= 0.45 && dx < 0.85 && p.speed > 5200 && p.nearMissCd <= 0 && !c.counted) {
      c.counted = true;
      p.cash += 250;
      p.nearMissCd = 1.2;
      spawnPopup(G, VIEW.w / 2, VIEW.h - 300, 'NEAR MISS +$250');
    }
  }
}

export function updateWalking(G, dt) {
  const p = G.player;
  const inp = G.input;
  const fwd = (inp.held.has('ArrowUp') || inp.held.has('KeyW') ? 1 : 0) - (inp.held.has('ArrowDown') || inp.held.has('KeyS') ? 1 : 0);
  const strafe = (inp.held.has('ArrowRight') || inp.held.has('KeyD') ? 1 : 0) - (inp.held.has('ArrowLeft') || inp.held.has('KeyA') ? 1 : 0);
  p.seg += (fwd * WALK_SPEED * dt) / SEG_LEN;
  p.x = clamp(p.x + strafe * 1.1 * dt, -1.4, 1.4);
  p.walkPhase += dt * (fwd !== 0 ? 7 : 2);
  p.speed = fwd * WALK_SPEED;
  p.steer = strafe * 0.4;
}
