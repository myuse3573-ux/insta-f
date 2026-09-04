import { spawn } from 'child_process';

console.log('======================================================');
console.log('🖥️ Launching Instagram Messaging Desktop App...');
console.log('======================================================');

const electronCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const appProcess = spawn(electronCmd, ['electron', '.'], {
  stdio: 'inherit',
  shell: true,
});

appProcess.on('close', (code) => {
  process.exit(code || 0);
});
