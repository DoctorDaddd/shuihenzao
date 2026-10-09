import type { Auth } from '@cloudbase/js-sdk/auth';

export async function restoreSession(auth: Pick<Auth, 'getSession' | 'signInAnonymously'>) {
  const current = await auth.getSession();
  // SDK 3.10.1 returns unauthenticated when this browser has no credentials.
  // Only that state should start a visitor session; network/config errors must stop.
  if (current.error && current.error.code !== 'unauthenticated') {
    throw new Error('无法读取登录状态，请稍后重试。', { cause: current.error });
  }
  if (!current.data?.session) {
    const result = await auth.signInAnonymously({});
    if (result.error) throw new Error('暂时无法连接冒险世界，请检查网络或联系发起人开启访客访问。', { cause: result.error });
    if (!result.data?.session) throw new Error('未能建立访客登录状态，请稍后重试。');
  }
}
