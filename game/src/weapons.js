// Katalog senjata + lookup. Data angka di config.js; file ini yang menjawab "senjata apa".
import { WEAPONS } from './config.js';

export function weaponById(id) {
  return WEAPONS.find((w) => w.id === id) || WEAPONS[0];
}

export function weaponList() {
  return WEAPONS;
}
