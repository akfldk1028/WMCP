import * as esbuild from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const chromeDir = resolve(root, 'extensions/chrome');
const outdir = resolve(chromeDir, 'dist');

const common = {
  bundle: true,
  sourcemap: true,
  target: 'es2022',
  tsconfig: resolve(root, 'tsconfig.extension.json'),
};

async function build() {
  console.log('[BizScope] Building Chrome extension...\n');

  // 1. Background service worker (ESM)
  await esbuild.build({
    ...common,
    entryPoints: [resolve(chromeDir, 'src/background.ts')],
    outfile: resolve(outdir, 'background.js'),
    format: 'esm',
    platform: 'browser',
  });
  console.log('  \u2713 background.js (ESM)');

  // 2. Popup script (IIFE)
  await esbuild.build({
    ...common,
    entryPoints: [resolve(chromeDir, 'src/popup/popup.ts')],
    outfile: resolve(outdir, 'popup.js'),
    format: 'iife',
    platform: 'browser',
  });
  console.log('  \u2713 popup.js (IIFE)');

  // 3. Settings script (IIFE)
  await esbuild.build({
    ...common,
    entryPoints: [resolve(chromeDir, 'src/settings/settings.ts')],
    outfile: resolve(outdir, 'settings.js'),
    format: 'iife',
    platform: 'browser',
  });
  console.log('  \u2713 settings.js (IIFE)');

  // 4. Copy popup.html
  copyFileSync(
    resolve(chromeDir, 'src/popup/popup.html'),
    resolve(chromeDir, 'popup.html'),
  );
  console.log('  \u2713 popup.html (copied)');

  // 5. Copy settings.html
  const settingsOutDir = resolve(chromeDir, 'settings');
  mkdirSync(settingsOutDir, { recursive: true });
  copyFileSync(
    resolve(chromeDir, 'src/settings/settings.html'),
    resolve(settingsOutDir, 'settings.html'),
  );
  console.log('  \u2713 settings/settings.html (copied)');

  // 6. Copy welcome.html
  copyFileSync(
    resolve(chromeDir, 'src/welcome/welcome.html'),
    resolve(chromeDir, 'welcome.html'),
  );
  console.log('  \u2713 welcome.html (copied)');

  // 7. Verify icons
  for (const size of [16, 48, 128]) {
    const iconPath = resolve(chromeDir, `icons/icon${size}.png`);
    if (!existsSync(iconPath)) {
      console.warn(`  \u26A0 Missing: icons/icon${size}.png`);
    }
  }

  console.log('\n[BizScope] Build complete \u2192 extensions/chrome/dist/');
  console.log('[BizScope] Load unpacked from: extensions/chrome/');
}

build().catch((e) => {
  console.error('[BizScope] Build failed:', e);
  process.exit(1);
});
