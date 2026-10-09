import cloudbase from '@cloudbase/js-sdk/app';
import { registerAuth } from '@cloudbase/js-sdk/auth';
import { registerFunctions } from '@cloudbase/js-sdk/functions';
import { registerStorage } from '@cloudbase/js-sdk/storage';
import { restoreSession } from './session';

registerAuth(cloudbase);
registerFunctions(cloudbase);
registerStorage(cloudbase);
const env = import.meta.env.VITE_CLOUDBASE_ENV_ID;
if (!env) throw new Error('尚未配置 CloudBase 环境 ID，请联系冒险发起人。');
export const cloud = cloudbase.init({ env, region: 'ap-shanghai', persistence: 'local' });
let sessionPromise: Promise<void> | null = null;
export function ensureSession() {
  return sessionPromise ??= restoreSession(cloud.auth).finally(() => { sessionPromise = null; });
}
