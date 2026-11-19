// Kendaraan: curi mobil dari jalan, simpan di garasi, tukar, dan jual.
// Garasi Coral punya 4 slot — mobil curian adalah tabungan.
import { CARS } from './config.js';
import { addWanted } from './player.js';

// Curi mobil lalu lintas terdekat (pemain jalan kaki, di samping mobil).
export function stealCar(G, carEntity) {
  const p = G.player;
  p.mode = 'drive';
  p.carModel = carEntity.model;
  p.speed = 400;
  const idx = G.traffic.indexOf(carEntity);
  if (idx >= 0) G.traffic.splice(idx, 1);
  addWanted(G, 1);
  return `You stole the ${CARS[carEntity.model].name}! Wanted level up.`;
}

// Simpan mobil saat ini ke garasi (bila ada slot kosong).
export function garageStore(G) {
  const p = G.player;
  const slots = G.world.spots.garage.slots;
  if (p.garageCars.length >= slots) return 'Garage is full (4 cars). Sell one first.';
  if (p.mode !== 'drive') return 'Bring a car to store it.';
  p.garageCars.push(p.carModel);
  p.mode = 'walk';
  p.speed = 0;
  return `${CARS[p.carModel].name} stored in the garage.`;
}

// Ambil mobil dari garasi.
export function garageTake(G, i) {
  const p = G.player;
  if (i < 0 || i >= p.garageCars.length) return 'No car in that slot.';
  p.carModel = p.garageCars.splice(i, 1)[0];
  p.mode = 'drive';
  p.speed = 300;
  return `You took the ${CARS[p.carModel].name} out.`;
}

// Jual mobil garasi.
export function garageSell(G, i) {
  const p = G.player;
  if (i < 0 || i >= p.garageCars.length) return 'No car in that slot.';
  const model = p.garageCars.splice(i, 1)[0];
  p.cash += CARS[model].price;
  return `Sold ${CARS[model].name} for $${CARS[model].price}.`;
}
