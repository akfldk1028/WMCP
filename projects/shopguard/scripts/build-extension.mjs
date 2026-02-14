import * as esbuild from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const chromeDir = resolve(root, 'extensions/chrome');
const outdir = resolve(chromeDir, 'dist');

/** Common esbuild options */
const common = {
  bundle: true,
  sourcemap: true,
  target: 'es2022',
  tsconfig: resolve(root, 'tsconfig.extension.json'),
};

async function build() {
  console.log('[ShopGuard] Building Chrome extension...\n');

  // 1. Background service worker (ESM)
  await esbuild.build({
    ...common,
    entryPoints: [resolve(chromeDir, 'src/background.ts')],
    outfile: resolve(outdir, 'background.js'),
    format: 'esm',
    platform: 'browser',
  });
  console.log('  \u2713 background.js (ESM)');

  // 2. Content script (IIFE - Chrome content script constraint)
  await esbuild.build({
    ...common,
    entryPoints: [resolve(chromeDir, 'src/content/main.ts')],
    outfile: resolve(outdir, 'content.js'),
    format: 'iife',
    platform: 'browser',
  });
  console.log('  \u2713 content.js (IIFE)');

  // 3. Popup script (IIFE)
  await esbuild.build({
    ...common,
    entryPoints: [resolve(chromeDir, 'src/popup/popup.ts')],
    outfile: resolve(outdir, 'popup.js'),
    format: 'iife',
    platform: 'browser',
  });
  console.log('  \u2713 popup.js (IIFE)');

  // 4. Settings script (IIFE)
  await esbuild.build({
    ...common,
    entryPoints: [resolve(chromeDir, 'src/settings/settings.ts')],
    outfile: resolve(outdir, 'settings.js'),
    format: 'iife',
    platform: 'browser',
  });
  console.log('  \u2713 settings.js (IIFE)');

  // 5. Copy popup.html to extension root
  copyFileSync(
    resolve(chromeDir, 'src/popup/popup.html'),
    resolve(chromeDir, 'popup.html'),
  );
  console.log('  \u2713 popup.html (copied)');

  // 6. Copy settings.html to extension root
  const settingsOutDir = resolve(chromeDir, 'settings');
  mkdirSync(settingsOutDir, { recursive: true });
  copyFileSync(
    resolve(chromeDir, 'src/settings/settings.html'),
    resolve(settingsOutDir, 'settings.html'),
  );
  console.log('  \u2713 settings/settings.html (copied)');

  // 7. Verify icons exist
  const iconSizes = [16, 48, 128];
  for (const size of iconSizes) {
    const iconPath = resolve(chromeDir, `icons/icon${size}.png`);
    if (!existsSync(iconPath)) {
      console.warn(`  \u26A0 Missing: icons/icon${size}.png`);
    }
  }

  console.log('\n[ShopGuard] Build complete \u2192 extensions/chrome/dist/');
  console.log('[ShopGuard] Load unpacked from: extensions/chrome/');
}

build().catch((e) => {
  console.error('[ShopGuard] Build failed:', e);
  process.exit(1);
});
