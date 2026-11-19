// HUD Coral Heat: uang + nyawa + armor, bintang wanted, objektif misi, kecepatan,
// senjata + amunisi, nitro, stasiun radio, dan pesan singkat.
import { VIEW, CARS } from './config.js';
import { districtAt } from './world.js';
import { missionObjectiveText } from './missions.js';
import { weaponById } from './weapons.js';
import { drawMinimap } from './minimap.js';
import { RADIO_STATIONS } from './names.js';

function star(ctx, cx, cy, r, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(ang) * rr;
    const y = cy + Math.sin(ang) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? '#ffd60a' : 'rgba(255,255,255,0.25)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function bar(ctx, x, y, w, h, frac, color, bg = 'rgba(0,0,0,0.5)') {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), h);
}

export function drawHud(G, ctx) {
  const p = G.player;
  ctx.textBaseline = 'top';
  // Kiri atas: uang, nyawa, armor.
  ctx.fillStyle = 'rgba(10,10,16,0.55)';
  ctx.fillRect(16, 14, 250, 84);
  ctx.fillStyle = '#30d158';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`$${p.cash}`, 28, 22);
  ctx.fillStyle = '#f5f5f0';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('HP', 28, 58);
  bar(ctx, 62, 58, 90, 12, p.health / 100, '#ff3b30');
  ctx.fillText('ARMOR', 160, 58);
  bar(ctx, 214, 58, 40, 12, p.armor / 100, '#0a84ff');
  ctx.fillStyle = '#9a9aad';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(districtAt(p.seg).name, 28, 78);
  // Kanan atas: bintang wanted + minimap.
  for (let i = 0; i < 5; i++) star(ctx, VIEW.w - 220 + i * 34, 36, 13, i < p.wanted);
  if (!G.shop) drawMinimap(G, ctx); // Minimap disembunyikan saat shop terbuka (panel menutupinya).
  // Tengah atas: objektif misi.
  const obj = missionObjectiveText(G);
  ctx.font = 'bold 19px system-ui, sans-serif';
  const ow = ctx.measureText(obj).width + 36;
  ctx.fillStyle = 'rgba(10,10,16,0.6)';
  ctx.fillRect((VIEW.w - ow) / 2, 14, ow, 36);
  ctx.fillStyle = '#ffd60a';
  ctx.textAlign = 'center';
  ctx.fillText(obj, VIEW.w / 2, 22);
  ctx.textAlign = 'left';
  // Aktivitas berjalan.
  if (G.activity) {
    ctx.fillStyle = '#0a84ff';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const label = G.activity.type === 'race' ? `RACE — checkpoint ${G.activity.next + 1}/3` : G.activity.type === 'taxi' ? `TAXI — fares ${G.activity.fares}/3` : `DELIVERY — ${G.activity.next}/3`;
    ctx.fillText(label, VIEW.w / 2, 56);
    ctx.textAlign = 'left';
  }
  // Pesan singkat.
  if (G.message && G.messageT > 0) {
    ctx.fillStyle = '#f5f5f0';
    ctx.font = '18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(G.message, VIEW.w / 2, 92);
    ctx.textAlign = 'left';
  }
  // Kanan bawah: kecepatan + nitro.
  if (p.mode === 'drive') {
    const kmh = Math.round(p.speed * 0.02);
    ctx.fillStyle = 'rgba(10,10,16,0.55)';
    ctx.fillRect(VIEW.w - 210, VIEW.h - 96, 194, 80);
    ctx.fillStyle = '#f5f5f0';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(kmh), VIEW.w - 66, VIEW.h - 92);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('km/h', VIEW.w - 28, VIEW.h - 78);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9a9aad';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('NITRO', VIEW.w - 194, VIEW.h - 40);
    bar(ctx, VIEW.w - 194, VIEW.h - 24, 178, 10, p.nitro / 100, '#ff9a3d');
    if (p.drift > 0.5) {
      ctx.fillStyle = '#ffd60a';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(`DRIFT x${Math.max(1, Math.round(p.drift))}`, VIEW.w - 194, VIEW.h - 64);
    }
  }
  // Kiri bawah: senjata + amunisi + radio.
  const w = weaponById(p.weapon);
  ctx.fillStyle = 'rgba(10,10,16,0.55)';
  ctx.fillRect(16, VIEW.h - 96, 250, 80);
  ctx.fillStyle = '#f5f5f0';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(w.name, 28, VIEW.h - 88);
  ctx.fillStyle = '#9a9aad';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(w.infinite ? '∞ ammo' : `ammo ${p.ammo[w.id] || 0}`, 28, VIEW.h - 58);
  ctx.fillStyle = '#ff9a3d';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText(RADIO_STATIONS[G.radio.station].name, 28, VIEW.h - 34);
}
