import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const res = join('android', 'app', 'src', 'main', 'res');
if (!existsSync(res)) process.exit(0);
const source = join('www', 'icon-512.png');
for (const d of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
  const dir = join(res, `mipmap-${d}`); mkdirSync(dir, {recursive:true});
  for (const icon of ['ic_launcher.png','ic_launcher_round.png'])
    copyFileSync(source,join(dir,icon));
}
const draw = join(res,'drawable-nodpi');mkdirSync(draw,{recursive:true});
copyFileSync(source,join(draw,'ascensao_icon.png'));
const anydpi=join(res,'mipmap-anydpi-v26');mkdirSync(anydpi,{recursive:true});
const adaptive=`<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@android:color/black"/><foreground android:drawable="@drawable/ascensao_icon"/></adaptive-icon>\n`;
writeFileSync(join(anydpi,'ic_launcher.xml'),adaptive);
writeFileSync(join(anydpi,'ic_launcher_round.xml'),adaptive);
console.log('Ícone ASCENSÃO aplicado ao Android.');
