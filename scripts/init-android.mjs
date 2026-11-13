import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const call = (args) => execFileSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (!existsSync('android')) {
  console.log('Criando o projeto nativo Android via Capacitor...');
  call(['cap', 'add', 'android']);
}
call(['cap', 'sync', 'android']);
execFileSync(process.execPath, ['scripts/apply-icon.mjs'], { stdio: 'inherit' });
console.log('Projeto Android preparado. Execute npm run android:apk ou npm run android:open.');
