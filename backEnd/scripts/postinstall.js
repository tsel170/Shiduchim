/**
 * On Render, Build Command is often left as `npm install` only.
 * RENDER=true is set by Render, so we compile here after install.
 */
const { spawnSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

if (process.env.RENDER !== 'true') {
  process.exit(0);
}

console.log('[postinstall] RENDER detected — compiling TypeScript...');

const tsc = path.join(__dirname, '..', 'node_modules', 'typescript', 'bin', 'tsc');
const result = spawnSync(
  process.execPath,
  ['--max-old-space-size=400', tsc, '-p', 'tsconfig.prod.json'],
  {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const mainJs = path.join(__dirname, '..', 'dist', 'main.js');
if (!existsSync(mainJs)) {
  console.error('[postinstall] Build finished but dist/main.js is missing');
  process.exit(1);
}

console.log('[postinstall] Build OK: dist/main.js');
