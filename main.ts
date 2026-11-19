// Coral Heat — entrypoint build untuk gta6-01 (Node 22, stdlib saja).
// Tugas file ini cuma tiga: salin game/ + screenshots/ ke direktori output,
// tulis dossier.json lewat library vendored make.fun, lalu laporkan ringkasannya
// (jumlah file, ukuran dossier, sha256) supaya dua run bisa dibandingkan.
// Gamenya sendiri tinggal di game/ sebagai file statis offline; tidak ada build step.
//
// Cara pakai di luar container grader (MAKEFUN_OUTPUT_DIR menggantikan /output):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Batas gate.json kompetisi ini — sama seperti yang dipakai scorer.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function countGameFiles(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = countGameFiles(path);
      files += sub.files;
      bytes += sub.bytes;
    } else if (entry.isFile()) {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

function main() {
  const gameDir = join(here, 'game');
  const shotsDir = join(here, 'screenshots');
  if (!existsSync(join(gameDir, 'index.html'))) {
    throw new Error('game/index.html tidak ada — entry butuh halaman game.');
  }
  mkdirSync(out, { recursive: true });
  cpSync(gameDir, join(out, 'game'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  if (existsSync(shotsDir)) cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });
  const shotNames = readdirSync(join(out, 'screenshots')).filter((n) => /\.(png|jpe?g)$/i.test(n)).sort();
  if (shotNames.length < 3 || shotNames.length > 4) {
    throw new Error(`screenshots/ harus berisi 3 atau 4 gambar, ketemu ${shotNames.length}.`);
  }
  const dossier = buildDossier(out, CAPS);
  writeFileSync(join(out, 'dossier.json'), dossier);
  const game = countGameFiles(join(out, 'game'));
  console.log(`coral-heat: game/ ${game.files} file (${game.bytes} byte)`);
  console.log(`coral-heat: screenshots ${shotNames.join(', ')}`);
  console.log(`coral-heat: dossier.json ${dossier.length} byte sha256 ${sha256(dossier)}`);
}

main();
