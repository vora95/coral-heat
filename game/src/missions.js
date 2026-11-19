// 9 misi berantai Coral Heat: terima dari giver, kejar objektif, dibayar tunai.
// Misi aktif menaruh beacon di jalan + penanda minimap; selesai membuka misi berikut.
import { MISSIONS } from './story.js';
import { spawnPopup } from './effects.js';
import { saveGame } from './save.js';

export function initMissions(G) {
  G.missions = { list: MISSIONS.map((m) => ({ ...m, state: 'locked', progress: 0 })), active: null, done: 0 };
  G.missions.list[0].state = 'available';
  G.missionTargetSeg = null;
}

export function availableMissionFor(G, giverId) {
  return G.missions.list.find((m) => m.giver === giverId && m.state === 'available');
}

export function acceptMission(G, mission) {
  mission.state = 'active';
  G.missions.active = mission;
  G.missionTargetSeg = mission.targetSeg;
  return `${mission.title}: ${mission.objective}`;
}

export function completeMission(G, mission) {
  mission.state = 'done';
  G.missions.active = null;
  G.missions.done += 1;
  G.missionTargetSeg = null;
  G.player.cash += mission.reward;
  const next = G.missions.list.find((m) => m.state === 'locked');
  if (next) next.state = 'available';
  spawnPopup(G, 640, 300, `MISSION DONE +$${mission.reward}`, '#30d158');
  saveGame(G);
  return `Mission complete: ${mission.title} (+$${mission.reward}).`;
}

export function missionProgress(G, n = 1) {
  const m = G.missions.active;
  if (!m) return;
  m.progress += n;
  if ((m.type === 'taxi' || m.type === 'collect') && m.progress >= (m.count || 3)) {
    completeMission(G, m);
  }
}

function segForward(a, b) {
  let d = (b - a) % 720;
  if (d < 0) d += 720;
  return d;
}

export function updateMissions(G, dt) {
  const m = G.missions.active;
  if (!m) { G.missionTargetSeg = null; return; }
  const p = G.player;
  const dist = segForward(p.seg, m.targetSeg);
  if (m.type === 'drive' || m.type === 'deliver' || m.type === 'buy' || m.type === 'finale') {
    if (dist < 1.5) completeMission(G, m);
  } else if (m.type === 'escape') {
    // Sampai di target, lalu wanted harus hilang.
    if (dist < 1.5 && p.wanted === 0) completeMission(G, m);
    else if (dist < 1.5) G.missionTargetSeg = null; // bersembunyi sampai polisi pergi
  } else if (m.type === 'race' || m.type === 'taxi' || m.type === 'collect') {
    // Diselesaikan oleh activities.js.
    G.missionTargetSeg = m.targetSeg;
  }
  if (m.state === 'active') G.missionTargetSeg = m.type === 'escape' && dist < 1.5 ? null : m.targetSeg;
}

export function missionObjectiveText(G) {
  const m = G.missions.active;
  if (!m) return G.missions.done >= 9 ? 'All 9 jobs done — Coral Bay is yours.' : 'Find a mission giver (yellow ! on the map).';
  if (m.type === 'taxi' || m.type === 'collect') return `${m.objective} — ${m.progress}/${m.count || 3}`;
  if (m.type === 'escape' && segForward(G.player.seg, m.targetSeg) < 1.5) return 'Hide until the heat dies down!';
  const d = Math.round(segForward(G.player.seg, m.targetSeg) * 0.2);
  return `${m.objective} — ${d} km`;
}
