import test from 'node:test';
import assert from 'node:assert/strict';
import cloudbase from '@cloudbase/js-sdk/app';
import { registerAuth } from '@cloudbase/js-sdk/auth';
import { restoreSession } from '../src/session.ts';

registerAuth(cloudbase);
const visitor = { data: { session: { user: { is_anonymous: true } } }, error: null };

test('真实 SDK 首次访问无凭据时仍会进入访客登录流程', async t => {
  const app = cloudbase.init({ env: 'session-regression-test', region: 'ap-shanghai', persistence: 'local' });
  t.after(() => app.auth.oauthInstance.oauth2client.destroy());
  const current = await app.auth.getSession();
  assert.equal(current.error?.code, 'unauthenticated');
  let signIns = 0;
  await restoreSession({
    getSession: () => app.auth.getSession(),
    signInAnonymously: async () => { signIns++; return visitor; },
  });
  assert.equal(signIns, 1);
});

test('空会话自动建立访客身份；已有管理员会话不会被替换', async () => {
  for (const session of [null, { user: { id: 'admin', is_anonymous: false } }]) {
    let signIns = 0;
    await restoreSession({
      getSession: async () => ({ data: { session }, error: null }),
      signInAnonymously: async () => { signIns++; return visitor; },
    });
    assert.equal(signIns, session ? 0 : 1);
  }
});

test('网络、域名、账号状态等真实错误不会触发匿名回退或被隐藏', async () => {
  for (const code of ['unreachable', 'permission_denied', 'user_blocked', 'unknown']) {
    const error = { code };
    await assert.rejects(restoreSession({
      getSession: async () => ({ data: { session: null }, error }),
      signInAnonymously: async () => { assert.fail('不应替换会话'); },
    }), e => e.cause === error);
  }
});

test('访客登录被禁用或未返回会话时不能继续加载云端数据', async () => {
  const error = { code: 'login_type_disabled' };
  for (const result of [{ data: { session: null }, error }, { data: { session: null }, error: null }]) {
    await assert.rejects(restoreSession({
      getSession: async () => ({ data: { session: null }, error: { code: 'unauthenticated' } }),
      signInAnonymously: async () => result,
    }), e => result.error ? e.cause === error : /未能连接/.test(e.message));
  }
});
