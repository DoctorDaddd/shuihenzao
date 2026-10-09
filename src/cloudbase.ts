import cloudbase from '@cloudbase/js-sdk/app';
import { registerAuth } from '@cloudbase/js-sdk/auth';
import { registerFunctions } from '@cloudbase/js-sdk/functions';
import { registerStorage } from '@cloudbase/js-sdk/storage';

registerAuth(cloudbase);
registerFunctions(cloudbase);
registerStorage(cloudbase);
const env = import.meta.env.VITE_CLOUDBASE_ENV_ID;
if (!env) throw new Error('尚未配置 CloudBase 环境 ID，请联系冒险发起人。');
export const cloud = cloudbase.init({ env, region: 'ap-shanghai', persistence: 'local' });
let sessionPromise: Promise<void> | null = null;
export function ensureSession() {
  return sessionPromise ??= (async () => {
    const current = await cloud.auth.getSession();
    if (current.error) throw new Error('无法读取登录状态，请重新登录。');
    if (!current.data.session) {
      const result = await cloud.auth.signInAnonymously();
      if (result.error) throw new Error('暂时无法连接冒险世界，请检查网络或联系发起人开启访客访问。');
    }
  })().finally(() => { sessionPromise = null; });
}
