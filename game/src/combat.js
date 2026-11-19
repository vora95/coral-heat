// Combat hitscan: tembak ke polisi/rival terdekat dalam jarak senjata.
// Peluru dihitung, muzzle flash + suara; polisi yang tumbang meledak.
import { weaponById } from './weapons.js';
import { spawnSparks, spawnPopup } from './effects.js';
import { shakeCamera } from './camera.js';

export function fireWeapon(G) {
  const p = G.player;
  if (p.fireCd > 0 || G.ui.state !== 'play') return;
  const w = weaponById(p.weapon);
  p.fireCd = 1 / w.rate;
  if (!w.infinite) {
    if ((p.ammo[w.id] || 0) <= 0) {
      G.message = `Out of ${w.name} ammo — buy at Yara's.`;
      G.messageT = 2.5;
      return;
    }
    p.ammo[w.id] -= 1;
  }
  // Target: polisi terdekat dalam jangkauan.
  let best = null; let bestD = w.range / 200;
  for (const c of G.police) {
    const d = Math.abs(c.seg - p.seg);
    if (d < bestD) { bestD = d; best = c; }
  }
  const mx = 640 + (best ? (best.x - p.x) * 160 : 0);
  spawnSparks(G, mx, 420, w.id === 'shotgun' ? 14 : 6);
  if (best) {
    best.hp = (best.hp ?? 60) - w.dmg * (w.pellets || 1);
    if (best.hp <= 0) {
      const idx = G.police.indexOf(best);
      if (idx >= 0) G.police.splice(idx, 1);
      spawnSparks(G, mx, 420, 26);
      shakeCamera(G, 0.8);
      p.cash += 50;
      spawnPopup(G, 640, 300, 'COP DOWN +$50', '#ff3b30');
    }
  }
  if (p.mode === 'walk') p.health = Math.max(0, p.health - 0); // menembak tidak melukai diri
}

export function updateCombat(G, dt) {
  const p = G.player;
  if (p.fireCd > 0) p.fireCd -= dt;
  if (p.invuln > 0) p.invuln -= dt;
}
