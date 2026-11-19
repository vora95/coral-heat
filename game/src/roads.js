// Proyeksi perspektif pseudo-3D (gaya OutRun): titik dunia -> layar.
// Kamera melihat ke depan sepanjang jalan; skala mengecil dengan jarak.
import { VIEW, CAM_DEPTH, ROAD_WIDTH } from './config.js';

// Proyeksi satu titik dunia. cam = {x, y, z, fov}. Kembalikan null bila di belakang kamera.
export function project(cam, wx, wy, wz) {
  const dz = wz - cam.z;
  if (dz <= 1) return null;
  const scale = (cam.fov || CAM_DEPTH) / dz;
  return {
    x: VIEW.w / 2 + scale * (wx - cam.x) * (VIEW.w / 2),
    y: VIEW.h / 2 - scale * (wy - cam.y) * (VIEW.h / 2),
    w: scale * ROAD_WIDTH * (VIEW.w / 2),
    scale,
  };
}

// Lebar layar untuk lebar dunia pada skala tertentu.
export function screenW(scale, worldW) {
  return scale * worldW * (VIEW.w / 2);
}
