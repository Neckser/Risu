import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = join('dist', 'risu', 'browser');
const indexPath = join(dist, 'index.html');
const fallbackPath = join(dist, '404.html');

if (!existsSync(indexPath)) {
  console.error(`spa-fallback: ${indexPath} not found — did the build succeed?`);
  process.exit(1);
}

copyFileSync(indexPath, fallbackPath);
console.log(`spa-fallback: copied index.html -> 404.html in ${dist}`);
