// Staging screenshot ?shot=cover|drive|mission|walk&seed=N.
// Setiap shot menata keadaan dunia yang sama persis dari seed, lalu game merender
// dua frame dan menandai window.__shotReady — jadi tangkapan selalu sama.
import { CARS } from './config.js';
import { openDialog } from './dialog.js';
import { openShop } from './shops.js';
import { acceptMission } from './missions.js';
import { GIVERS } from './names.js';

function fixedCar(seg, x, model, speed) {
  return { kind: 'car', seg, x, speed, car: CARS[model], model, braking: false, police: false, counted: true, wander: 0 };
}

function fixedPed(seg, x, skin, shirt) {
  return { kind: 'ped', seg, x, speed: 80, skin, shirt, phase: 1.2 };
}

export function stageShot(G, name, seed) {
  const p = G.player;
  G.time = 40; // matahari + awan + animasi diam di satu momen
  G.traffic = [];
  G.peds = [];
  G.police = [];
  G.heli = { active: false };
  G.dialog = null;
  G.shop = null;
  G.garageUI = null;
  G.activity = null;
  G.activityTargetSeg = null;
  if (name === 'cover') {
    // Kejar-kejaran polisi di Downtown: menara kaca menjulang, wanted 3, misi aktif.
    p.mode = 'drive'; p.seg = 150; p.x = 0.1; p.speed = 7200; p.carModel = 0;
    p.wanted = 3; p.nitro = 100; p.health = 100; p.cash = 1250;
    const m = G.missions.list[1];
    if (m.state !== 'done') { m.state = 'active'; G.missions.active = m; G.missionTargetSeg = m.targetSeg; }
    G.traffic = [fixedCar(152.5, -0.5, 1, 5200), fixedCar(154, 0.5, 3, 4800), fixedCar(157, -0.2, 2, 5400), fixedCar(160, 0.6, 4, 4600), fixedCar(164, -0.6, 0, 5000), fixedCar(170, 0.2, 1, 5100)];
    G.peds = [fixedPed(152, -1.25, '#c98d64', '#e8e8e8'), fixedPed(156, 1.25, '#8d5a3b', '#4d96ff'), fixedPed(161, -1.3, '#e8b88a', '#ffd60a'), fixedPed(166, 1.2, '#d9a06b', '#ff9f45')];
    G.police = [
      { kind: 'car', seg: 147.2, x: -0.3, speed: 7800, car: CARS[1], model: 1, braking: false, police: true, counted: true, wander: 0, touch: 0 },
      { kind: 'car', seg: 145.5, x: 0.45, speed: 7900, car: CARS[1], model: 1, braking: false, police: true, counted: true, wander: 0, touch: 0 },
    ];
    G.heli.active = true;
  } else if (name === 'drive') {
    // Melaju di Ocean Drive: laut kanan, palm kiri, nitro menyala.
    p.mode = 'drive'; p.seg = 640; p.x = -0.15; p.speed = 6800; p.carModel = 3;
    p.wanted = 0; p.nitro = 82; p.nitroActive = true; p.health = 100; p.cash = 860;
    G.traffic = [fixedCar(643, 0.4, 2, 4200), fixedCar(647, -0.5, 4, 3900), fixedCar(652, 0.1, 0, 4500), fixedCar(658, -0.4, 1, 4100)];
    G.peds = [fixedPed(643, -1.25, '#c98d64', '#30d158'), fixedPed(649, 1.25, '#e8b88a', '#bf5af2'), fixedPed(655, -1.2, '#8d5a3b', '#e8e8e8')];
  } else if (name === 'mission') {
    // Jalan kaki di depan Mama Luz: dialog misi terbuka, jalanan di belakang.
    p.mode = 'walk'; p.seg = 18; p.x = -0.2; p.speed = 0;
    p.wanted = 0; p.health = 100; p.cash = 150;
    const luz = GIVERS.find((g) => g.id === 'luz');
    const m = G.missions.list[0];
    openDialog(G, luz, [m.brief, 'Ambil Coral GT merah itu, bawa ke Garage Coral. Cepat.'], () => acceptMission(G, m));
    G.traffic = [fixedCar(21, 0.3, 0, 3000), fixedCar(24, -0.4, 2, 2800)];
    G.peds = [fixedPed(20, 1.25, '#c98d64', '#e8e8e8'), fixedPed(23, -1.25, '#8d5a3b', '#4d96ff')];
  } else {
    // Jalan kaki di depan toko Yara: panel shop terbuka.
    p.mode = 'walk'; p.seg = 60; p.x = 0.3; p.speed = 0;
    p.wanted = 0; p.health = 82; p.cash = 640;
    openShop(G, 'ammo');
    G.shop.sel = 1;
    G.traffic = [fixedCar(63, -0.3, 1, 2600), fixedCar(67, 0.5, 3, 2400)];
    G.peds = [fixedPed(62, -1.25, '#e8b88a', '#ffd60a'), fixedPed(66, 1.25, '#d9a06b', '#30d158'), fixedPed(69, -1.2, '#c98d64', '#ff9f45')];
  }
  G.camera.x = 0; G.camera.y = 1050; G.camera.z = 0;
  return { screen: 'play' };
}
