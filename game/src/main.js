// Coral Heat — boot + loop utama. Game open-world kota pantai Coral Bay:
// kamera kejar 3D, 9 misi, toko, safehouse, garasi, balapan/taksi/delivery, wanted + polisi.
// ?shot=cover|drive|mission|walk&seed=N menata satu frame lalu menandai window.__shotReady.
import { VIEW, SEG_LEN, CAM_HEIGHT, CAM_DEPTH } from './config.js';
import { makeRng } from './rng.js';
import { buildWorld, segmentAt } from './world.js';
import { createCamera, updateCamera } from './camera.js';
import { renderWorld } from './render3d.js';
import { createPlayer, tryInteract, updateWanted } from './player.js';
import { updateDriving, updateWalking } from './drive.js';
import { createTraffic, createPeds, updateTraffic } from './traffic.js';
import { updatePolice } from './police.js';
import { stealCar } from './vehicles.js';
import { initMissions, availableMissionFor, acceptMission, updateMissions } from './missions.js';
import { openDialog, advanceDialog, drawDialog } from './dialog.js';
import { fireWeapon, updateCombat } from './combat.js';
import { openShop, closeShop, shopMove, shopBuy, drawShop } from './shops.js';
import { enterSafehouse } from './safehouse.js';
import { openGarage, closeGarage, garageMove, garageAction, drawGarage } from './garage.js';
import { startRace, startTaxi, updateActivities } from './activities.js';
import { createEffects, updateEffects, drawEffects } from './effects.js';
import { initAudio, setEngine, setSiren, sfx, setMuted } from './audio.js';
import { createRadio, nextStation, radioTick } from './radio.js';
import { createInput } from './input.js';
import { saveGame, loadGame, applySave, autosave } from './save.js';
import { drawHud } from './hud.js';
import { drawTitle, drawPause, drawEnd } from './menus.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 7;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

// --- keadaan game ---------------------------------------------------------
const G = {
  time: 0, frame: 0, seed,
  world: buildWorld(seed),
  rng: makeRng(seed),
  player: createPlayer(),
  camera: createCamera(),
  traffic: createTraffic(),
  peds: createPeds(),
  police: [],
  heli: { active: false },
  effects: createEffects(),
  radio: createRadio(),
  input: createInput(),
  missions: null,
  dialog: null, shop: null, garageUI: null, activity: null,
  missionTargetSeg: null, activityTargetSeg: null,
  roadCx: 0, roadY: 0, entityBuckets: {},
  ui: { state: 'title' },
  message: '', messageT: 0,
  saveTimer: 60, busted: false, endFine: 0, winShown: false,
  audioMuted: false, roadblockSeg: null,
};
initMissions(G);
applySave(G, loadGame());

function setMessage(G, text) {
  if (!text) return;
  G.message = text;
  G.messageT = 3.5;
  status.textContent = text;
}

function syncRoad(G) {
  const s = segmentAt(G.world, G.player.seg);
  G.roadCx = s.cx;
  G.roadY = s.y;
}

// --- interaksi ------------------------------------------------------------
function doInteract(G) {
  if (G.dialog) {
    const cb = advanceDialog(G);
    if (cb) setMessage(G, cb());
    return;
  }
  if (G.shop) {
    setMessage(G, shopBuy(G));
    return;
  }
  if (G.garageUI) {
    garageAction(G, 'take');
    return;
  }
  const res = tryInteract(G);
  if (typeof res === 'string') { setMessage(G, res); return; }
  if (!res) return;
  if (res.kind === 'car') setMessage(G, stealCar(G, res.ref));
  else if (res.kind === 'giver') {
    const m = availableMissionFor(G, res.ref.giver.id);
    if (m) openDialog(G, res.ref.giver, [m.brief], () => acceptMission(G, m));
    else openDialog(G, res.ref.giver, ['Kerja bagus, Rio. Cari pekerjaan berikutnya di kota.'], null);
  } else if (res.kind === 'shop') openShop(G, res.ref.id);
  else if (res.kind === 'safehouse') setMessage(G, enterSafehouse(G, res.ref));
  else if (res.kind === 'garage') openGarage(G);
  else if (res.kind === 'race') setMessage(G, startRace(G));
  else if (res.kind === 'taxi') setMessage(G, startTaxi(G));
}

// --- akhir permainan ------------------------------------------------------
function handleBusted(G) {
  const p = G.player;
  G.endFine = Math.min(p.cash, 200);
  p.cash -= G.endFine;
  p.wanted = 0;
  p.speed = 0;
  G.police.length = 0;
  G.heli.active = false;
  G.busted = false;
  respawnAtSafehouse(G);
  G.ui.state = 'busted';
  sfx('busted');
}

function handleWasted(G) {
  const p = G.player;
  G.endFine = Math.min(p.cash, 150);
  p.cash -= G.endFine;
  p.wanted = 0;
  p.speed = 0;
  G.police.length = 0;
  G.heli.active = false;
  respawnAtSafehouse(G);
  G.ui.state = 'wasted';
  sfx('busted');
}

function respawnAtSafehouse(G) {
  const p = G.player;
  let best = null; let bestD = 1e9;
  for (const s of G.world.spots.safehouses) {
    let d = (s.seg - p.seg) % 720;
    if (d < 0) d += 720;
    const dd = Math.min(d, 720 - d);
    if (dd < bestD) { bestD = dd; best = s; }
  }
  p.seg = best ? best.seg : 90;
  p.x = 0;
  p.mode = 'walk';
  p.health = 100;
  p.speed = 0;
}

// --- update ---------------------------------------------------------------
function update(G, dt) {
  G.time += dt;
  G.frame += 1;
  const p = G.player;
  const inp = G.input;
  if (G.messageT > 0) G.messageT -= dt;
  syncRoad(G);
  // Menu / panel membekukan dunia.
  if (G.ui.state === 'title') {
    p.seg += (2600 * dt) / SEG_LEN;
    updateTraffic(G, dt);
    updateCamera(G, dt);
    return;
  }
  if (G.ui.state !== 'play') return;
  if (G.dialog || G.shop || G.garageUI) {
    updateCamera(G, dt);
    return;
  }
  if (p.mode === 'drive') updateDriving(G, dt);
  else updateWalking(G, dt);
  updateTraffic(G, dt);
  updatePolice(G, dt);
  updateMissions(G, dt);
  updateActivities(G, dt);
  updateCombat(G, dt);
  updateWanted(G, dt);
  updateEffects(G, dt);
  updateCamera(G, dt);
  radioTick(G, dt);
  autosave(G, dt);
  setEngine(Math.abs(p.speed) / 9200);
  setSiren(p.wanted > 0);
  if (G.busted) { handleBusted(G); return; }
  if (p.health <= 0) { handleWasted(G); return; }
  if (G.missions.done >= 9 && !G.winShown) {
    G.winShown = true;
    G.ui.state = 'win';
    saveGame(G);
  }
}

// --- input per state ------------------------------------------------------
function handleInput(G) {
  const inp = G.input;
  const pressed = inp.pressed;
  const st = G.ui.state;
  if (pressed.has('KeyM')) {
    G.audioMuted = !G.audioMuted;
    setMuted(G.audioMuted);
  }
  if (st === 'title') {
    if (pressed.has('Enter') || pressed.has('Space')) {
      initAudio();
      G.ui.state = 'play';
      status.textContent = 'Playing Coral Heat.';
    }
    return;
  }
  if (st === 'pause') {
    if (pressed.has('KeyP') || pressed.has('Escape') || pressed.has('Enter')) G.ui.state = 'play';
    return;
  }
  if (st === 'busted' || st === 'wasted' || st === 'win') {
    if (pressed.has('Enter') || pressed.has('Space')) G.ui.state = 'play';
    return;
  }
  if (st !== 'play') return;
  initAudio();
  if (pressed.has('KeyP') || pressed.has('Escape')) {
    if (G.shop) closeShop(G);
    else if (G.garageUI) closeGarage(G);
    else if (G.dialog) G.dialog = null;
    else G.ui.state = 'pause';
    return;
  }
  if (G.shop) {
    if (pressed.has('ArrowUp')) shopMove(G, -1);
    else if (pressed.has('ArrowDown')) shopMove(G, 1);
    else if (pressed.has('Enter') || pressed.has('KeyE')) setMessage(G, shopBuy(G));
    return;
  }
  if (G.garageUI) {
    if (pressed.has('ArrowUp')) garageMove(G, -1);
    else if (pressed.has('ArrowDown')) garageMove(G, 1);
    else if (pressed.has('Enter')) garageAction(G, 'take');
    else if (pressed.has('KeyX')) garageAction(G, 'sell');
    return;
  }
  if (pressed.has('KeyE')) doInteract(G);
  if (pressed.has('KeyF') || inp.held.has('KeyF')) fireWeapon(G);
  if (pressed.has('KeyR')) nextStation(G);
  if (pressed.has('Digit1')) { G.player.weapon = G.player.ownedWeapons[0] || 'fists'; }
  if (pressed.has('Digit2') && G.player.ownedWeapons[1]) G.player.weapon = G.player.ownedWeapons[1];
  if (pressed.has('Digit3') && G.player.ownedWeapons[2]) G.player.weapon = G.player.ownedWeapons[2];
}

// --- render ---------------------------------------------------------------
function render(G) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  renderWorld(G, ctx);
  drawEffects(G, ctx);
  if (G.ui.state === 'play' || G.ui.state === 'pause') drawHud(G, ctx);
  if (G.dialog) drawDialog(G, ctx);
  if (G.shop) drawShop(G, ctx);
  if (G.garageUI) drawGarage(G, ctx);
  if (G.ui.state === 'title') drawTitle(G, ctx);
  else if (G.ui.state === 'pause') drawPause(G, ctx);
  else if (G.ui.state === 'busted') drawEnd(G, ctx, 'busted');
  else if (G.ui.state === 'wasted') drawEnd(G, ctx, 'wasted');
  else if (G.ui.state === 'win') drawEnd(G, ctx, 'win');
}

// --- loop -----------------------------------------------------------------
function runShot(name) {
  stageShot(G, name, seed);
  G.ui.state = 'play';
  syncRoad(G);
  updateCamera(G, 1);
  updateCamera(G, 1);
  let painted = 0;
  function paint() {
    render(G);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  canvas.addEventListener('pointerdown', () => {
    const st = G.ui.state;
    if (st === 'title' || st === 'busted' || st === 'wasted' || st === 'win') {
      initAudio();
      G.ui.state = 'play';
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && G.ui.state === 'play') G.ui.state = 'pause';
  });
  let accumulator = 0;
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleInput(G);
    while (accumulator >= STEP) {
      update(G, STEP);
      accumulator -= STEP;
    }
    render(G);
    G.input.clearPressed();
  }
  status.textContent = 'Coral Heat. Press Enter to start.';
  requestAnimationFrame(frame);
}

if (shotName) runShot(shotName);
else runGame();
