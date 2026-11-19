// Pemain Rio: jalan kaki / nyetir, uang, nyawa, wanted, senjata, upgrade, garasi.
import { WANTED_MAX, NITRO_MAX } from './config.js';

export function createPlayer() {
  return {
    mode: 'drive', seg: 20, x: 0, speed: 0, steer: 0,
    carModel: 0, health: 100, armor: 0, cash: 150,
    wanted: 0, wantedTimer: 0, wantedCd: 0,
    weapon: 'fists', ammo: { pistol: 0, smg: 0, shotgun: 0 },
    ownedWeapons: ['fists'],
    upgrades: { nitro: false, engine: false, cararmor: false, grip: false, paint: false },
    garageCars: [], nitro: NITRO_MAX, nitroActive: false, braking: false,
    drift: 0, driftAngle: 0, driftCash: 0, nearMissCd: 0,
    walkPhase: 0, invuln: 0, fireCd: 0, hasMap: false,
  };
}

export function addWanted(G, n) {
  const p = G.player;
  if (p.wantedCd > 0) return;
  p.wanted = Math.min(WANTED_MAX, p.wanted + n);
  p.wantedTimer = 14;
  p.wantedCd = 3;
}

// Wanted turun perlahan bila tidak ada polisi di dekat pemain.
export function updateWanted(G, dt) {
  const p = G.player;
  if (p.wantedCd > 0) p.wantedCd -= dt;
  if (p.wanted <= 0) return;
  p.wantedTimer -= dt;
  let near = false;
  for (const c of G.police) if (Math.abs(c.seg - p.seg) < 15) { near = true; break; }
  if (p.wantedTimer <= 0 && !near) {
    p.wanted -= 1;
    p.wantedTimer = 12;
  }
}

// Interaksi (tombol E): prioritas jarak terdekat — mobil, giver, toko, safehouse, garasi.
export function tryInteract(G) {
  const p = G.player;
  if (p.mode === 'drive') {
    // Keluar dari mobil (berhenti dulu bila cepat).
    if (p.speed > 900) return 'Too fast to jump out!';
    p.mode = 'walk';
    p.speed = 0;
    return null;
  }
  // Jalan kaki: cari target terdekat.
  let best = null; let bestD = 1.6;
  const consider = (seg, kind, ref) => {
    const d = Math.abs(((seg - p.seg) % 720 + 720) % 720);
    const dd = Math.min(d, 720 - d);
    if (dd < bestD) { bestD = dd; best = { kind, ref }; }
  };
  for (const c of G.traffic) if (!c.police) consider(c.seg, 'car', c);
  for (const g of G.world.spots.givers) consider(g.seg, 'giver', g);
  for (const s of G.world.spots.shops) consider(s.seg, 'shop', s);
  for (const s of G.world.spots.safehouses) consider(s.seg, 'safehouse', s);
  consider(G.world.spots.garage.seg, 'garage', G.world.spots.garage);
  consider(G.world.spots.raceStart.seg, 'race', G.world.spots.raceStart);
  for (const t of G.world.spots.taxiStands) consider(t.seg, 'taxi', t);
  if (!best) return 'Nothing nearby.';
  return best;
}
