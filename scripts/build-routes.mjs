import { copyFile, mkdir } from 'node:fs/promises';

// CloudBase serves directory index files when a route is opened or refreshed.
await mkdir('dist/admin', { recursive: true });
await copyFile('dist/index.html', 'dist/admin/index.html');
