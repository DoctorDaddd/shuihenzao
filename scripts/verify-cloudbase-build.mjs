import { readdir, readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
const files = await readdir('dist', { recursive: true });
assert(files.includes('index.html'));
assert(files.includes('fonts/fusion-pixel-12px-zh.woff2') || files.includes('fonts\\fusion-pixel-12px-zh.woff2'));
for (const file of files) {
  if (!(await stat('dist/' + file)).isFile()) continue;
  assert(!/(?:\.map$|\.env|database\.json|access\.json|quest\.config\.json|\.sqlite|\.db$)/i.test(file), `不应发布的文件：${file}`);
  if (/\.(?:js|css|html)$/.test(file)) {
    const text = await readFile('dist/' + file, 'utf8');
    for (const marker of ['fonts.googleapis.com', 'fonts.gstatic.com', '/__local/api', 'local-admin', 'quest_admin_password', 'TCB_SECRET_KEY', '一直为你加油的人']) assert(!text.toLowerCase().includes(marker.toLowerCase()), `构建产物包含不应发布的内容：${marker}`);
  }
}
console.log('生产产物校验通过：本地字体、无测试后端/私密信件/服务器凭证。');
