const { existsSync } = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const mainJs = path.join(__dirname, '..', 'dist', 'main.js');

if (!existsSync(mainJs)) {
  console.error(
    'Missing dist/main.js. Expected postinstall/build to create it. Check the Build logs for TypeScript errors.',
  );
  process.exit(1);
}

const result = spawnSync(process.execPath, [mainJs], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 1);
