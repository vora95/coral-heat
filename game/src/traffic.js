// Lalu lintas & pejalan kaki: mobil melaju di jalurnya, pejalan kaki di trotoar.
// Muncul di depan pemain, hilang di belakang — kota selalu terasa hidup.
import { CARS } from './config.js';
import { PED_NAMES } from './names.js';

export function createTraffic() {
  return [];
}
export function createPeds() {
  return [];
}

function spawnCar(G, ahead) {
  const p = G.player;
  const seg = p.seg + ahead + Math.random() * 40;
  const model = Math.floor(Math.random() * CARS.length);
  return {
    kind: 'car', seg, x: (Math.random() * 2 - 1) * 0.7,
    speed: 2600 + Math.random() * 3200, car: CARS[model], model,
    braking: false, police: false, counted: false, wander: Math.random() * 10,
  };
}

function spawnPed(G, ahead) {
  const p = G.player;
  const skins = ['#c98d64', '#8d5a3b', '#e8b88a', '#d9a06b', '#a06b42'];
  const shirts = ['#e8e8e8', '#4d96ff', '#ffd60a', '#ff9f45', '#30d158', '#bf5af2'];
  return {
    kind: 'ped', seg: p.seg + ahead + Math.random() * 30,
    x: (Math.random() < 0.5 ? -1 : 1) * (1.15 + Math.random() * 0.35),
    speed: 60 + Math.random() * 90, skin: skins[Math.floor(Math.random() * skins.length)],
    shirt: shirts[Math.floor(Math.random() * shirts.length)],
    phase: Math.random() * 6, name: PED_NAMES[Math.floor(Math.random() * PED_NAMES.length)],
  };
}

export function updateTraffic(G, dt) {
  const p = G.player;
  // Jaga jumlah mobil & pejalan kaki di depan pemain.
  while (G.traffic.filter((c) => !c.police).length < 14) G.traffic.push(spawnCar(G, 30 + Math.random() * 120));
  while (G.peds.length < 20) G.peds.push(spawnPed(G, 10 + Math.random() * 120));
  for (let i = G.traffic.length - 1; i >= 0; i--) {
    const c = G.traffic[i];
    if (c.roadblock) continue; // roadblock diam di tempat.
    c.seg += (c.speed * dt) / 200;
    c.wander += dt;
    c.x += Math.sin(c.wander * 0.5) * 0.02 * dt;
    if (c.x > 0.85) c.x = 0.85;
    if (c.x < -0.85) c.x = -0.85;
    if (c.seg < p.seg - 8 || c.seg > p.seg + 220) G.traffic.splice(i, 1);
  }
  for (let i = G.peds.length - 1; i >= 0; i--) {
    const e = G.peds[i];
    e.seg += (e.speed * dt) / 200;
    e.phase += dt * 5;
    if (e.seg < p.seg - 8 || e.seg > p.seg + 200) G.peds.splice(i, 1);
  }
}
