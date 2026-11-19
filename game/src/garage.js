// Garasi Coral: 4 slot mobil curian. Panel: ambil, simpan, atau jual.
// Logika simpan/ambil/jual ada di vehicles.js; file ini UI + pilihan.
import { CARS } from './config.js';
import { garageTake, garageSell, garageStore } from './vehicles.js';

export function openGarage(G) {
  G.garageUI = { sel: 0, msg: '' };
}

export function closeGarage(G) {
  G.garageUI = null;
}

export function garageMove(G, dir) {
  if (!G.garageUI) return;
  const n = G.player.garageCars.length + 1; // +1 baris "simpan mobil ini"
  G.garageUI.sel = (G.garageUI.sel + dir + n) % n;
}

export function garageAction(G, action) {
  const ui = G.garageUI;
  if (!ui) return;
  const p = G.player;
  if (ui.sel === p.garageCars.length) {
    // Baris terakhir: simpan mobil saat ini.
    ui.msg = garageStore(G);
    if (p.mode === 'walk') closeGarage(G);
    return;
  }
  if (action === 'take') ui.msg = garageTake(G, ui.sel);
  else if (action === 'sell') ui.msg = garageSell(G, ui.sel);
  if (p.mode === 'drive') closeGarage(G);
}

export function drawGarage(G, ctx) {
  const ui = G.garageUI;
  if (!ui) return;
  const p = G.player;
  const pw = 560, ph = 380, px = (1280 - pw) / 2, py = 180;
  ctx.fillStyle = 'rgba(10,10,16,0.92)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#0a84ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, pw, ph);
  ctx.fillStyle = '#0a84ff';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Garage Coral — 4 slots', px + 24, py + 18);
  p.garageCars.forEach((model, i) => {
    const y = py + 64 + i * 40;
    if (i === ui.sel) {
      ctx.fillStyle = 'rgba(10,132,255,0.25)';
      ctx.fillRect(px + 12, y - 6, pw - 24, 36);
    }
    ctx.fillStyle = i === ui.sel ? '#ffffff' : '#f5f5f0';
    ctx.font = '19px system-ui, sans-serif';
    ctx.fillText(`${i + 1}. ${CARS[model].name} — sell $${CARS[model].price}`, px + 24, y);
  });
  const storeY = py + 64 + p.garageCars.length * 40;
  if (p.garageCars.length === ui.sel) {
    ctx.fillStyle = 'rgba(10,132,255,0.25)';
    ctx.fillRect(px + 12, storeY - 6, pw - 24, 36);
  }
  ctx.fillStyle = '#ffd60a';
  ctx.font = '19px system-ui, sans-serif';
  ctx.fillText(p.mode === 'drive' ? 'Store current car here' : 'No car to store (on foot)', px + 24, storeY);
  ctx.fillStyle = '#9a9aad';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Atas/bawah: pilih • Enter: ambil/simpan • X: jual • Esc: tutup', px + 24, py + ph - 34);
  if (ui.msg) {
    ctx.fillStyle = '#30d158';
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillText(ui.msg, px + 24, py + ph - 62);
  }
}
