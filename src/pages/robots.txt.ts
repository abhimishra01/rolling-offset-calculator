import type { APIRoute } from 'astro';
import site from '../site.config.ts';
import { url } from '../lib/url.ts';
export const GET: APIRoute = ({ site: origin }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(url('sitemap-index.xml'), origin ?? `https://${site.domain}`).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
