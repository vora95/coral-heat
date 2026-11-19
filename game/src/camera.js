// Kamera kejar 3D: tepat di belakang mobil/karakter, rendah, mengikuti jalan.
// Guncangan saat tabrakan, lean saat belok, dan tendangan FOV saat nitro.
import { CAM_HEIGHT, CAM_DEPTH, SEG_LEN } from './config.js';

export function createCamera() {
  return { x: 0, y: CAM_HEIGHT, z: 0, shake: 0, lean: 0, fov: CAM_DEPTH, bounce: 0 };
}

// Kamera mengikuti pemain: x = pusat jalan + offset lateral pemain, y = tinggi + elevasi jalan.
export function updateCamera(G, dt) {
  const cam = G.camera;
  const p = G.player;
  const targetX = G.roadCx + p.x * 900;
  const targetY = CAM_HEIGHT + G.roadY + cam.bounce;
  cam.x += (targetX - cam.x) * Math.min(1, dt * 8);
  cam.y += (targetY - cam.y) * Math.min(1, dt * 8);
  // Kamera duduk CAM_HEIGHT*CAM_DEPTH di belakang pemain: segmen terdekat memenuhi layar.
  // Jalan kaki: kamera lebih dekat (0.62) supaya jalan tetap memenuhi layar bawah.
  cam.z = p.seg * SEG_LEN - CAM_HEIGHT * (p.mode === 'walk' ? 0.62 : CAM_DEPTH);
  cam.shake = Math.max(0, cam.shake - dt * 3);
  const targetLean = p.steer * 0.12;
  cam.lean += (targetLean - cam.lean) * Math.min(1, dt * 6);
  const targetFov = CAM_DEPTH + (p.nitroActive ? 0.12 : 0);
  cam.fov += (targetFov - cam.fov) * Math.min(1, dt * 4);
  cam.bounce = Math.sin(G.time * 31) * p.speed * 0.0009;
}

// Guncangan kamera (tabrakan, ledakan, mendarat).
export function shakeCamera(G, amount) {
  G.camera.shake = Math.min(1, G.camera.shake + amount);
}
