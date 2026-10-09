import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { validateBackup } from '../lib/backup.mjs';
const require = createRequire(import.meta.url);
const { createService, initialState, config, hash } = require('../cloudfunctions/quest-api/domain.js');
const { validateImage } = require('../cloudfunctions/quest-api/media.js');
const { databaseStore, cloudStorage } = require('../cloudfunctions/quest-api/index.js');
const sharp = require('sharp');
const hero = { uid: 'hero', anonymous: false }, admin = { uid: 'admin', anonymous: false }, visitor = { uid: 'visitor', anonymous: true };
function fixture() {
  let data = { quest_state: { main: initialState() }, quest_roles: { hero: { role: 'hero', active: true }, admin: { role: 'admin', active: true } } };
  let queue = Promise.resolve();
  const store = { transaction(fn) {
    const run = queue.then(async () => {
      const draft = structuredClone(data);
      const result = await fn({ get: async (c, id) => draft[c]?.[id] ?? null, set: async (c, id, value) => { (draft[c] ??= {})[id] = structuredClone(value); } });
      data = draft; return result;
    }); queue = run.then(() => {}, () => {}); return run;
  } };
  const files = new Map();
  const service = createService(store, {
    async urls(ids) { return Object.fromEntries(ids.map(id => [id, `https://storage.example/${id}`])); },
    async finalize(id, ticket, ticketId) {
      if (id !== ticket.cloudPath) throw new Error('INVALID_FILE');
      await validateImage(files.get(id), ticket);
      return { fileID: `artworks/${ticketId}/original`, thumbnailID: `artworks/${ticketId}/thumbnail`, sha256: ticket.sha256 };
    },
  });
  const api = (path, body = {}, user = hero, method = 'POST') => service.handle(user, { path, body, method });
  async function prepare(n, extra = {}, user = hero) {
    const bytes = await sharp({ create: { width: 10, height: 10, channels: 3, background: { r: n, g: 50, b: 90 } } }).png().toBuffer();
    const input = { request_id: randomUUID(), expectedNode: n, sha256: hash(bytes), size: bytes.length, type: 'image/png', ...extra };
    const ticket = await api('prepare', input, user); files.set(ticket.cloudPath, bytes);
    return { ticket, input, finish: () => api('complete', { ticketId: ticket.ticketId, fileID: ticket.cloudPath }, user) };
  }
  return { api, prepare, data: () => data, store, files };
}
test('新环境为 0/25；金额、未解锁信件和草稿不会泄漏给访客或勇者', async () => {
  const f = fixture(), s = await f.api('state', {}, visitor);
  assert.equal(s.artworks.length, 0); assert(s.rewards.every(r => r.amount === null)); assert(s.letters.every(l => l.body === undefined));
  await f.api('letter-save', { title: '仅草稿', body: '私密内容', node: 1, published: false }, admin);
  assert.equal((await f.api('state')).letters.length, 6);
  const a = await f.api('state', {}, admin); assert.equal(a.letters.length, 7); assert(a.rewards.every(r => r.amount === null));
});
test('匿名、未授权和伪造身份均不能写入；已撤销角色立即失效', async () => {
  const f = fixture();
  for (const user of [visitor, { uid: 'stranger', anonymous: false }, { uid: 'admin', anonymous: true }]) {
    for (const path of ['prepare', 'open/3', 'letter-save', 'payment/3', 'backup', 'artworks/fake']) await assert.rejects(f.api(path, { uid: 'admin', role: 'admin' }, user), e => e.code === 'FORBIDDEN');
  }
  await assert.rejects(f.api('state', {}, { uid: '' }), e => e.code === 'UNAUTHENTICATED');
  await assert.rejects(f.api('letter-save', {}, hero), e => e.code === 'FORBIDDEN');
  await f.store.transaction(tx => tx.set('quest_roles', 'hero', { role: 'hero', active: false }));
  assert.equal((await f.api('state')).role, 'visitor');
  await assert.rejects(f.api('open/3'), e => e.code === 'FORBIDDEN');
});
test('真实图片导入两张后为 2/25，第三张解锁 100 元，开启前隐藏金额', async () => {
  const f = fixture();
  await assert.rejects(f.prepare(1, { historical: true, created_date: '2026-09-01' }), e => e.code === 'FORBIDDEN');
  for (const n of [1,2]) await (await f.prepare(n, { historical: true, created_date: `2026-09-0${n}` }, admin)).finish();
  const s = await f.api('state'); assert.equal(s.artworks.length, 2); assert(!s.rewards[0].unlocked_at); assert.equal(s.artworks[0].created_date, '2026-09-01');
  await assert.rejects(f.api('open/3'));
  await (await f.prepare(3)).finish();
  assert((await f.api('state')).rewards[0].unlocked_at); assert.equal((await f.api('state')).rewards[0].amount, null);
  await f.api('open/3'); const first = (await f.api('state')).rewards[0]; assert.equal(first.amount, 100); assert.equal(first.paid_at, null);
  await f.api('open/3'); assert.equal((await f.api('state')).rewards[0].opened_at, first.opened_at);
  await assert.rejects(f.api('payment/3', { date: '2026-10-09' }), e => e.code === 'FORBIDDEN');
  await f.api('payment/3', { date: '2026-10-09' }, admin);
  await assert.rejects(f.api('payment/3', { date: '2026-10-09' }, admin), e => e.code === 'CONFLICT');
});
test('重试和并发不会重复增加进度；内容相同的第二张被拦截', async () => {
  const f = fixture(), pending = await f.prepare(1);
  await Promise.all([pending.finish(), pending.finish()]);
  assert.equal((await f.api('state')).artworks.length, 1);
  assert.equal((await f.api('prepare', pending.input)).committed, true);
  await assert.rejects(f.api('prepare', { ...pending.input, title: '改动' }), e => e.code === 'CONFLICT');
  await assert.rejects(f.prepare(1, { expectedNode: 2 }), e => e.code === 'DUPLICATE');
  const second = await f.prepare(2), competitor = await f.prepare(3, { expectedNode: 2 });
  const results = await Promise.allSettled([second.finish(), competitor.finish()]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1); assert.equal((await f.api('state')).artworks.length, 2);
});
test('图片实际内容和签名被验证，撤权后不能完成已准备的上传', async () => {
  const f = fixture(), pending = await f.prepare(1);
  f.files.set(pending.ticket.cloudPath, Buffer.from('<svg onload="alert(1)"/>'));
  await assert.rejects(pending.finish()); assert.equal((await f.api('state')).artworks.length, 0);
  await assert.rejects(f.api('complete', { ticketId: pending.ticket.ticketId, fileID: pending.ticket.cloudPath }, admin), e => e.code === 'FORBIDDEN');
  await f.store.transaction(tx => tx.set('quest_roles', 'hero', { role: 'hero', active: false }));
  await assert.rejects(pending.finish(), e => e.code === 'FORBIDDEN');
});
test('只收起最后一张，保留奖励历史、原图引用和归档；修改不会增加进度', async () => {
  const f = fixture(); for (const n of [1,2,3]) await (await f.prepare(n)).finish();
  await f.api('open/3'); const s = await f.api('state'), last = s.artworks.at(-1);
  await assert.rejects(f.api('artworks/' + s.artworks[0].id, {}, hero, 'DELETE'));
  await f.api('artworks/' + last.id, { version: 1, title: '新标题' });
  await assert.rejects(f.api('artworks/' + last.id, { version: 1, title: '过期修改' }), e => e.code === 'CONFLICT');
  assert.equal((await f.api('state')).artworks.length, 3);
  await f.api('artworks/' + last.id, {}, hero, 'DELETE');
  const next = await f.api('state'); assert.equal(next.artworks.length, 2); assert.equal(next.rewards[0].amount, 100); assert(next.rewards[0].opened_at); assert.equal(Object.values(f.data().quest_archive).length, 1);
});
test('25 个关卡及 1500 元配置完整，通关不能继续上传', async () => {
  const f = fixture();
  assert.equal(config.milestones.reduce((n, r) => n + r.amount, 0), 1500);
  for (let n = 1; n <= 25; n++) await (await f.prepare(n)).finish();
  for (const r of config.milestones) await f.api('open/' + r.node);
  const s = await f.api('state'); assert.equal(s.artworks.length, 25); assert.equal(s.rewards.reduce((n, r) => n + r.amount, 0), 1500);
  await assert.rejects(f.prepare(26));
});
test('无效日期、过大图片、过期票据、未来节点和非法文件地址被拒绝', async () => {
  const f = fixture();
  for (const extra of [{ size: 10485761 }, { type: 'image/svg+xml' }, { created_date: '2026-02-30' }, { expectedNode: 5 }]) await assert.rejects(f.prepare(1, extra));
  const pending = await f.prepare(1);
  await f.store.transaction(async tx => { const t = await tx.get('quest_uploads', pending.ticket.ticketId); await tx.set('quest_uploads', pending.ticket.ticketId, { ...t, expires: 0 }); });
  await assert.rejects(pending.finish(), e => e.code === 'EXPIRED');
  const storage = cloudStorage({}, 'env');
  for (const fileID of ['https://evil.example/file', 'cloud://other.bucket/staging/hero/ticket/original', 'cloud://env.bucket/artworks/original']) await assert.rejects(storage.finalize(fileID, { cloudPath: 'staging/hero/ticket/original' }, 'ticket'), e => e.code === 'FORBIDDEN');
});
test('缩略图为真实 WebP，原图不被改写；伪装 SVG 不通过', async () => {
  const original = await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#506745' } }).png().toBuffer();
  const checksum = hash(original), t = { size: original.length, sha256: checksum, type: 'image/png' };
  const { thumbnail } = await validateImage(original, t), metadata = await sharp(thumbnail).metadata();
  assert.equal(metadata.format, 'webp'); assert.equal(metadata.width, 720); assert.equal(metadata.height, 480); assert.equal(hash(original), checksum);
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
  await assert.rejects(validateImage(svg, { size: svg.length, sha256: hash(svg), type: 'image/png' }));
});
test('CloudBase 数据库适配器兼容文档返回格式且不把 _id 传给 set', async () => {
  for (const data of [[{ _id: 'x', value: 1 }], { _id: 'x', value: 1 }, []]) {
    const calls = [], adapter = databaseStore({ runTransaction: fn => fn({ collection: c => ({ doc: id => ({ get: async () => ({ data }), set: async value => calls.push([c,id,value]) }) }) }) });
    await adapter.transaction(async tx => { assert.deepEqual(await tx.get('table', 'x'), Array.isArray(data) && !data.length ? null : { value: 1 }); await tx.set('table', 'x', { value: 2 }); });
    assert.deepEqual(calls, [['table','x',{ value: 2 }]]);
  }
});
test('恢复前拒绝缺失图片、路径穿越、重复文件和错误进度的备份', () => {
  const state = { _id: 'main', ...initialState(), artworks: [{ id: 'a', node: 1, version: 1, fileID: 'original', thumbnailID: 'small' }] };
  const manifest = { schemaVersion: 1, sourceEnv: 'old', tables: { quest_state: [state], quest_archive: [] }, files: ['original', 'small'].map(id => ({ id, name: hash(id) + '.bin', sha256: hash('bytes'), size: 5 })) };
  assert.equal(validateBackup(manifest), state);
  const missing = structuredClone(manifest); missing.files.pop(); assert.throws(() => validateBackup(missing));
  const traversal = structuredClone(manifest); traversal.files[0].name = '../image.bin'; assert.throws(() => validateBackup(traversal));
  const duplicate = structuredClone(manifest); duplicate.files.push(duplicate.files[0]); assert.throws(() => validateBackup(duplicate));
  const wrong = structuredClone(manifest); wrong.tables.quest_state[0].artworks[0].node = 3; assert.throws(() => validateBackup(wrong));
});
