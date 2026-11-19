// Semua gambar digambar langsung di canvas (tanpa aset): mobil dari belakang, pejalan kaki,
// palm, lampu jalan, gedung, helikopter, dan papan nama. Semua fungsi menerima koordinat
// layar (x, yBottom dalam piksel) dan ukuran piksel — proyeksi ditangani render3d.
import { CARS } from './config.js';

// Mobil dari belakang: bodi trapesium, kaca belakang, lampu rem, spoiler, knalpot.
export function drawCarRear(ctx, cx, yBottom, w, h, car, opts = {}) {
  const x = cx - w / 2;
  const bodyH = h * 0.62;
  const cabH = h * 0.38;
  const cabW = w * 0.62;
  // Bayangan.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, yBottom - h * 0.02, w * 0.52, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bodi bawah (trapezoid: lebih lebar di bawah).
  ctx.fillStyle = car.color;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.04, yBottom);
  ctx.lineTo(x + w * 0.10, yBottom - bodyH);
  ctx.lineTo(x + w * 0.90, yBottom - bodyH);
  ctx.lineTo(x + w * 0.96, yBottom);
  ctx.closePath();
  ctx.fill();
  // Kabin + kaca belakang.
  ctx.fillStyle = car.top;
  ctx.beginPath();
  ctx.moveTo(cx - cabW / 2, yBottom - bodyH);
  ctx.lineTo(cx - cabW * 0.42, yBottom - bodyH - cabH);
  ctx.lineTo(cx + cabW * 0.42, yBottom - bodyH - cabH);
  ctx.lineTo(cx + cabW / 2, yBottom - bodyH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#101018';
  ctx.fillRect(cx - cabW * 0.36, yBottom - bodyH - cabH * 0.82, cabW * 0.72, cabH * 0.6);
  // Spoiler (bila ada).
  if (car.spoiler) {
    ctx.fillStyle = '#14141c';
    ctx.fillRect(cx - w * 0.42, yBottom - bodyH - cabH * 0.16, w * 0.84, h * 0.05);
    ctx.fillRect(cx - w * 0.40, yBottom - bodyH - cabH * 0.02, w * 0.04, h * 0.14);
    ctx.fillRect(cx + w * 0.36, yBottom - bodyH - cabH * 0.02, w * 0.04, h * 0.14);
  }
  // Lampu belakang: bar merah; menyala terang saat rem.
  ctx.fillStyle = opts.brake ? '#ff2d2d' : '#8e1a1a';
  ctx.fillRect(x + w * 0.08, yBottom - bodyH * 0.72, w * 0.2, h * 0.09);
  ctx.fillRect(x + w * 0.72, yBottom - bodyH * 0.72, w * 0.2, h * 0.09);
  if (opts.brake) {
    ctx.fillStyle = 'rgba(255,60,60,0.35)';
    ctx.fillRect(x + w * 0.02, yBottom - bodyH * 0.85, w * 0.32, h * 0.3);
    ctx.fillRect(x + w * 0.66, yBottom - bodyH * 0.85, w * 0.32, h * 0.3);
  }
  // Bumper + plat nomor.
  ctx.fillStyle = '#14141c';
  ctx.fillRect(x + w * 0.06, yBottom - h * 0.10, w * 0.88, h * 0.06);
  ctx.fillStyle = '#f5f5f0';
  ctx.fillRect(cx - w * 0.09, yBottom - h * 0.20, w * 0.18, h * 0.07);
  // Lampu strobo polisi.
  if (opts.police) {
    const on = Math.floor(opts.t * 6) % 2 === 0;
    ctx.fillStyle = on ? '#ff2d2d' : '#0a84ff';
    ctx.fillRect(cx - w * 0.16, yBottom - bodyH - cabH - h * 0.06, w * 0.14, h * 0.05);
    ctx.fillStyle = on ? '#0a84ff' : '#ff2d2d';
    ctx.fillRect(cx + w * 0.02, yBottom - bodyH - cabH - h * 0.06, w * 0.14, h * 0.05);
  }
  // Api nitro dari knalpot.
  if (opts.nitro) {
    ctx.fillStyle = '#ff9a3d';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.18, yBottom);
    ctx.lineTo(cx - w * 0.10, yBottom + h * 0.22);
    ctx.lineTo(cx - w * 0.02, yBottom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd60a';
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.18, yBottom);
    ctx.lineTo(cx + w * 0.10, yBottom + h * 0.22);
    ctx.lineTo(cx + w * 0.02, yBottom);
    ctx.closePath();
    ctx.fill();
  }
  // Roda.
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x + w * 0.02, yBottom - h * 0.16, w * 0.10, h * 0.16);
  ctx.fillRect(x + w * 0.88, yBottom - h * 0.16, w * 0.10, h * 0.16);
}

// Pejalan kaki dari belakang: kepala, torso, kaki (berjalan sesuai fase).
export function drawPedestrian(ctx, cx, yBottom, h, color, phase, shirt) {
  const w = h * 0.36;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, yBottom, w * 0.5, h * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  const swing = Math.sin(phase) * h * 0.06;
  ctx.fillStyle = '#1c1c22';
  ctx.fillRect(cx - w * 0.16 + swing, yBottom - h * 0.34, w * 0.14, h * 0.34);
  ctx.fillRect(cx + w * 0.02 - swing, yBottom - h * 0.34, w * 0.14, h * 0.34);
  ctx.fillStyle = shirt || '#e8e8e8';
  ctx.fillRect(cx - w * 0.22, yBottom - h * 0.68, w * 0.44, h * 0.36);
  ctx.fillStyle = color || '#c98d64';
  ctx.beginPath();
  ctx.arc(cx, yBottom - h * 0.78, h * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.arc(cx, yBottom - h * 0.82, h * 0.11, Math.PI, 0);
  ctx.fill();
}

// Karakter pemain (jaket merah khas Rio) — lebih besar dari pejalan kaki biasa.
export function drawPlayerFigure(ctx, cx, yBottom, h, phase) {
  drawPedestrian(ctx, cx, yBottom, h, '#c98d64', phase, '#ff3b30');
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(cx - h * 0.07, yBottom - h * 0.62, h * 0.14, h * 0.05);
}

// Palm: batang melengkung + 5 pelepah.
export function drawPalm(ctx, x, yBottom, h) {
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = Math.max(2, h * 0.04);
  ctx.beginPath();
  ctx.moveTo(x, yBottom);
  ctx.quadraticCurveTo(x + h * 0.08, yBottom - h * 0.5, x + h * 0.05, yBottom - h);
  ctx.stroke();
  ctx.fillStyle = '#2a7a3d';
  for (let i = 0; i < 5; i++) {
    const a = (-0.2 - i * 0.35) * Math.PI;
    const tx = x + h * 0.05 + Math.cos(a) * h * 0.32;
    const ty = yBottom - h - Math.sin(a) * h * 0.18 - h * 0.08;
    ctx.beginPath();
    ctx.moveTo(x + h * 0.05, yBottom - h);
    ctx.quadraticCurveTo((x + h * 0.05 + tx) / 2, ty - h * 0.1, tx, ty);
    ctx.quadraticCurveTo((x + h * 0.05 + tx) / 2, ty + h * 0.02, x + h * 0.05, yBottom - h);
    ctx.fill();
  }
}

// Lampu jalan + cahaya hangat.
export function drawLamp(ctx, x, yBottom, h) {
  ctx.strokeStyle = '#2b2b33';
  ctx.lineWidth = Math.max(1, h * 0.03);
  ctx.beginPath();
  ctx.moveTo(x, yBottom);
  ctx.lineTo(x, yBottom - h);
  ctx.lineTo(x + h * 0.12, yBottom - h);
  ctx.stroke();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(x + h * 0.14, yBottom - h, h * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,120,0.18)';
  ctx.beginPath();
  ctx.arc(x + h * 0.14, yBottom - h, h * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

// Gedung: muka depan + sisi gelap + atap + jendela menyala. style: glass|hotel|color|ware|villa.
export function drawBuilding(ctx, x, yGround, w, h, color, lit, style, seed) {
  if (w < 4 || h < 4) return;
  const left = x - w / 2;
  // Sisi kanan (lebih gelap, memberi kesan kotak 3D).
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.moveTo(left + w, yGround);
  ctx.lineTo(left + w + w * 0.12, yGround - h * 0.06);
  ctx.lineTo(left + w + w * 0.12, yGround - h * 1.06);
  ctx.lineTo(left + w, yGround - h);
  ctx.closePath();
  ctx.fill();
  // Muka depan.
  ctx.fillStyle = color;
  ctx.fillRect(left, yGround - h, w, h);
  // Atap.
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(left, yGround - h, w, Math.max(2, h * 0.02));
  if (style === 'villa') {
    ctx.fillStyle = '#8e3b2a';
    ctx.beginPath();
    ctx.moveTo(left - w * 0.04, yGround - h);
    ctx.lineTo(left + w / 2, yGround - h * 1.25);
    ctx.lineTo(left + w * 1.04, yGround - h);
    ctx.closePath();
    ctx.fill();
  }
  // Jendela: grid, sebagian menyala hangat (matahari tenggelam).
  if (h > 26 && w > 18) {
    const cols = Math.max(2, Math.floor(w / 16));
    const rows = Math.max(2, Math.floor(h / 20));
    const cw = w / cols;
    const chh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = ((r * 7 + c * 13 + seed) % 10) / 10 < lit;
        ctx.fillStyle = on ? 'rgba(255,214,120,0.9)' : 'rgba(10,14,28,0.55)';
        ctx.fillRect(left + c * cw + cw * 0.2, yGround - h + r * chh + chh * 0.22, cw * 0.6, chh * 0.5);
      }
    }
  }
  // Garis vertikal kaca (gaya glass).
  if (style === 'glass') {
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    for (let i = 1; i < 5; i++) ctx.fillRect(left + (w * i) / 5, yGround - h, 2, h);
  }
}

// Helikopter polisi: badan + rotor + lampu sorot (kerucut digambar terpisah oleh renderer).
export function drawHeli(ctx, cx, y, s, t) {
  ctx.fillStyle = '#1c1c22';
  ctx.beginPath();
  ctx.ellipse(cx, y, s * 0.5, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - s * 0.42, y - s * 0.05, s * 0.2, s * 0.1);
  ctx.fillStyle = '#4d96ff';
  ctx.fillRect(cx + s * 0.18, y - s * 0.06, s * 0.14, s * 0.1);
  const rotor = Math.sin(t * 40) * 0.06;
  ctx.strokeStyle = 'rgba(20,20,28,0.7)';
  ctx.lineWidth = Math.max(2, s * 0.03);
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.62, y - s * 0.2 + rotor * s);
  ctx.lineTo(cx + s * 0.62, y - s * 0.2 - rotor * s);
  ctx.stroke();
  const on = Math.floor(t * 4) % 2 === 0;
  ctx.fillStyle = on ? '#ff2d2d' : '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, y + s * 0.14, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

// Papan reklame dengan teks (nama distrik / toko).
export function drawSign(ctx, x, yGround, w, h, text) {
  ctx.fillStyle = '#14141c';
  ctx.fillRect(x - w * 0.04, yGround - h, w * 0.08, h);
  ctx.fillStyle = '#1c1c26';
  ctx.fillRect(x - w / 2, yGround - h * 2.1, w, h * 1.1);
  ctx.strokeStyle = '#ff5e7a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, yGround - h * 2.1, w, h * 1.1);
  ctx.fillStyle = '#ffd60a';
  ctx.font = `bold ${Math.max(8, h * 0.28)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, yGround - h * 1.55);
}
