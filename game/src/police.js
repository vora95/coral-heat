// Polisi Coral Bay: mobil patroli mengejar, roadblock di wanted 4+, helikopter di 3+.
// Tertangkap saat lambat + polisi menempel; lolos bila jarak melebar.
import { CARS } from './config.js';
import { spawnSparks } from './effects.js';
import { shakeCamera } from './camera.js';

function desiredCount(wanted) {
  return [0, 1, 2, 3, 4, 5][wanted] || 0;
}

export function updatePolice(G, dt) {
  const p = G.player;
  const want = desiredCount(p.wanted);
  G.heli.active = p.wanted >= 3;
  // Roadblock di depan saat wanted 4+.
  if (p.wanted >= 4) {
    if (!G.roadblockSeg || Math.abs(G.roadblockSeg - (p.seg + 25)) > 30) G.roadblockSeg = p.seg + 25;
    for (const off of [-0.5, 0.5]) {
      if (!G.traffic.some((c) => c.roadblock && Math.abs(c.seg - G.roadblockSeg) < 1 && Math.abs(c.x - off) < 0.2)) {
        G.traffic.push({ kind: 'car', seg: G.roadblockSeg, x: off, speed: 0, car: CARS[0], model: 0, braking: false, police: true, roadblock: true, counted: true, wander: 0 });
      }
    }
  } else {
    G.roadblockSeg = null;
    for (let i = G.traffic.length - 1; i >= 0; i--) if (G.traffic[i].roadblock) G.traffic.splice(i, 1);
  }
  // Spawn patroli baru di belakang pemain.
  let count = G.police.length;
  if (count < want && p.wanted > 0) {
    G.police.push({
      kind: 'car', seg: p.seg - 4 - Math.random() * 5, x: p.x + (Math.random() - 0.5) * 0.6,
      speed: p.speed + 1200, car: CARS[1], model: 1, braking: false, police: true, counted: true, wander: 0, touch: 0,
    });
  }
  for (let i = G.police.length - 1; i >= 0; i--) {
    const c = G.police[i];
    const dSeg = c.seg - p.seg;
    // Kejar: akselerasi menuju pemain, belok mengikuti x pemain.
    const targetSpeed = p.mode === 'drive' ? p.speed + 1400 : 5200;
    c.speed += Math.sign(targetSpeed - c.speed) * 2600 * dt;
    c.speed = Math.max(0, Math.min(10800, c.speed));
    c.seg += (c.speed * dt) / 200;
    c.x += Math.sign(p.x - c.x) * 0.9 * dt;
    c.x = Math.max(-1, Math.min(1, c.x));
    // Tabrak: menempel di kecepatan tinggi = dorongan + damage.
    if (Math.abs(dSeg) < 0.7 && Math.abs(c.x - p.x) < 0.4) {
      c.touch += dt;
      if (p.mode === 'drive') {
        p.speed *= 1 - 0.9 * dt;
        spawnSparks(G, 640 + (c.x - p.x) * 160, 640, 3);
        shakeCamera(G, 0.25);
        p.health = Math.max(0, p.health - 4 * dt);
      }
      // Tertangkap: lambat + polisi menempel cukup lama.
      if (p.mode === 'drive' && Math.abs(p.speed) < 700 && c.touch > 1.6) {
        G.busted = true;
        return;
      }
      if (p.mode === 'walk' && c.touch > 1.2) {
        G.busted = true;
        return;
      }
    } else {
      c.touch = 0;
    }
    // Menyerah bila tertinggal jauh / pemain lolos.
    if (dSeg < -28 || dSeg > 40) G.police.splice(i, 1);
  }
  // Pembersihan bila wanted 0.
  if (p.wanted === 0) G.police.length = 0;
}
