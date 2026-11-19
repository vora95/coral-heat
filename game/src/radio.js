// Radio Coral Bay: 3 stasiun synth, sequencer nada sederhana per stasiun.
// Melodi dari tangga nada stasiun; bass di ketukan genap.
import { RADIO_STATIONS } from './names.js';
import { tone, audioCtx } from './audio.js';

export function createRadio() {
  return { station: 0, nextNote: 0, step: 0 };
}

export function nextStation(G) {
  G.radio.station = (G.radio.station + 1) % RADIO_STATIONS.length;
  G.radio.step = 0;
  G.radio.nextNote = 0;
  G.message = `Radio: ${RADIO_STATIONS[G.radio.station].name} — ${RADIO_STATIONS[G.radio.station].desc}`;
  G.messageT = 2.5;
}

export function radioTick(G, dt) {
  if (!audioCtx() || G.audioMuted) return;
  const st = RADIO_STATIONS[G.radio.station];
  const stepDur = 60 / st.bpm / 2;
  G.radio.nextNote -= dt;
  if (G.radio.nextNote > 0) return;
  G.radio.nextNote += stepDur;
  const scale = st.scale;
  const deg = scale[(G.radio.step * 5 + 2) % scale.length];
  const oct = G.radio.step % 16 === 0 ? 2 : 1;
  tone(st.base * oct * Math.pow(2, deg / 12), 0, stepDur * 0.9, 'square', 0.035);
  if (G.radio.step % 2 === 0) tone(st.base / 2, 0, stepDur, 'sine', 0.07);
  if (G.radio.step % 8 === 4) tone(st.base * 1.5, 0, stepDur * 0.5, 'triangle', 0.04);
  G.radio.step += 1;
}
