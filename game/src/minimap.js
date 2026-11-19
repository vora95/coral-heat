// Minimap Coral Bay: rute lingkar bergaya + penanda (misi, toko, safehouse, garasi,
// giver, polisi). Pemain = titik putih; target = berlian kuning.
import { ROUTE_SEGS } from './config.js';

function mapPoint(seg, cx, cy, rx, ry) {
  const a = (seg / ROUTE_SEGS) * Math.PI * 2 - Math.PI / 2;
  return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
}

export function drawMinimap(G, ctx) {
  const cx = 1280 - 116, cy = 176, rx = 92, ry = 78;
  ctx.fillStyle = 'rgba(10,10,16,0.6)';
  ctx.beginPath();
  ctx.arc(cx, cy, 104, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Rute: lingkaran bergaya.
  ctx.strokeStyle = '#8a8a9a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  const dot = (seg, color, r = 4) => {
    const pt = mapPoint(seg, cx, cy, rx, ry);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  // Toko (hijau), safehouse (biru), garasi (oranye).
  for (const s of G.world.spots.shops) dot(s.seg, '#30d158', 4);
  for (const s of G.world.spots.safehouses) dot(s.seg, '#0a84ff', 4);
  dot(G.world.spots.garage.seg, '#ff9a3d', 5);
  // Giver dengan misi tersedia/aktif (kuning "!").
  for (const g of G.world.spots.givers) {
    const m = G.missions.list.find((x) => x.id === g.missionId);
    if (m && (m.state === 'available' || m.state === 'active')) {
      const pt = mapPoint(g.seg, cx, cy, rx, ry);
      ctx.fillStyle = '#ffd60a';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', pt.x, pt.y - 4);
      ctx.textAlign = 'left';
    }
  }
  // Polisi (merah).
  for (const c of G.police) dot(c.seg, '#ff3b30', 3);
  // Target misi/aktivitas (berlian kuning).
  const target = G.missionTargetSeg ?? G.activityTargetSeg ?? null;
  if (target !== null && target !== undefined) {
    const pt = mapPoint(target, cx, cy, rx, ry);
    ctx.fillStyle = '#ffd60a';
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
  }
  // Pemain (putih, dengan arah).
  const pp = mapPoint(G.player.seg, cx, cy, rx, ry);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pp.x, pp.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1;
  ctx.stroke();
}
