import { defineConfig } from 'astro/config';

const target = process.env.PUBLIC_SITE_TARGET || 'preview';
if (!['preview', 'staging', 'production'].includes(target)) {
  throw new Error(`Unknown PUBLIC_SITE_TARGET: ${target}`);
}
const isPreview = target === 'preview';

export default defineConfig({
  site: isPreview ? 'https://jowidy.github.io' : 'https://www.forcemultiplier.work',
  base: isPreview ? '/force-multiplier-preview' : '/',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { format: 'directory' },
  vite: { define: { 'import.meta.env.PUBLIC_SITE_TARGET': JSON.stringify(target) } },
});
