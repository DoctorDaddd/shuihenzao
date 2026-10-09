import type { Artwork, QuestState } from '../lib/quest';
export const localPreview = import.meta.env.DEV && import.meta.env.VITE_BACKEND === 'local';
type Envelope<T> = { data: T; error: null | { code: string; message: string } };
export async function questApi<T = { ok: boolean }>(path: string, body: unknown = {}, method = 'POST'): Promise<T> {
  let response: Envelope<T>;
  if (localPreview) {
    const result = await fetch('/__local/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, body, method }) });
    response = await result.json();
  } else {
    const { cloud, ensureSession } = await import('./cloudbase');
    await ensureSession();
    const result = await cloud.callFunction!({ name: import.meta.env.VITE_CLOUDBASE_FUNCTION || 'quest-api', data: { path, body, method }, parse: true });
    if (!result.result || result.code) throw new Error('冒险服务暂时不可用，请稍后重试。');
    response = result.result;
  }
  if (response.error) throw new Error(response.error.message);
  return response.data;
}
export async function login(username: string, password: string) {
  if (localPreview) return questApi('login', { username, password });
  const { cloud } = await import('./cloudbase');
  const result = await cloud.auth.signInWithPassword({ username, password });
  if (result.error) throw new Error('登录失败，请检查账号和密码，或稍后再试。');
}
export async function logout() {
  if (localPreview) return questApi('logout');
  const { cloud } = await import('./cloudbase');
  const result = await cloud.auth.signOut();
  if (result && 'error' in result && result.error) throw new Error('退出管理未完成，请稍后重试。');
}
export const getState = () => questApi<QuestState>('state');
export async function saveArtwork(data: FormData, artwork: Artwork | undefined, node: number) {
  const { image, ...values } = Object.fromEntries(data);
  const fields = { ...values, historical: data.get('historical') === 'true', artworkId: artwork?.id, version: artwork?.version, expectedNode: node };
  if (!(image instanceof File) || !image.size) return questApi(`artworks/${artwork?.id}`, fields);
  const digest = await crypto.subtle.digest('SHA-256', await image.arrayBuffer());
  const sha256 = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  const ticket = await questApi<{ ticketId: string; cloudPath: string; committed: boolean }>('prepare', { ...fields, sha256, size: image.size, type: image.type });
  if (ticket.committed) return;
  let fileID: string;
  if (localPreview) {
    const upload = await fetch('/__local/upload?path=' + encodeURIComponent(ticket.cloudPath), { method: 'PUT', body: image });
    const result = await upload.json() as Envelope<{ fileID: string }>;
    if (result.error) throw new Error(result.error.message);
    fileID = result.data.fileID;
  } else {
    const { cloud } = await import('./cloudbase');
    const result = await cloud.uploadFile!({ cloudPath: ticket.cloudPath, filePath: image });
    fileID = result.fileID;
  }
  return questApi('complete', { ticketId: ticket.ticketId, fileID });
}
export async function downloadBackup() {
  const data = await questApi('backup');
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `brush-quest-${new Date().toISOString().slice(0,10)}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
