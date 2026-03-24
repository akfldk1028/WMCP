/**
 * Generate Chrome extension icons from SVG.
 * Uses canvas to render the BizScope icon at 16, 48, 128px.
 * Run: node scripts/generate-icons.mjs
 *
 * Requires: npm install canvas (or use sharp)
 * Fallback: manually resize public/logo.png to 16x16, 48x48, 128x128
 */

import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const iconsDir = resolve(root, 'extensions/chrome/icons');

const sizes = [16, 48, 128];

// Try to use sharp if available
async function generateWithSharp() {
  const sharp = (await import('sharp')).default;
  const svgBuffer = readFileSync(resolve(root, 'public/icon.svg'));

  for (const size of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    writeFileSync(resolve(iconsDir, `icon${size}.png`), pngBuffer);
    console.log(`  \u2713 icon${size}.png`);
  }
}

// Fallback: create simple colored square PNGs
function generateFallback() {
  // Minimal 8-bit PNG generator for solid color squares
  for (const size of sizes) {
    const png = createSimplePNG(size, [79, 70, 229]); // #4f46e5
    writeFileSync(resolve(iconsDir, `icon${size}.png`), png);
    console.log(`  \u2713 icon${size}.png (solid color fallback)`);
  }
  console.log('\n  Note: For better icons, install sharp and re-run,');
  console.log('  or manually resize public/logo.png to 16x16, 48x48, 128x128.');
}

function createSimplePNG(size, rgb) {
  // Minimal valid PNG: IHDR + IDAT + IEND
  const width = size, height = size;

  // Raw pixel data (RGBA, with filter byte per row)
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter: none
    // Rounded rectangle approximation: just fill solid
    for (let x = 0; x < width; x++) {
      const cornerRadius = Math.max(1, Math.floor(size * 0.25));
      const inCorner = isInRoundedRect(x, y, width, height, cornerRadius);
      if (inCorner) {
        rawData.push(rgb[0], rgb[1], rgb[2], 255);
      } else {
        rawData.push(0, 0, 0, 0); // transparent
      }
    }
  }

  const rawBuf = Buffer.from(rawData);

  // Compress with zlib
  const zlib = await_import_zlib();
  const compressed = zlib.deflateSync(rawBuf);

  // Build PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function await_import_zlib() {
  // Dynamic require for zlib (Node built-in)
  return require('zlib');
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function isInRoundedRect(x, y, w, h, r) {
  // Check if (x,y) is inside a rounded rectangle
  if (x >= r && x < w - r) return true;
  if (y >= r && y < h - r) return true;
  // Check corners
  const corners = [[r, r], [w - r - 1, r], [r, h - r - 1], [w - r - 1, h - r - 1]];
  for (const [cx, cy] of corners) {
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= r * r) return true;
  }
  return false;
}

console.log('[BizScope] Generating extension icons...\n');
generateWithSharp().catch(() => {
  console.log('  sharp not available, using fallback...\n');
  generateFallback();
});
