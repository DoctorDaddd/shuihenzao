const cloudbase = require('@cloudbase/node-sdk');
const { createService, QuestError, hash } = require('./domain');
const { validateImage } = require('./media');

function databaseStore(db) {
  return { transaction: fn => db.runTransaction(tx => fn({
    async get(collection, id) {
      const result = await tx.collection(collection).doc(id).get();
      const row = Array.isArray(result.data) ? result.data[0] : result.data;
      if (!row) return null;
      const { _id, ...data } = row;
      return data;
    },
    set: (collection, id, data) => tx.collection(collection).doc(id).set(data),
  })) };
}
function cloudStorage(app, env) {
  return {
    async uploadMetadata(cloudPath) {
      const { data } = await app.getUploadMetadata({ cloudPath });
      if (!data?.url || !data.token || !data.authorization || !data.fileId || !data.cosFileId) throw new Error('UPLOAD_METADATA_FAILED');
      return { url: data.url, token: data.token, authorization: data.authorization, fileID: data.fileId, cosFileId: data.cosFileId };
    },
    async urls(ids) {
      if (!ids.length) return {};
      const result = await app.getTempFileURL({ fileList: [...new Set(ids)].map(fileID => ({ fileID, maxAge: 3600 })) });
      const output = {};
      for (const f of result.fileList) {
        if (!f.tempFileURL) throw new Error('MEDIA_URL_FAILED');
        output[f.fileID] = f.tempFileURL;
      }
      return output;
    },
    async finalize(fileID, ticket, ticketId) {
      if (typeof fileID !== 'string' || !fileID.startsWith(`cloud://${env}.`) || fileID.slice(fileID.indexOf('/', 8) + 1) !== ticket.cloudPath) throw new QuestError('上传文件不属于本次冒险。', 'FORBIDDEN');
      // Only server-generated storage URLs are read. Stream with a hard byte limit.
      const urls = await this.urls([fileID]);
      const response = await fetch(urls[fileID], { signal: AbortSignal.timeout(20000), redirect: 'error' });
      if (!response.ok || !response.body) throw new Error('MEDIA_DOWNLOAD_FAILED');
      const chunks = []; let size = 0;
      for await (const chunk of response.body) {
        size += chunk.length;
        if (size > ticket.size) throw new QuestError('图片超过本次上传大小。');
        chunks.push(chunk);
      }
      const bytes = Buffer.concat(chunks);
      const { thumbnail, extension } = await validateImage(bytes, ticket);
      const base = `artworks/${ticketId}`;
      const original = await app.uploadFile({ cloudPath: `${base}/original.${extension}`, fileContent: bytes });
      const small = await app.uploadFile({ cloudPath: `${base}/thumbnail.webp`, fileContent: thumbnail });
      return { fileID: original.fileID, thumbnailID: small.fileID, sha256: ticket.sha256 };
    },
  };
}
exports.main = async event => {
  const env = process.env.TCB_ENV || process.env.SCF_NAMESPACE;
  const app = cloudbase.init({ env, region: 'ap-shanghai' });
  const userInfo = app.auth().getUserInfo();
  const user = { uid: userInfo.uid, anonymous: userInfo.isAnonymous };
  const action = typeof event?.path === 'string' ? event.path.split('/')[0].slice(0,25) : 'invalid';
  try {
    if (!env) throw new Error('ENV_NOT_CONFIGURED');
    const data = await createService(databaseStore(app.database()), cloudStorage(app, env)).handle(user, event);
    if (action !== 'state') console.info(JSON.stringify({ event: 'quest_action', action, actor: user.uid ? hash(user.uid).slice(0,12) : null, status: 'ok' }));
    return { data, error: null };
  } catch (error) {
    const code = error instanceof QuestError ? error.code : 'SERVICE_ERROR';
    console.error(JSON.stringify({ event: 'quest_action', action, actor: user.uid ? hash(user.uid).slice(0,12) : null, status: 'failed', code }));
    return { data: null, error: { code, message: error instanceof QuestError ? error.message : '云端服务暂时未能完成，请稍后重试。' } };
  }
};
exports.databaseStore = databaseStore;
exports.cloudStorage = cloudStorage;
