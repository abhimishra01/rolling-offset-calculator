# Rolling Offset Calculator

Free browser tool for plumbers, pipefitters and electricians. Enter the rise and roll, pick the fitting or bend angle, and it gives the true offset, travel, run and cut length (pipe) or the distance between bends, multiplier and shrink (EMT conduit). Live site: https://rollingoffsetcalculator.com (domain not bought yet).

Astro (static) and Tailwind 4. No backend. Everything runs in the browser.

## Where the logic lives

- `src/lib/offset.js`: the math (true offset, travel, run, multiplier, shrink), length parsing (`12 3/8`, `2'-3 1/2"`), 1/16 inch formatting, and the take-off tables. Each table value is read from a maker catalog or a standard, and the source is in the comment above `TAKEOFF`. PVC and copper values apply to 45 degree fittings only.
- `src/lib/inputs.js`: pure helpers for the form (custom angle parsing, fraction buttons, saved-state checks).
- `src/components/Tool.astro`: the page (markup, styles, and the script that wires the form, results and diagram).
- `src/components/Article.astro` and `src/data/faq.ts`: the SEO text and FAQ. The take-off chart in the article is built from `TAKEOFF`.
- `src/site.config.ts`: name, domain, colors, email, analytics and AdSense IDs.

## Commands

- `npm run dev`: work on the site.
- `npm test`: run the unit tests (`scripts/test.mjs`). They cover the math, parsing, formatting, take-off tables and form helpers.
- `npm run build`: build `dist/`.
- `npm run deploy`: tests, build, then upload to Cloudflare Pages (needs `npx wrangler login` once, done by the owner).

## Changing a take-off value

Do not edit a value without a catalog page or standard to cite. Update `TAKEOFF` in `src/lib/offset.js`, the source comment, and the table test in `scripts/test.mjs`. The article chart and the tool follow automatically.

## GitHub Pages

`.github/workflows/pages.yml` builds on every push to `main` with `PAGES_BASE=/rolling-offset-calculator/` and `PAGES_SITE=https://abhimishra01.github.io`, and publishes to https://abhimishra01.github.io/rolling-offset-calculator/. Canonical tags always point to the real domain. Links use `url()` from `src/lib/url.ts`, so they work at the root and under a base path. To test locally:

```
PAGES_BASE=/rolling-offset-calculator/ npx astro build --outDir dist-pages
```

Serve `dist-pages` so it is reachable under `/rolling-offset-calculator/`, then delete `dist-pages`.

## Going live on the domain

1. Buy the domain, set `domain` in `src/site.config.ts`, rebuild.
2. Add it to Cloudflare, run `npm run deploy`, add the custom domain and the www redirect.
3. Search Console and Bing Webmaster: submit `https://<domain>/sitemap-index.xml`.
4. Set `ga4` for Google Analytics. Set `adsense` later, after approval (this also writes `ads.txt`).

`public/_headers` sets `X-Robots-Tag: noindex` on the `*.pages.dev` address so it does not compete with the real domain.
