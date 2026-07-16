const { existsSync } = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const mainJs = path.join(__dirname, '..', 'dist', 'main.js');

if (!existsSync(mainJs)) {
  console.error(`
Missing dist/main.js.

On Render, set Build Command to:
  npm install && npm run build

Start Command must stay:
  npm start

Do NOT build during start on the free plan — Nest runs out of memory.
`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [mainJs], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 1);
