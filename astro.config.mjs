import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { rm } from 'node:fs/promises';
import site from './src/site.config.ts';

// The site can also be served from GitHub Pages under a sub-path until the domain is bought:
//   PAGES_BASE=/rolling-offset-calculator/ PAGES_SITE=https://abhimishra01.github.io npm run build
// Defaults build for the real domain at the root.
const bingemind = site.bingemind;
// The Bingemind root owns robots.txt, so this mode does not emit one.
const dropRobots = { name: 'drop-robots', hooks: { 'astro:build:done': async ({ dir }) => {
  if (bingemind) await rm(new URL('robots.txt', dir), { force: true });
} } };

export default defineConfig({
  site: bingemind ? 'https://bingemind.com' : process.env.PAGES_SITE || 'https://bingemind.com',
  base: bingemind ? `/rolling-offset-calculator/` : process.env.PAGES_BASE || '/',
  outDir: bingemind ? 'dist-bingemind' : 'dist',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap(), dropRobots],
  vite: { plugins: [tailwindcss()] },
});
