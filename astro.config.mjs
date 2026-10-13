import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jowidy.github.io',
  base: '/force-multiplier-preview',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { format: 'directory' },
});
