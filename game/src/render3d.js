// Renderer pseudo-3D chase-cam: langit sunset + matahari + skyline, jalan yang menyempit
// ke horizon, gedung menjulang di kiri-kanan, mobil dari belakang di bawah layar.
// Kamera duduk CAM_HEIGHT*CAM_DEPTH di belakang pemain, jadi jalan terdekat memenuhi layar.
import { VIEW, SEG_LEN, ROAD_WIDTH, CAM_HEIGHT, CAM_DEPTH, DRAW_DIST, COLORS } from './config.js';
import { project } from './roads.js';
import { segmentAt, districtAt } from './world.js';
import { drawCarRear, drawPedestrian, drawPlayerFigure, drawPalm, drawLamp, drawBuilding, drawHeli, drawSign } from './sprites.js';
import { CARS } from './config.js';

function lerpColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return `rgb(${r},${g},${bl})`;
}

// Langit + matahari + awan + skyline jauh di horizon.
function drawSky(G, ctx) {
  const d = districtAt(G.player.seg);
  const horizon = VIEW.h / 2;
  const grad = ctx.createLinearGradient(0, 0, 0, horizon);
  grad.addColorStop(0, d.sky[2]);
  grad.addColorStop(0.55, d.sky[1]);
  grad.addColorStop(1, d.sky[0]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.w, horizon + 2);
  // Matahari rendah di horizon kanan + glow.
  const sunX = VIEW.w * 0.70, sunY = horizon - 78;
  const glow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 190);
  glow.addColorStop(0, 'rgba(255,240,170,0.85)');
  glow.addColorStop(0.4, 'rgba(255,170,80,0.35)');
  glow.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 200, sunY - 200, 400, 400);
  ctx.fillStyle = COLORS.sunCore;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.sunCore;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
  ctx.fill();
  // Awan sore.
  ctx.fillStyle = 'rgba(255,200,180,0.5)';
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 317 + G.time * 6) % (VIEW.w + 260)) - 130;
    const cy = 90 + (i % 3) * 46;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 90 + i * 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Skyline jauh: siluet gedung di horizon.
  ctx.fillStyle = 'rgba(40,26,60,0.55)';
  let sx = 0;
  let k = 0;
  while (sx < VIEW.w) {
    const bw = 26 + ((k * 53) % 46);
    const bh = 18 + ((k * 91) % 62);
    ctx.fillRect(sx, horizon - bh, bw, bh);
    sx += bw + 8;
    k++;
  }
}

// Satu segmen jalan (trapesium) + trotoar + garis lajur + rumble strip.
function drawRoadSegment(ctx, p1, p2, segIndex, district) {
  // Tanah kiri-kanan (penuh lebar layar) — satu warna per distrik, tanpa belang.
  const gcol = district.ground;
  ctx.fillStyle = gcol;
  ctx.beginPath();
  ctx.moveTo(-60, p1.y); ctx.lineTo(VIEW.w + 60, p1.y);
  ctx.lineTo(VIEW.w + 60, p2.y); ctx.lineTo(-60, p2.y);
  ctx.closePath();
  ctx.fill();
  // Laut di sisi kanan untuk distrik pantai.
  if (district.name === 'Marina' || district.name === 'Ocean Drive') {
    ctx.fillStyle = '#1a6a8e';
    ctx.beginPath();
    ctx.moveTo(p1.x + p1.w / 2, p1.y); ctx.lineTo(VIEW.w + 60, p1.y);
    ctx.lineTo(VIEW.w + 60, p2.y); ctx.lineTo(p2.x + p2.w / 2, p2.y);
    ctx.closePath();
    ctx.fill();
  }
  // Trotoar di kedua sisi jalan.
  ctx.fillStyle = COLORS.sidewalk;
  ctx.beginPath();
  ctx.moveTo(p1.x - p1.w / 2 - p1.w * 0.07, p1.y); ctx.lineTo(p1.x - p1.w / 2, p1.y);
  ctx.lineTo(p2.x - p2.w / 2, p2.y); ctx.lineTo(p2.x - p2.w / 2 - p2.w * 0.07, p2.y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(p1.x + p1.w / 2, p1.y); ctx.lineTo(p1.x + p1.w / 2 + p1.w * 0.07, p1.y);
  ctx.lineTo(p2.x + p2.w / 2 + p2.w * 0.07, p2.y); ctx.lineTo(p2.x + p2.w / 2, p2.y);
  ctx.closePath();
  ctx.fill();
  // Aspal (trapesium), warna selang-seling per segmen.
  ctx.fillStyle = segIndex % 2 === 0 ? COLORS.asphaltA : COLORS.asphaltB;
  ctx.beginPath();
  ctx.moveTo(p1.x - p1.w / 2, p1.y); ctx.lineTo(p1.x + p1.w / 2, p1.y);
  ctx.lineTo(p2.x + p2.w / 2, p2.y); ctx.lineTo(p2.x - p2.w / 2, p2.y);
  ctx.closePath();
  ctx.fill();
  // Rumble strip merah-putih di tepi jalan.
  ctx.fillStyle = segIndex % 2 === 0 ? '#e8e8e8' : '#d83b3b';
  ctx.beginPath();
  ctx.moveTo(p1.x - p1.w / 2, p1.y); ctx.lineTo(p1.x - p1.w / 2 + p1.w * 0.03, p1.y);
  ctx.lineTo(p2.x - p2.w / 2 + p2.w * 0.03, p2.y); ctx.lineTo(p2.x - p2.w / 2, p2.y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(p1.x + p1.w / 2 - p1.w * 0.03, p1.y); ctx.lineTo(p1.x + p1.w / 2, p1.y);
  ctx.lineTo(p2.x + p2.w / 2, p2.y); ctx.lineTo(p2.x + p2.w / 2 - p2.w * 0.03, p2.y);
  ctx.closePath();
  ctx.fill();
  // Garis lajur putus-putus (2 garis untuk 3 lajur).
  if (segIndex % 2 === 0) {
    ctx.fillStyle = COLORS.lane;
    for (const f of [-1 / 3, 1 / 3]) {
      ctx.beginPath();
      ctx.moveTo(p1.x + (p1.w / 2) * f - p1.w * 0.006, p1.y);
      ctx.lineTo(p1.x + (p1.w / 2) * f + p1.w * 0.006, p1.y);
      ctx.lineTo(p2.x + (p2.w / 2) * f + p2.w * 0.006, p2.y);
      ctx.lineTo(p2.x + (p2.w / 2) * f - p2.w * 0.006, p2.y);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Sprite segmen: gedung, palm, lampu, papan, prop — jangkar di tanah segmen (p1).
function drawSegmentSprites(G, ctx, seg, p1) {
  for (const s of seg.sprites) {
    const sx = p1.x + s.side * s.off * (p1.w / 2);
    if (sx < -260 || sx > VIEW.w + 260) continue;
    if (s.type === 'building') {
      const w = p1.scale * s.w * (VIEW.w / 2);
      const h = p1.scale * s.h * (VIEW.h / 2);
      drawBuilding(ctx, sx, p1.y, w, h, s.color, s.lit, districtAt(seg.i).style, seg.i * 7 + (s.side > 0 ? 3 : 0));
    } else if (s.type === 'palm') {
      drawPalm(ctx, sx, p1.y, p1.scale * s.h * (VIEW.h / 2));
    } else if (s.type === 'lamp') {
      drawLamp(ctx, sx, p1.y, p1.scale * s.h * (VIEW.h / 2));
    } else if (s.type === 'sign') {
      const sw = p1.scale * s.w * (VIEW.w / 2);
      if (sw < 60) continue; // Papan jauh yang tak terbaca cuma jadi noise di horizon.
      drawSign(ctx, sx, p1.y, sw, p1.scale * s.h * (VIEW.h / 2), s.text);
    } else if (s.type === 'prop') {
      ctx.fillStyle = s.kind === 'crate' ? '#8a6b3d' : s.kind === 'bench' ? '#5a4a3a' : '#d83b3b';
      const w = p1.scale * 90 * (VIEW.w / 2);
      const h = p1.scale * 60 * (VIEW.h / 2);
      ctx.fillRect(sx - w / 2, p1.y - h, w, h);
    }
  }
}

// Mobil/entitas di satu segmen (lalu lintas + polisi + pejalan kaki).
function drawSegmentEntities(G, ctx, segIdx, p1) {
  const list = G.entityBuckets[segIdx];
  if (!list) return;
  for (const e of list) {
    const ex = p1.x + e.x * (p1.w / 2);
    if (e.kind === 'car') {
      const w = p1.scale * 430 * (VIEW.w / 2);
      const h = w * 0.5;
      drawCarRear(ctx, ex, p1.y, w, h, e.car, { brake: e.braking, police: e.police, t: G.time });
    } else if (e.kind === 'ped') {
      const h = p1.scale * 340 * (VIEW.h / 2);
      drawPedestrian(ctx, ex, p1.y, h, e.skin, G.time * 6 + e.phase, e.shirt);
    }
  }
}

// Beacon objektif: tiang cahaya + berlian melayang di segmen target.
function drawBeacon(G, ctx, targetSeg) {
  const p = G.player;
  const fwd = (targetSeg - p.seg + 720) % 720;
  if (fwd > DRAW_DIST || fwd < 1) return;
  const seg = segmentAt(G.world, p.seg + fwd);
  const cam = G.camera;
  const pt = project(cam, seg.cx, seg.y, (p.seg + fwd) * SEG_LEN);
  if (!pt) return;
  const pulse = 0.6 + 0.4 * Math.sin(G.time * 4);
  ctx.fillStyle = `rgba(255,214,10,${0.25 * pulse})`;
  ctx.fillRect(pt.x - 6, 60, 12, pt.y - 60);
  ctx.fillStyle = '#ffd60a';
  ctx.save();
  ctx.translate(pt.x, pt.y - 260 * pt.scale * 4 - 40);
  ctx.rotate(Math.PI / 4);
  const s = 16 + 6 * pulse;
  ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.restore();
}

// Gambar dunia: langit, jalan jauh->dekat, sprite, entitas, pemain, heli, beacon.
export function renderWorld(G, ctx) {
  const cam = G.camera;
  const p = G.player;
  drawSky(G, ctx);
  const base = Math.floor(p.seg);
  // Bucket entitas per segmen relatif (sekali per frame).
  const buckets = {};
  for (const e of G.traffic) {
    const idx = Math.floor(e.seg - p.seg);
    if (idx >= 0 && idx < DRAW_DIST) (buckets[idx] = buckets[idx] || []).push(e);
  }
  for (const e of G.peds) {
    const idx = Math.floor(e.seg - p.seg);
    if (idx >= 0 && idx < DRAW_DIST) (buckets[idx] = buckets[idx] || []).push(e);
  }
  G.entityBuckets = buckets;
  // Jalan jauh -> dekat (painter's algorithm).
  for (let n = DRAW_DIST - 1; n >= 0; n--) {
    const s1 = segmentAt(G.world, base + n);
    const s2 = segmentAt(G.world, base + n + 1);
    const z1 = (base + n) * SEG_LEN;
    const z2 = (base + n + 1) * SEG_LEN;
    const p1 = project(cam, s1.cx, s1.y, z1);
    const p2 = project(cam, s2.cx, s2.y, z2);
    if (!p1 || !p2) continue;
    // Clip: segmen yang sepenuhnya di bawah layar dilewati.
    if (p1.y < 0 && p2.y < 0) continue;
    drawRoadSegment(ctx, p1, p2, s1.i, districtAt(s1.i));
    drawSegmentSprites(G, ctx, s1, p1);
    drawSegmentEntities(G, ctx, n, p1);
  }
  // Beacon objektif misi/aktivitas.
  const target = G.missionTargetSeg ?? G.activityTargetSeg ?? null;
  if (target !== null && target !== undefined) drawBeacon(G, ctx, target);
  // Helikopter polisi di langit.
  if (G.heli.active) {
    const hx = VIEW.w * 0.24 + Math.sin(G.time * 0.7) * 40;
    const hy = 118 + Math.sin(G.time * 1.3) * 10;
    if (G.player.wanted >= 3) {
      const grad = ctx.createLinearGradient(hx, hy, VIEW.w / 2, VIEW.h - 160);
      grad.addColorStop(0, 'rgba(255,240,170,0.28)');
      grad.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(hx - 8, hy + 10);
      ctx.lineTo(VIEW.w / 2 - 130, VIEW.h - 150);
      ctx.lineTo(VIEW.w / 2 + 130, VIEW.h - 150);
      ctx.closePath();
      ctx.fill();
    }
    drawHeli(ctx, hx, hy, 74, G.time);
  }
  // Pemain: mobil besar dari belakang di tengah bawah, atau sosok jalan kaki.
  const steerX = VIEW.w / 2 + p.steer * 46 + cam.lean * 120;
  if (p.mode === 'drive') {
    const car = CARS[p.carModel];
    ctx.save();
    ctx.translate(steerX, VIEW.h - 6);
    ctx.rotate(p.driftAngle * 0.35);
    ctx.translate(-steerX, -(VIEW.h - 6));
    drawCarRear(ctx, steerX, VIEW.h - 6, 300, 148, car, { brake: p.braking, nitro: p.nitroActive, t: G.time });
    ctx.restore();
  } else {
    drawPlayerFigure(ctx, steerX, VIEW.h - 6, 118, G.time * 7);
  }
  // Kabut perspektif: memudarkan yang jauh ke warna langit.
  const fog = ctx.createLinearGradient(0, VIEW.h / 2 - 40, 0, VIEW.h);
  fog.addColorStop(0, 'rgba(255,140,90,0.20)');
  fog.addColorStop(0.5, 'rgba(255,140,90,0.05)');
  fog.addColorStop(1, 'rgba(255,140,90,0)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, VIEW.h / 2 - 40, VIEW.w, VIEW.h / 2 + 40);
  // Garis kecepatan saat nitro.
  if (p.nitroActive) {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const y = 120 + ((i * 97 + G.time * 900) % 560);
      const side = i % 2 === 0 ? 30 : VIEW.w - 30;
      ctx.beginPath();
      ctx.moveTo(side, y);
      ctx.lineTo(side + (i % 2 === 0 ? 60 : -60), y + 46);
      ctx.stroke();
    }
  }
}
