// Build links that work at the site root and under a base path (GitHub Pages).
// url('about/') gives "/about/" at the root, "/rolling-offset-calculator/about/" under a base.
// url() gives the home page. Never write a bare leading "/" in a link.
export function url(path = ''): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
