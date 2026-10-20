import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import site from './src/site.config.ts';

// The site can also be served from GitHub Pages under a sub-path until the domain is bought:
//   PAGES_BASE=/rolling-offset-calculator/ PAGES_SITE=https://abhimishra01.github.io npm run build
// Defaults build for the real domain at the root.
export default defineConfig({
  site: process.env.PAGES_SITE || `https://${site.domain}`,
  base: process.env.PAGES_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
