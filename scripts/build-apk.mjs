import { existsSync, chmodSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import process from 'node:process';
if (!existsSync('android')) {
  console.error('O projeto Android ainda não existe. Execute npm run android:init primeiro.');
  process.exit(1);
}
execFileSync(process.execPath, ['scripts/sync-android.mjs'], { stdio: 'inherit' });
const wrapper = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const absolute = join(process.cwd(), 'android', process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
if (process.platform !== 'win32') chmodSync(absolute, 0o755);
execFileSync(wrapper, ['assembleDebug', '--no-daemon'], { stdio: 'inherit', cwd: join(process.cwd(), 'android'), shell: process.platform === 'win32' });
console.log('\nAPK de teste: android/app/build/outputs/apk/debug/app-debug.apk');
