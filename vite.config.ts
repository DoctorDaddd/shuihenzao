import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import deployment from './cloudbaserc.json';
export default defineConfig(async ({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const local = command === 'serve' && mode !== 'production' && env.VITE_BACKEND !== 'cloudbase';
  if (command === 'build' && env.VITE_BACKEND === 'local') throw new Error('生产构建禁止使用本地测试后端。');
  if (env.VITE_CLOUDBASE_REGION && env.VITE_CLOUDBASE_REGION !== 'ap-shanghai') throw new Error('此项目目标地域为 ap-shanghai。');
  return {
    plugins: [react(), ...(local ? [(await import('./scripts/local-preview.mjs')).localPreview()] : [])],
    resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
    define: {
      'import.meta.env.VITE_BACKEND': JSON.stringify(local ? 'local' : 'cloudbase'),
      'import.meta.env.VITE_CLOUDBASE_ENV_ID': JSON.stringify(env.VITE_CLOUDBASE_ENV_ID || deployment.envId),
    },
    server: { host: '127.0.0.1', port: 5175, strictPort: true },
    preview: { host: '127.0.0.1', port: 5175, strictPort: true },
    build: { sourcemap: false, target: 'es2022', assetsDir: 'assets' },
  };
});
