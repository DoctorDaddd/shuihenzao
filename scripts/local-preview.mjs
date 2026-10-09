import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createService, initialState, QuestError } = require('../cloudfunctions/quest-api/domain.js');
const { validateImage } = require('../cloudfunctions/quest-api/media.js');

// Loopback-only development adapter; never included in the Web bundle.
export function localPreview() {
  return { name: 'quest-local-preview', async configureServer(server) {
    const root = resolve('.local');
    await mkdir(root, { recursive: true });
    const stateFile = resolve(root, 'database.json');
    const credentialFile = resolve(root, 'access.json');
    let credentials;
    try { credentials = JSON.parse(await readFile(credentialFile, 'utf8')); }
    catch (e) { if (e.code !== 'ENOENT') throw e; credentials = { password: randomBytes(24).toString('base64url') }; await writeFile(credentialFile, JSON.stringify(credentials), { flag: 'wx' }); }
    let db;
    try { db = JSON.parse(await readFile(stateFile, 'utf8')); }
    catch (e) {
      if (e.code !== 'ENOENT') throw e;
      db = { quest_state: { main: initialState() }, quest_roles: { 'local-admin': { active: true, role: 'admin' } } };
      await writeFile(stateFile, JSON.stringify(db));
    }
    let queue = Promise.resolve();
    const store = { transaction(fn) {
      const next = queue.then(async () => {
        const draft = structuredClone(db);
        const result = await fn({ get: async (c, id) => draft[c]?.[id] ?? null, set: async (c, id, value) => { (draft[c] ??= {})[id] = structuredClone(value); } });
        await writeFile(stateFile + '.tmp', JSON.stringify(draft));
        await rename(stateFile + '.tmp', stateFile); db = draft; return result;
      });
      queue = next.then(() => undefined, () => undefined); return next;
    } };
    const filePath = path => {
      if (!/^(staging|artworks)\/[\w./-]+$/.test(path)) throw new QuestError('无效的文件路径。');
      const full = resolve(root, 'storage', path);
      if (!full.startsWith(resolve(root, 'storage') + sep)) throw new QuestError('无效的文件路径。');
      return full;
    };
    const storage = {
      async urls(ids) { return Object.fromEntries(ids.map(id => [id, '/__local/file?path=' + encodeURIComponent(id)])); },
      async finalize(fileID, ticket, ticketId) {
        if (fileID !== ticket.cloudPath) throw new QuestError('文件不属于本次上传。');
        const bytes = await readFile(filePath(fileID));
        const { thumbnail, extension } = await validateImage(bytes, ticket);
        const base = `artworks/${ticketId}`; await mkdir(filePath(base), { recursive: true });
        const original = `${base}/original.${extension}`, small = `${base}/thumbnail.webp`;
        await writeFile(filePath(original), bytes); await writeFile(filePath(small), thumbnail);
        return { fileID: original, thumbnailID: small, sha256: ticket.sha256 };
      },
    };
    const service = createService(store, storage), sessions = new Map();
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/__local/')) return next();
      res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
      const json = value => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(value)); };
      try {
        const port = server.config.server.port;
        const origin = `http://127.0.0.1:${port}`;
        if (req.headers.host !== `127.0.0.1:${port}` || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) throw new QuestError('本地预览只允许本机访问。');
        if (req.method !== 'GET' && req.headers.origin !== origin) throw new QuestError('请求来源不正确。');
        const url = new URL(req.url, origin);
        const token = req.headers.cookie?.match(/(?:^|; )quest_local=([\w-]+)/)?.[1];
        const session = sessions.get(token);
        const uid = session && session.expires > Date.now() ? session.uid : 'local-visitor';
        const user = { uid, anonymous: uid === 'local-visitor' };
        if (url.pathname === '/__local/file' && req.method === 'GET') {
          const path = url.searchParams.get('path');
          if (!path?.startsWith('artworks/')) throw new QuestError('文件不可访问。');
          const bytes = await readFile(filePath(path)); res.setHeader('Content-Type', path.endsWith('.webp') ? 'image/webp' : path.endsWith('.png') ? 'image/png' : 'image/jpeg'); res.end(bytes); return;
        }
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > (url.pathname === '/__local/upload' ? 10485760 : 30000)) throw new QuestError('请求过大。'); chunks.push(chunk); }
        const bytes = Buffer.concat(chunks);
        if (url.pathname === '/__local/upload' && req.method === 'PUT') {
          const path = url.searchParams.get('path');
          if (!path?.startsWith(`staging/${uid}/`)) throw new QuestError('文件不属于本次上传。');
          await service.authorizeUpload(user, path, bytes.length);
          await mkdir(resolve(filePath(path), '..'), { recursive: true }); await writeFile(filePath(path), bytes);
          json({ data: { fileID: path }, error: null }); return;
        }
        const event = JSON.parse(bytes.toString());
        let data;
        if (event.path === 'login') {
          const password = Buffer.from(String(event.body?.password ?? '')), expected = Buffer.from(credentials.password);
          if (event.body?.username !== 'admin' || password.length !== expected.length || !timingSafeEqual(password, expected)) throw new QuestError('本地管理员账号或密码错误。');
          const token = randomBytes(32).toString('base64url'); sessions.set(token, { uid: `local-${event.body.username}`, expires: Date.now() + 8 * 3600000 });
          res.setHeader('Set-Cookie', `quest_local=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`); data = { ok: true };
        } else if (event.path === 'logout') {
          sessions.delete(token); res.setHeader('Set-Cookie', 'quest_local=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'); data = { ok: true };
        } else data = await service.handle(user, event);
        json({ data, error: null });
      } catch (e) { res.statusCode = e instanceof QuestError ? 400 : 500; json({ data: null, error: { code: e.code || 'LOCAL_ERROR', message: e instanceof QuestError ? e.message : '本地预览请求失败，请检查开发终端。' } }); if (!(e instanceof QuestError)) console.error('local_preview_failed', e.code || e.name); }
    });
  } };
}
