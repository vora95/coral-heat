// Alat tangkap screenshot Coral Heat: menyalakan serve.ts, lalu memotret 4 scene
// staged (?shot=cover|drive|mission|walk) dengan Playwright + Chromium yang sudah
// terpasang di mesin. Keluar 1 bila ada console error / request gagal.
const { chromium } = require('playwright-core');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const REPO = '/home/hatch/workspace/makefun/gta6-01/coral-heat';
const SHOTS = [
  ['1-cover.jpg', 'cover'],
  ['2-drive.jpg', 'drive'],
  ['3-mission.jpg', 'mission'],
  ['4-walk.jpg', 'walk'],
];
const EXE = '/home/hatch/.cache/ms-playwright/chromium-1148/chrome-linux/chrome';

function waitPort(ms = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      fetch('http://127.0.0.1:8080/')
        .then((r) => (r.ok ? resolve() : setTimeout(tick, 300)))
        .catch(() => (Date.now() - start > ms ? reject(new Error('server timeout')) : setTimeout(tick, 300)));
    };
    tick();
  });
}

(async () => {
  const server = spawn('node', ['serve.ts', '--port', '8080'], { cwd: REPO, stdio: 'pipe' });
  let serverLog = '';
  server.stdout.on('data', (d) => { serverLog += d; });
  server.stderr.on('data', (d) => { serverLog += d; });
  try {
    await waitPort();
    const browser = await chromium.launch({
      executablePath: EXE,
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
    page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url()));
    for (const [file, name] of SHOTS) {
      await page.goto(`http://127.0.0.1:8080/?shot=${name}&seed=7`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 60000 });
      await page.waitForTimeout(400);
      const out = path.join(REPO, 'screenshots', file);
      await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
      const bytes = fs.statSync(out).size;
      console.log(`SHOT ${file} ${bytes} bytes ${bytes <= 262144 ? 'OK' : 'TOO BIG'}`);
    }
    console.log('ERRORS:', errors.length ? errors.join(' | ') : 'none');
    await browser.close();
    process.exit(errors.length ? 1 : 0);
  } finally {
    server.kill('SIGKILL');
  }
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
