import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';
import { validateBackup } from '../lib/backup.mjs';
const require = createRequire(import.meta.url);
const cloudbase = require('@cloudbase/node-sdk');
const { initialState, hash } = require('../cloudfunctions/quest-api/domain.js');
const { databaseStore } = require('../cloudfunctions/quest-api/index.js');
const command = process.argv[2];
const env = process.env.TCB_ENV;
if (!['init', 'backup', 'restore'].includes(command) || !env) throw new Error('用法：设置 TCB_ENV，然后执行 cloudbase:init / cloudbase:backup / cloudbase:restore。');
if (command !== 'backup' && process.env.QUEST_CONFIRM_ENV !== env) throw new Error('写入前必须设置 QUEST_CONFIRM_ENV，与目标环境 ID 完全一致。');
if (!process.env.TCB_SECRET_ID || !process.env.TCB_SECRET_KEY) throw new Error('仅在本机受信任终端提供 TCB_SECRET_ID / TCB_SECRET_KEY（可选 TCB_SESSION_TOKEN）。不要把凭据发到聊天或写入前端。也可按 README 在控制台初始化。');
const app = cloudbase.init({ env, region: 'ap-shanghai', secretId: process.env.TCB_SECRET_ID, secretKey: process.env.TCB_SECRET_KEY, sessionToken: process.env.TCB_SESSION_TOKEN });
const db = app.database(), store = databaseStore(db);
const collections = ['quest_state', 'quest_roles', 'quest_uploads', 'quest_archive'];
async function all(collection) {
  const rows = [];
  for (let skip = 0;; skip += 100) {
    const result = await db.collection(collection).orderBy('_id', 'asc').skip(skip).limit(100).get();
    rows.push(...result.data);
    if (result.data.length < 100) return rows;
  }
}
async function requireEmpty() {
  for (const collection of collections) if ((await db.collection(collection).limit(1).get()).data.length) throw new Error('目标数据库不是空的，拒绝初始化或覆盖。请选择全新测试/恢复环境。');
}
if (command === 'init') {
  await requireEmpty();
  await store.transaction(async tx => {
    if (await tx.get('quest_state', 'main')) throw new Error('已有冒险记录，拒绝覆盖。');
    await tx.set('quest_state', 'main', initialState());
  });
  console.log('初始化完成：0/25。请在控制台为实名确认的账号 UID 配置角色。');
} else if (command === 'backup') {
  const output = resolve('cloudbase-backups', `${env}-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  await mkdir(join(output, 'files'), { recursive: true });
  const tables = {};
  for (const c of collections) tables[c] = await all(c);
  const state = tables.quest_state.find(s => s._id === 'main');
  if (!state) throw new Error('没有已初始化的冒险可供备份。');
  const ids = [...new Set([...state.artworks, ...tables.quest_archive].flatMap(a => [a.fileID, a.thumbnailID]))];
  const files = [];
  for (const id of ids) {
    const { fileContent } = await app.downloadFile({ fileID: id });
    if (!fileContent?.length) throw new Error('备份图片下载失败。');
    const name = hash(id) + '.bin'; await writeFile(join(output, 'files', name), fileContent, { flag: 'wx' });
    files.push({ id, name, sha256: hash(fileContent), size: fileContent.length });
  }
  const current = (await all('quest_state')).find(s => s._id === 'main');
  if (current.revision !== state.revision) throw new Error('备份期间冒险发生更新，此目录不完整。请暂停编辑后重新备份。');
  await writeFile(join(output, 'manifest.json'), JSON.stringify({ schemaVersion: 1, sourceEnv: env, region: 'ap-shanghai', createdAt: new Date().toISOString(), tables, files }, null, 2), { flag: 'wx' });
  console.log(`完整备份已写入 ${output}（${files.length} 个图片文件）。请将该目录复制到独立备份介质。`);
} else {
  const input = process.argv[3];
  if (!input) throw new Error('请提供完整备份目录。');
  const source = resolve(input), manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
  const state = validateBackup(manifest);
  if (manifest.sourceEnv === env) throw new Error('只支持恢复到另一个空环境，禁止覆盖原环境。');
  await requireEmpty();
  // Validate every local file before the first cloud write.
  for (const file of manifest.files) {
    if (basename(file.name) !== file.name || !/^[a-f0-9]{64}\.bin$/.test(file.name)) throw new Error('备份路径无效。');
    const bytes = await readFile(join(source, 'files', file.name));
    if (hash(bytes) !== file.sha256 || bytes.length !== file.size) throw new Error('备份文件校验失败，未执行恢复。');
  }
  const map = new Map();
  for (const file of manifest.files) {
    const uploaded = await app.uploadFile({ cloudPath: `restored/${file.sha256}/${file.name}`, fileContent: await readFile(join(source, 'files', file.name)) });
    map.set(file.id, uploaded.fileID);
  }
  const remap = art => ({ ...art, fileID: map.get(art.fileID), thumbnailID: map.get(art.thumbnailID) });
  const { _id, ...restored } = state;
  restored.artworks = state.artworks.map(remap);
  // No identity transfer: CloudBase users belong to their original environment.
  // Recreate accounts and grant roles explicitly in the target console after recovery.
  await store.transaction(async tx => {
    if (await tx.get('quest_state', 'main')) throw new Error('目标环境已出现数据，停止恢复。');
    for (const row of manifest.tables.quest_archive) { const { _id, ...data } = remap(row); await tx.set('quest_archive', _id, data); }
    await tx.set('quest_state', 'main', restored);
  });
  console.log('已恢复画作、奖励、信件和归档。尚未授权任何账号；请在新环境创建账号并配置角色，再进行验收。未恢复过期上传票据。');
}
