import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
if (!existsSync('android')) { console.error('Primeiro execute npm run android:init'); process.exit(1); }
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(cmd, ['cap', 'sync', 'android'], { stdio: 'inherit', shell: process.platform === 'win32' });
execFileSync(process.execPath, ['scripts/apply-icon.mjs'], { stdio: 'inherit' });
