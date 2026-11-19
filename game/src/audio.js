// Audio WebAudio murni synth: mesin, sirene, dan efek. Tanpa aset suara.
// Semua panggilan aman bila AudioContext belum diizinkan (menunggu gesture pertama).
let ctx = null;
let master = null;
let engineOsc = null;
let engineGain = null;
let sirenOsc = null;
let sirenGain = null;
let sirenTimer = null;
let muted = false;

export function audioCtx() {
  return ctx;
}

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.4;
    master.connect(ctx.destination);
    engineOsc = ctx.createOscillator();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 60;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 900;
    engineGain = ctx.createGain();
    engineGain.gain.value = 0.0;
    engineOsc.connect(filt);
    filt.connect(engineGain);
    engineGain.connect(master);
    engineOsc.start();
  } catch {
    ctx = null;
  }
}

// Nada tunggal (dipakai radio + efek): frekuensi, jeda detik, durasi, bentuk, volume.
export function tone(freq, delay, dur, type = 'sine', vol = 0.08) {
  if (!ctx || !master) return;
  try {
    const t0 = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch { /* abaikan */ }
}

export function setEngine(speed01) {
  if (!ctx || !engineOsc) return;
  engineOsc.frequency.value = 55 + speed01 * 175;
  engineGain.gain.value = 0.02 + speed01 * 0.05;
}

export function setSiren(on) {
  if (!ctx) return;
  if (on && !sirenOsc) {
    sirenOsc = ctx.createOscillator();
    sirenOsc.type = 'triangle';
    sirenOsc.frequency.value = 720;
    sirenGain = ctx.createGain();
    sirenGain.gain.value = 0.035;
    sirenOsc.connect(sirenGain);
    sirenGain.connect(master);
    sirenOsc.start();
    let hi = false;
    sirenTimer = window.setInterval(() => {
      if (sirenOsc) sirenOsc.frequency.value = hi ? 720 : 960;
      hi = !hi;
    }, 320);
  } else if (!on && sirenOsc) {
    window.clearInterval(sirenTimer);
    sirenTimer = null;
    try { sirenOsc.stop(); } catch { /* abaikan */ }
    sirenOsc = null;
    sirenGain = null;
  }
}

export function sfx(name) {
  if (!ctx) return;
  if (name === 'cash') { tone(880, 0, 0.09, 'sine', 0.09); tone(1320, 0.08, 0.12, 'sine', 0.09); }
  else if (name === 'shot') { tone(180, 0, 0.12, 'square', 0.12); tone(90, 0, 0.16, 'sawtooth', 0.1); }
  else if (name === 'crash') { tone(70, 0, 0.3, 'sawtooth', 0.16); tone(50, 0.05, 0.3, 'square', 0.12); }
  else if (name === 'pickup') { tone(660, 0, 0.08, 'sine', 0.08); tone(990, 0.07, 0.1, 'sine', 0.08); }
  else if (name === 'busted') { tone(440, 0, 0.2, 'triangle', 0.1); tone(330, 0.2, 0.3, 'triangle', 0.1); }
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.4;
}
