// Simpan otomatis + manual via localStorage. Autosave tiap 60 detik, saat misi selesai,
// dan saat masuk safehouse. Gagal simpan (mode privat) tidak merusak game.
const KEY = 'coral-heat-save-v1';

export function saveGame(G) {
  try {
    const p = G.player;
    const data = {
      cash: p.cash, health: p.health, armor: p.armor, carModel: p.carModel,
      garageCars: p.garageCars, ownedWeapons: p.ownedWeapons, weapon: p.weapon,
      ammo: p.ammo, upgrades: p.upgrades, hasMap: p.hasMap,
      seg: p.seg, missions: G.missions.list.map((m) => ({ id: m.id, state: m.state, progress: m.progress })),
      done: G.missions.done,
    };
    window.localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function loadGame() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function applySave(G, data) {
  if (!data) return;
  const p = G.player;
  if (typeof data.cash === 'number') p.cash = data.cash;
  if (typeof data.health === 'number') p.health = data.health;
  if (typeof data.armor === 'number') p.armor = data.armor;
  if (typeof data.carModel === 'number') p.carModel = data.carModel;
  if (Array.isArray(data.garageCars)) p.garageCars = data.garageCars;
  if (Array.isArray(data.ownedWeapons)) p.ownedWeapons = data.ownedWeapons;
  if (typeof data.weapon === 'string') p.weapon = data.weapon;
  if (data.ammo) p.ammo = data.ammo;
  if (data.upgrades) p.upgrades = { ...p.upgrades, ...data.upgrades };
  if (typeof data.hasMap === 'boolean') p.hasMap = data.hasMap;
  if (typeof data.seg === 'number') p.seg = data.seg;
  if (Array.isArray(data.missions)) {
    for (const sm of data.missions) {
      const m = G.missions.list.find((x) => x.id === sm.id);
      if (m) { m.state = sm.state; m.progress = sm.progress || 0; }
    }
    const active = G.missions.list.find((m) => m.state === 'active');
    G.missions.active = active || null;
    G.missionTargetSeg = active ? active.targetSeg : null;
  }
  if (typeof data.done === 'number') G.missions.done = data.done;
}

export function autosave(G, dt) {
  G.saveTimer -= dt;
  if (G.saveTimer <= 0) {
    saveGame(G);
    G.saveTimer = 60;
  }
}
