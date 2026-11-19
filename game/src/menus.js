// Layar menu: judul, jeda, busted/wasted, menang. Semua digambar di canvas.
import { INTRO, BUSTED_TEXT, WASTED_TEXT, WIN_TEXT } from './story.js';

function panel(ctx, title, lines, prompt, accent = '#ffd60a') {
  const pw = 760;
  const ph = 150 + lines.length * 30 + 70;
  const px = (1280 - pw) / 2;
  const py = (800 - ph) / 2;
  ctx.fillStyle = 'rgba(8,8,14,0.88)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, pw, ph);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(title, 640, py + 28);
  ctx.fillStyle = '#f5f5f0';
  ctx.font = '19px system-ui, sans-serif';
  lines.forEach((ln, i) => ctx.fillText(ln, 640, py + 100 + i * 30));
  ctx.fillStyle = accent;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(prompt, 640, py + ph - 46);
  ctx.textAlign = 'left';
}

export function drawTitle(G, ctx) {
  ctx.fillStyle = 'rgba(8,8,14,0.45)';
  ctx.fillRect(0, 0, 1280, 800);
  const lines = [
    INTRO.sub,
    '',
    INTRO.body,
    '',
    INTRO.hint,
    `Missions done: ${G.missions.done}/9   •   Cash: $${G.player.cash}`,
  ];
  panel(ctx, INTRO.title, lines, 'Press Enter / click to start', '#ff9a3d');
}

export function drawPause(G, ctx) {
  ctx.fillStyle = 'rgba(8,8,14,0.55)';
  ctx.fillRect(0, 0, 1280, 800);
  panel(ctx, 'PAUSED', ['The city waits. Your wanted level does not fall while paused.', 'WASD drive • E interact • Shift nitro • Space drift • F fire • R radio • M mute'], 'Press P / Esc to resume');
}

export function drawEnd(G, ctx, kind) {
  ctx.fillStyle = 'rgba(8,8,14,0.6)';
  ctx.fillRect(0, 0, 1280, 800);
  if (kind === 'busted') panel(ctx, 'BUSTED', [BUSTED_TEXT, `Cash lost: $${G.endFine || 0}`], 'Press Enter to continue', '#0a84ff');
  else if (kind === 'wasted') panel(ctx, 'WASTED', [WASTED_TEXT, `Cash lost: $${G.endFine || 0}`], 'Press Enter to continue', '#ff3b30');
  else panel(ctx, 'CORAL HEAT', [WIN_TEXT, `Missions: 9/9   •   Cash: $${G.player.cash}`], 'Press Enter to keep playing', '#30d158');
}
