// Dialog misi: panel kiri dengan portrait pemberi misi (digambar dari parameter giver),
// teks briefing, dan prompt lanjut. Game membeku selama dialog terbuka.
export function openDialog(G, giver, lines, onAccept) {
  G.dialog = { giver, lines, line: 0, onAccept };
}

export function advanceDialog(G) {
  const d = G.dialog;
  if (!d) return null;
  d.line += 1;
  if (d.line >= d.lines.length) {
    const cb = d.onAccept;
    G.dialog = null;
    return cb || null;
  }
  return null;
}

export function closeDialog(G) {
  G.dialog = null;
}

// Portrait stylized: wajah + rambut sesuai gaya + baju. Semua parameter dari data giver.
export function drawPortrait(ctx, x, y, w, h, giver) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = '#2a2a35';
  ctx.fillRect(x, y, w, h);
  const cx = x + w / 2;
  const cy = y + h * 0.42;
  const r = h * 0.20;
  // Bahu / baju.
  ctx.fillStyle = giver.shirt;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.42, y + h);
  ctx.quadraticCurveTo(cx - w * 0.4, y + h * 0.62, cx, y + h * 0.60);
  ctx.quadraticCurveTo(cx + w * 0.4, y + h * 0.62, cx + w * 0.42, y + h);
  ctx.closePath();
  ctx.fill();
  // Leher + wajah.
  ctx.fillStyle = '#8d5a3b';
  ctx.fillRect(cx - r * 0.22, cy + r * 0.7, r * 0.44, r * 0.5);
  ctx.fillStyle = giver.skin;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.78, r * 0.92, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rambut sesuai gaya.
  ctx.fillStyle = giver.hair;
  const hs = giver.hairStyle;
  if (hs === 'bun') {
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.95, r * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.45, r * 0.82, r * 0.5, 0, Math.PI, 0); ctx.fill();
  } else if (hs === 'buzz') {
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.5, r * 0.8, r * 0.42, 0, Math.PI, 0); ctx.fill();
  } else if (hs === 'pony') {
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.5, r * 0.82, r * 0.55, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + r * 0.85, cy + r * 0.3, r * 0.2, r * 0.6, 0.4, 0, Math.PI * 2); ctx.fill();
  } else if (hs === 'mohawk') {
    ctx.fillRect(cx - r * 0.14, cy - r * 1.5, r * 0.28, r * 0.7);
  } else if (hs === 'long') {
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.2, r * 0.95, r * 0.95, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - r * 0.95, cy - r * 0.2, r * 0.3, r * 1.1);
    ctx.fillRect(cx + r * 0.65, cy - r * 0.2, r * 0.3, r * 1.1);
  } else if (hs === 'bob') {
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.35, r * 0.92, r * 0.7, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - r * 0.92, cy - r * 0.35, r * 0.24, r * 0.75);
    ctx.fillRect(cx + r * 0.68, cy - r * 0.35, r * 0.24, r * 0.75);
  } else if (hs === 'slick') {
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.55, r * 0.8, r * 0.4, 0, Math.PI, 0); ctx.fill();
  } else if (hs === 'cap') {
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.55, r * 0.82, r * 0.45, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ff3b30';
    ctx.fillRect(cx - r * 0.9, cy - r * 0.75, r * 1.8, r * 0.3);
  }
  // Mata + senyum.
  ctx.fillStyle = '#14141c';
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.05, r * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.05, r * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5a2a1a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.32, r * 0.32, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.restore();
}

export function drawDialog(G, ctx) {
  const d = G.dialog;
  if (!d) return;
  const W = 1280, H = 800;
  const pw = 560, px = 60;
  // Bungkus teks dulu supaya tinggi panel mengikuti isi (tidak ada ruang kosong).
  ctx.font = '19px system-ui, sans-serif';
  const words = d.lines[d.line].split(' ');
  const wrapped = [];
  let line = '';
  for (const w of words) {
    if (ctx.measureText(line + w).width > pw - 180) { wrapped.push(line); line = ''; }
    line += w + ' ';
  }
  wrapped.push(line);
  const ph = Math.max(230, 140 + wrapped.length * 26);
  const py = H - ph - 40;
  ctx.fillStyle = 'rgba(10,10,16,0.88)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, pw, ph);
  drawPortrait(ctx, px + 18, py + 18, 120, 150, d.giver);
  ctx.fillStyle = '#ffd60a';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(d.giver.name, px + 156, py + 22);
  ctx.fillStyle = '#9a9aad';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(d.giver.role, px + 156, py + 54);
  ctx.fillStyle = '#f5f5f0';
  ctx.font = '19px system-ui, sans-serif';
  let ly = py + 92;
  for (const ln of wrapped) { ctx.fillText(ln, px + 156, ly); ly += 26; }
  ctx.fillStyle = '#ffd60a';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText(d.line < d.lines.length - 1 ? 'E: lanjut' : 'E: terima pekerjaan', px + 156, py + ph - 36);
}
