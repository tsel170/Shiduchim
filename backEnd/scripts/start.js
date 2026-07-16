const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const mainJs = path.join(__dirname, '..', 'dist', 'main.js');

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: path.join(__dirname, '..'),
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(mainJs)) {
  console.log('dist/main.js missing — running build...');
  run('npm', ['run', 'build']);
}

if (!existsSync(mainJs)) {
  console.error('Build finished but dist/main.js still missing.');
  process.exit(1);
}

run('node', [mainJs]);
