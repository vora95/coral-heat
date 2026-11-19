// Safehouse: masuk untuk simpan game + pulihkan nyawa. Tiga lokasi di peta.
import { saveGame } from './save.js';

export function enterSafehouse(G, sh) {
  const p = G.player;
  p.health = 100;
  saveGame(G);
  return `Saved at ${sh.name}. Health restored.`;
}

export function nearestSafehouse(G) {
  let best = null; let bestD = 1e9;
  for (const s of G.world.spots.safehouses) {
    let d = (s.seg - G.player.seg) % 720;
    if (d < 0) d += 720;
    const dd = Math.min(d, 720 - d);
    if (dd < bestD) { bestD = dd; best = s; }
  }
  return best;
}
