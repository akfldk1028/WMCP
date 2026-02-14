import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

copyFileSync(join(root, 'manifest.json'), join(dist, 'manifest.json'));
copyFileSync(join(root, 'popup.html'), join(dist, 'popup.html'));

console.log('Static files copied to dist/');
