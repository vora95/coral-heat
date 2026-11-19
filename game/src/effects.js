// Partikel layar: asap drift, api nitro, percikan tabrakan, dan teks popup skor (+$).
export function createEffects() {
  return [];
}

export function spawnSmoke(G, x, y, n = 6) {
  for (let i = 0; i < n; i++) {
    G.effects.push({ kind: 'smoke', x: x + (Math.random() - 0.5) * 40, y: y - Math.random() * 8, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 30, life: 0.7, max: 0.7, size: 8 + Math.random() * 10 });
  }
}

export function spawnFlame(G, x, y) {
  G.effects.push({ kind: 'flame', x: x + (Math.random() - 0.5) * 14, y, vx: (Math.random() - 0.5) * 20, vy: 60 + Math.random() * 40, life: 0.28, max: 0.28, size: 7 + Math.random() * 6 });
}

export function spawnSparks(G, x, y, n = 10) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 120 + Math.random() * 220;
    G.effects.push({ kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.4, max: 0.4, size: 2 + Math.random() * 3 });
  }
}

export function spawnPopup(G, x, y, text, color = '#ffd60a') {
  G.effects.push({ kind: 'text', x, y, vx: 0, vy: -46, life: 1.4, max: 1.4, size: 26, text, color });
}

export function updateEffects(G, dt) {
  const list = G.effects;
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i];
    e.life -= dt;
    if (e.life <= 0) {
      list.splice(i, 1);
      continue;
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    if (e.kind === 'smoke') e.size += 26 * dt;
  }
  if (list.length > 220) list.splice(0, list.length - 220);
}

export function drawEffects(G, ctx) {
  for (const e of G.effects) {
    const a = Math.max(0, e.life / e.max);
    if (e.kind === 'smoke') {
      ctx.fillStyle = `rgba(200,200,200,${0.4 * a})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.kind === 'flame') {
      ctx.fillStyle = `rgba(255,${140 + Math.floor(80 * a)},40,${a})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * a + 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.kind === 'spark') {
      ctx.fillStyle = `rgba(255,220,90,${a})`;
      ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
    } else if (e.kind === 'text') {
      ctx.font = `bold ${e.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = e.color;
      ctx.fillText(e.text, e.x, e.y);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillText(e.text, e.x + 2, e.y + 2);
    }
  }
}
