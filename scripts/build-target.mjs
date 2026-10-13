import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const target = process.argv[2];
if (!['preview', 'staging', 'production'].includes(target)) {
  throw new Error('Choose preview, staging or production.');
}
const cwd = fileURLToPath(new URL('../', import.meta.url));
const env = { ...process.env, PUBLIC_SITE_TARGET: target };
for (const args of [['node_modules/astro/bin/astro.mjs', 'build'], ['scripts/verify-output.mjs']]) {
  const result = spawnSync(process.execPath, args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
