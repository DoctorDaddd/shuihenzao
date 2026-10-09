const { createHash, randomUUID } = require('node:crypto');
const config = require('./quest.config.json');

class QuestError extends Error {
  constructor(message, code = 'INVALID_INPUT') { super(message); this.code = code; }
}
const fail = (message, code) => { throw new QuestError(message, code); };
const hash = value => createHash('sha256').update(value).digest('hex');
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
function text(value, max, required = false) {
  if (value == null) value = '';
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail('请检查文字内容和长度。');
  return value.trim();
}
function date(value) {
  const parsed = new Date(value + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== value) fail('请填写有效的创作日期。');
  return value;
}
function fields(input, node) {
  return { title: text(input.title, 100) || `第 ${node} 次冒险`, created_date: date(text(input.created_date, 10) || today()), mood: text(input.mood, 40), note: text(input.note, 2000) };
}
function initialState() {
  return {
    schemaVersion: config.schemaVersion, revision: 0, artworks: [],
    rewards: config.milestones.map(r => ({ ...r, unlocked_at: null, opened_at: null, paid_at: null, payment_note: '' })),
    letters: config.milestones.map(r => ({ id: `welcome-${r.node}`, node: r.node, title: r.name + ' · 给勇者的信', body: `亲爱的画笔勇者：\n\n谢谢你为这个世界留下第 ${r.node} 份色彩。每一次尝试，都值得被好好珍藏。\n\n不必着急，也不必和任何人比较。无论过去多久，这片世界都欢迎你回来。\n\n—— 一直为你加油的人`, published: 1, read_at: null })),
  };
}
const roleOf = (record, user) => !user.anonymous && record?.active === true && ['hero', 'admin'].includes(record.role) ? record.role : 'visitor';
const writable = role => { if (!['hero', 'admin'].includes(role)) fail('请使用已获授权的勇者账号登录。', 'FORBIDDEN'); };
const admin = role => { if (role !== 'admin') fail('这项操作需要冒险发起人权限。', 'FORBIDDEN'); };
const letterUnlocked = (s, l) => s.artworks.length >= l.node || !!l.read_at || s.rewards.some(r => r.node === l.node && r.unlocked_at);
function publicState(s, role, uid) {
  return {
    role, uid, revision: s.revision, artworks: s.artworks.map(({ fileID, thumbnailID, sha256, ...art }) => art),
    rewards: s.rewards.map(r => ({ ...r, amount: r.opened_at ? r.amount : null, payment_note: role === 'admin' ? r.payment_note : '' })),
    letters: s.letters.filter(l => role === 'admin' || l.published).map(l => ({ ...l, body: role === 'admin' || letterUnlocked(s, l) ? l.body : undefined, unlocked: letterUnlocked(s, l) })),
  };
}

// One bounded aggregate (25 artworks, at most 20 letters) keeps node/reward changes atomic.
// Split collections only if this becomes a multi-adventure product.
function createService(store, storage) {
  async function transaction(user, callback) {
    if (!user?.uid) fail('请先建立登录会话。', 'UNAUTHENTICATED');
    return store.transaction(async tx => {
      const role = roleOf(await tx.get('quest_roles', user.uid), user);
      const state = await tx.get('quest_state', 'main');
      if (!state) fail('冒险环境尚未初始化，请联系冒险发起人。', 'NOT_INITIALIZED');
      return callback(tx, state, role);
    });
  }
  async function handle(user, event) {
    if (!event || typeof event.path !== 'string' || event.path.length > 120 || JSON.stringify(event).length > 30000) fail('请求格式不正确。');
    const [action, id] = event.path.split('/');
    const input = event.body ?? {};
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('请求格式不正确。');
    if (action === 'state') {
      const { state, result } = await transaction(user, async (_tx, state, role) => ({ state, result: publicState(state, role, user.uid) }));
      const urls = await storage.urls(state.artworks.flatMap(a => [a.fileID, a.thumbnailID]));
      result.artworks = result.artworks.map((a, i) => ({ ...a, imageUrl: urls[state.artworks[i].fileID], thumbnailUrl: urls[state.artworks[i].thumbnailID] }));
      return result;
    }
    if (action === 'prepare') {
      return transaction(user, async (tx, state, role) => {
        writable(role);
        if (!/^[\w-]{20,80}$/.test(input.request_id ?? '') || !/^[a-f0-9]{64}$/.test(input.sha256 ?? '')) fail('上传标识无效。');
        if (!Number.isInteger(input.size) || input.size < 1 || input.size > config.maxImageBytes || !['image/png', 'image/jpeg', 'image/webp'].includes(input.type)) fail('请选择 10 MB 以内的 JPG、PNG 或 WebP 图片。');
        const ticketId = hash(user.uid + ':' + input.request_id);
        const fingerprint = hash(JSON.stringify(input));
        const previous = await tx.get('quest_uploads', ticketId);
        if (previous) {
          if (previous.fingerprint !== fingerprint) fail('这次上传的信息已改变，请重新选择图片后提交。', 'CONFLICT');
          if (!previous.committed && previous.expires < Date.now()) fail('上传已过期，请重新选择图片。', 'EXPIRED');
          return { ticketId, cloudPath: previous.cloudPath, committed: !!previous.committed };
        }
        const art = input.artworkId ? state.artworks.find(a => a.id === input.artworkId) : null;
        if (input.artworkId && !art) fail('作品已不存在，请刷新。', 'CONFLICT');
        if (art ? input.version !== art.version : input.expectedNode !== state.artworks.length + 1) fail('进度已在其他设备更新，请刷新后再试。', 'CONFLICT');
        if (!art && state.artworks.length >= config.maxArtworks) fail('25 次冒险已经完成。');
        if (input.historical) { admin(role); if (art || state.artworks.length >= 2 || !input.created_date) fail('历史导入仅用于前两张作品，请填写实际日期。'); }
        if (state.artworks.some(a => a.sha256 === input.sha256 && a.id !== art?.id)) fail('这张画已经珍藏过了，请选择另一张作品。', 'DUPLICATE');
        const cloudPath = `staging/${user.uid}/${ticketId}/original`;
        await tx.set('quest_uploads', ticketId, { uid: user.uid, fingerprint, cloudPath, expires: Date.now() + 3600000, artworkId: art?.id ?? null, version: art?.version ?? null, expectedNode: state.artworks.length + 1, historical: !!input.historical, fields: fields(input, art?.node ?? state.artworks.length + 1), sha256: input.sha256, size: input.size, type: input.type, committed: false });
        return { ticketId, cloudPath, committed: false };
      });
    }
    if (action === 'complete') {
      if (!/^[a-f0-9]{64}$/.test(input.ticketId ?? '')) fail('上传标识无效。');
      const ticket = await transaction(user, async (tx, _state, role) => {
        writable(role);
        const t = await tx.get('quest_uploads', input.ticketId);
        if (!t || t.uid !== user.uid) fail('不能提交其他人的上传。', 'FORBIDDEN');
        if (!t.committed && t.expires < Date.now()) fail('上传已过期，请重新选择图片。', 'EXPIRED');
        return t;
      });
      if (ticket.committed) return { ok: true, id: ticket.artworkId };
      const media = await storage.finalize(input.fileID, ticket, input.ticketId);
      return transaction(user, async (tx, state, role) => {
        writable(role);
        const current = await tx.get('quest_uploads', input.ticketId);
        if (current.committed) return { ok: true, id: current.artworkId };
        if (current.historical) admin(role);
        const art = ticket.artworkId ? state.artworks.find(a => a.id === ticket.artworkId) : null;
        if (ticket.artworkId ? !art || art.version !== ticket.version : state.artworks.length + 1 !== ticket.expectedNode) fail('进度已在其他设备更新，请刷新后再试。', 'CONFLICT');
        if (state.artworks.some(a => a.sha256 === media.sha256 && a.id !== art?.id)) fail('这张画已经珍藏过了。', 'DUPLICATE');
        const now = new Date().toISOString();
        const saved = { ...ticket.fields, ...media, id: art?.id ?? input.ticketId, node: art?.node ?? ticket.expectedNode, version: (art?.version ?? 0) + 1, uploaded_at: art?.uploaded_at ?? now };
        if (art) {
          await tx.set('quest_archive', `${art.id}-${art.version}`, { ...art, archived_at: now, reason: 'replaced' });
          state.artworks[state.artworks.indexOf(art)] = saved;
        } else state.artworks.push(saved);
        for (const r of state.rewards) if (!r.unlocked_at && state.artworks.length >= r.node) r.unlocked_at = now;
        state.revision++;
        await tx.set('quest_state', 'main', state);
        await tx.set('quest_uploads', input.ticketId, { ...current, committed: true, artworkId: saved.id });
        return { ok: true, id: saved.id };
      });
    }
    return transaction(user, async (tx, state, role) => {
      writable(role);
      if (action === 'backup') { admin(role); return { schemaVersion: 1, exported_at: new Date().toISOString(), state }; }
      if (action === 'artworks') {
        const art = state.artworks.find(a => a.id === id);
        if (!art) fail('找不到这张作品。');
        if (event.method === 'DELETE') {
          if (state.artworks.at(-1).id !== id) fail('只能收起最后一张作品。');
          await tx.set('quest_archive', `${art.id}-${art.version}`, { ...art, archived_at: new Date().toISOString(), reason: 'deleted' });
          state.artworks.pop();
        } else {
          if (input.version !== art.version) fail('作品已更新，请刷新后再试。', 'CONFLICT');
          Object.assign(art, fields(input, art.node), { version: art.version + 1 });
        }
      } else if (action === 'open' || action === 'payment') {
        const r = state.rewards.find(r => r.node === Number(id));
        if (!r?.unlocked_at) fail('这个宝箱尚未解锁。');
        if (action === 'open') r.opened_at ||= new Date().toISOString();
        else { admin(role); if (!r.opened_at) fail('请先开启宝箱。'); if (r.paid_at) fail('已记录发放，请勿重复操作。', 'CONFLICT'); r.paid_at = date(text(input.date, 10, true)); r.payment_note = text(input.note, 500); }
      } else if (action === 'read') {
        const l = state.letters.find(l => l.id === id);
        if (!l?.published || !letterUnlocked(state, l)) fail('这封信尚未解锁。');
        l.read_at ||= new Date().toISOString();
      } else if (action === 'letter-save') {
        admin(role);
        if (!Number.isInteger(input.node) || input.node < 1 || input.node > config.maxArtworks || typeof input.published !== 'boolean') fail('信件设置无效。');
        const previous = id ? state.letters.find(l => l.id === id) : null;
        if (id && !previous) fail('这封信已不存在。');
        if (!previous && state.letters.length >= 20) fail('最多保存 20 封信。');
        const l = { id: previous?.id ?? randomUUID(), node: input.node, title: text(input.title, 100, true), body: text(input.body, 10000, true), published: Number(input.published), read_at: previous?.read_at ?? null };
        if (previous) state.letters[state.letters.indexOf(previous)] = l; else state.letters.push(l);
      } else fail('不支持的冒险操作。');
      state.revision++;
      await tx.set('quest_state', 'main', state);
      return { ok: true };
    });
  }
  return { handle };
}
module.exports = { createService, initialState, config, QuestError, hash };
