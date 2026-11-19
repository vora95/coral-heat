// Dunia Coral Bay: rute lingkar 720 segmen, 6 distrik, bangunan/palm/lampu per segmen.
// Jalan dibangun sekali dari seed — sama untuk setiap run dengan seed yang sama.
import { ROUTE_SEGS, DISTRICTS } from './config.js';
import { makeRng } from './rng.js';
import { SHOPS, SAFEHOUSES, GARAGE, GIVERS } from './names.js';
import { MISSIONS } from './story.js';

export function districtAt(seg) {
  const s = ((seg % ROUTE_SEGS) + ROUTE_SEGS) % ROUTE_SEGS;
  for (const d of DISTRICTS) if (s >= d.from && s <= d.to) return d;
  return DISTRICTS[0];
}

const BUILD_COLORS = {
  glass: ['#2a3550', '#35486b', '#1f2a44', '#3d5a80', '#28324e'],
  hotel: ['#f2e3c9', '#e8b48a', '#d98a6b', '#f7ead0', '#c98d64'],
  color: ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#ff9f45', '#e84a6f'],
  ware: ['#8a7f70', '#6b6259', '#9a8a76', '#7d7266'],
  villa: ['#f7ead0', '#e8d5b5', '#d9c9a8', '#f2e3c9'],
};

function buildSegments(seed) {
  const rng = makeRng(seed);
  const segs = [];
  let cx = 0; // offset-x kumulatif pusat jalan
  let dx = 0;
  for (let i = 0; i <= ROUTE_SEGS; i++) {
    const d = districtAt(i);
    // Kurva periodik (bilangan bulat putaran per loop) supaya rute menutup mulus.
    const curve =
      Math.sin((i * Math.PI * 2 * 2) / ROUTE_SEGS) * 1.1 +
      Math.sin((i * Math.PI * 2 * 5) / ROUTE_SEGS + 1.3) * 0.7 +
      (d.name === 'Hills' ? Math.sin((i * Math.PI * 2 * 9) / ROUTE_SEGS) * 0.9 : 0);
    dx += curve;
    cx += dx;
    // Ketinggian periodik juga — bukit hanya di Hills.
    const y =
      (d.name === 'Hills' ? Math.sin((i * Math.PI * 2 * 3) / ROUTE_SEGS) * 260 : 0) +
      Math.sin((i * Math.PI * 2 * 7) / ROUTE_SEGS) * 30;
    const sprites = [];
    // Bangunan kiri/kanan jalan.
    const dens = d.name === 'Downtown' ? 0.8 : d.name === 'Old Town' ? 0.62 : d.name === 'Harbor' ? 0.5 : d.name === 'Hills' ? 0.3 : 0.38;
    for (const side of [-1, 1]) {
      if (rng.chance(dens)) {
        const colors = BUILD_COLORS[d.style] || BUILD_COLORS.hotel;
        const tall = rng.chance(d.tower);
        sprites.push({
          type: 'building', side, off: 1.25 + rng.range(0, 0.9),
          w: rng.range(280, 820), h: tall ? rng.range(d.buildH[1] * 0.8, d.buildH[1]) : rng.range(d.buildH[0], d.buildH[1] * 0.7),
          color: rng.pick(colors), lit: rng.range(0.2, 0.8), tower: tall,
        });
      } else if (rng.chance(d.palms)) {
        sprites.push({ type: 'palm', side, off: 1.15 + rng.range(0, 0.5), h: rng.range(120, 220) });
      }
      if (i % 6 === 0) sprites.push({ type: 'lamp', side, off: 1.08, h: 150 });
      if (rng.chance(0.03)) sprites.push({ type: 'sign', side, off: 1.5, w: 320, h: 130, text: d.name.toUpperCase() });
      if (rng.chance(0.08)) sprites.push({ type: 'prop', side, off: 1.1 + rng.range(0, 0.4), kind: rng.pick(['crate', 'bench', 'hydrant']) });
    }
    segs.push({ i, curve, cx, y, sprites, district: d.name });
  }
  return segs;
}

export function buildWorld(seed) {
  const segments = buildSegments(seed);
  // Drift-x per putaran (untuk kesinambungan saat rute melingkar).
  const lapDriftX = segments[ROUTE_SEGS].cx - segments[0].cx;
  const spots = {
    shops: SHOPS.map((s) => ({ ...s, side: 1 })),
    safehouses: SAFEHOUSES.map((s) => ({ ...s, side: -1 })),
    garage: { ...GARAGE, side: 1 },
    givers: MISSIONS.map((m) => {
      const g = GIVERS.find((x) => x.id === m.giver);
      return { missionId: m.id, giver: g, seg: m.startSeg, side: -1 };
    }),
    raceStart: { seg: 620, side: 1 },
    taxiStands: [40, 260, 500].map((seg) => ({ seg, side: 1 })),
    deliveries: [120, 340, 580].map((seg) => ({ seg, side: -1 })),
  };
  return { segments: segments.slice(0, ROUTE_SEGS), lapDriftX, spots, seed };
}

// Segmen untuk posisi unwrapped (tumbuh monoton); idx melingkar + offset-x putaran.
export function segmentAt(world, segFloat) {
  const lap = Math.floor(segFloat / ROUTE_SEGS);
  const idx = ((Math.floor(segFloat) % ROUTE_SEGS) + ROUTE_SEGS) % ROUTE_SEGS;
  const s = world.segments[idx];
  return { ...s, cx: s.cx + lap * world.lapDriftX };
}

// Jarak maju dari seg a ke seg b di sepanjang rute lingkar (0..ROUTE_SEGS).
export function segForward(a, b) {
  let d = (b - a) % ROUTE_SEGS;
  if (d < 0) d += ROUTE_SEGS;
  return d;
}
