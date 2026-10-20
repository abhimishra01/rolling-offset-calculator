# Fix summary: rolling-offset-calculator (Steve, 2026-10-20)

Status: `npm test` 27/27 pass. `npm run build` clean. Lighthouse (mobile and desktop, home): Performance 100, Accessibility 100, Best practices 100, SEO 100. LCP 1.1 s mobile, CLS 0.007. Screenshots (gitignored) in `screenshots/` at 1280 and 390, light and dark, plus EMT mode.

## Fixed
Take-off values (regression report, my own check of the NIBCO page and the Texas Flange B16.9 table):
- PVC: Spears 417 column J. Copper: NIBCO 606 dimension C (read from the PDF page). Steel: ASME B16.9 long radius 45 degree (7/8, 1, 1 1/8, 1 3/8, 1 3/4, 2, 2 1/2, 3 3/4). Sources are cited in the code comment above `TAKEOFF`, in a visible source line under the take-off box, and in the article chart.
- PVC and copper are offered at 45 degrees only. At other angles the box stays empty, the page says why, and the user types their own number. Steel scales from the 45 value at other angles and says "approximate". Steel notes the root gap.
- Size menu order fixed (ordered arrays, not object keys), default size 3/4 (steel 2). Tests pin every value and the order.
- Take-off box fills the exact catalog fraction (11/32), no 1/16 rounding. Notes and copy text show it exactly.
EMT: wording now says both bends lie in one plane, tilted X from the rise direction, turn the conduit 180 degrees between bends. Same in tool, article (new numbered "How to bend a rolling offset in EMT") and FAQ. Row renamed "Bend plane tilt from rise". Hidden in pipe mode. Diagram label follows the mode ("Between bends"). Run slot shows the multiplier in EMT mode.
Other accepted findings:
- Custom angle uses the strict parser (22 1/2 works, 45abc is an error), reload keeps field and answer in step, EMT reset uses 30, chips keep one tab stop.
- Typed take-off is never wiped. An invalid field blanks all results and copy, and all errors show, directly under the rise and roll hint.
- Fraction buttons set the fraction, never drop digits (12.5 is left alone with a message). Feet and inches input (2'-3 1/2"). Length cap 100000, no "-0.00".
- Diagram labels measured with getBBox, clamped inside the picture and pushed apart (checked rise 100/roll 3, 2/40, roll 0, rise 0, 1000/1: no clipping or overlap).
- Contrast: brand darkened to #a84c08, result card text pure white. Dark mode segment control clearer.
- Phone: sticky answer bar while the results are off screen. Reset button. "Copy results as text". "My number" no longer clips. Custom angle label above its field. 44 px header and footer links. Screen reader gets one short polite summary, not the whole result block.
- Content: privacy text lists the saved inputs, no upload claim, no cookie banner claim. About points to the real take-off chart. Article: take-off chart, EMT steps, "Rolling offset formula" heading, 60 degree shrink note, worked example now 11/32 gives 20.53 (20 1/2). FAQ: two new questions. Shrink per inch shows a decimal only.
- Code cleanup: dead `allowEmpty`, `cutIsShort`, `cutLength`, `digits`, no-op CSS, selector scoping, keywords meta, sitemap link, h3 rule, `as any`. Pure form logic moved to `src/lib/inputs.js` with 12 new tests. og:image width, height and alt. JSON-LD image and featureList.
Template items: README rewritten for this tool; US spelling; fixed "Last updated" (October 20, 2026); new-tool.sh removed; screenshots/ and .playwright-cli/ untracked and ignored (also dist-*, tmp-*); duplicate legal link block removed from home (footer keeps them); deploy runs npm test first; Tailwind limited to src.
Tailwind size: CSS was 115,320 bytes (21,116 gzip) before, now 25,832 bytes (about 6.6 KB gzip, two files).
GitHub Pages: `PAGES_BASE` and `PAGES_SITE` in astro.config, `url()` helper for every link, icon, manifest (relative paths) and og:image; canonical always the real domain; `.github/workflows/pages.yml` (checkout@v4, setup-node@v4 node 22, npm ci, npm test, build, upload-pages-artifact@v3, deploy-pages@v4). Verified locally under /rolling-offset-calculator/ (home, about, privacy, terms, contact, back to home, icons, manifest icons, og image all load). dist-pages deleted. Branch is main. Not pushed.

## Rejected, with reason
- Split Tool.astro, rebuild chips once, remove localStorage (minimalism 6, 7, 8): works and tested; a Reset button answers the stale-input worry. Refactor risk without user gain.
- Remove duplicated article/FAQ text (min. 15): FAQ schema must match visible text.
- Replace wrangler (min. 17), `astro check` (maint. 19): template level.
- Sticky results column on desktop (design 9): taller than a laptop screen in EMT mode, would clip.
- Print layout, maskable icon, sitemap lastmod, one-letter diagram names, `set()` rename: nice items, low value now. Print layout is a Phase 2 idea.
- PVC 1-1/4 and 2-1/2: left out. The Spears prints (3/8 and 21/32) break the size pattern, probable typos.

## For the owner
- Copper 1 inch (3/8) is as NIBCO prints it but sits low between 3/4 (11/32) and 1-1/4 (17/32). Code comment says so. Check against a second maker (Charlotte, Mueller) before a trade audience relies on it. Charlotte PVC was not found.
- EMT bend plane wording follows the owner/regression instruction. I found no bender-maker source to quote. Worth one electrician reading it.
- og.png and app icons still use the old orange (#b4540a). Re-export if you care.
- Push is for Barney; enable Pages (Source: GitHub Actions) in the repo settings.

## Phase 2 SEO pages (best 20, not built)
1. /emt-rolling-offset-calculator/ (own H1, preset to EMT)
2. /pipe-offset-take-off-chart/ (printable chart)
3. /rolling-offset-formula/
4. /45-degree-rolling-offset-calculator/
5. /30-degree-rolling-offset-calculator/
6. /22-5-degree-rolling-offset-calculator/
7. /60-degree-rolling-offset-calculator/
8. /pvc-rolling-offset-calculator/
9. /copper-rolling-offset-calculator/
10. /steel-pipe-rolling-offset-calculator/
11. /conduit-rolling-offset-bending-chart/
12. /rolling-offset-multiplier-chart/
13. /conduit-shrink-chart/
14. /rolling-offset-travel-calculator/
15. /true-offset-calculator/
16. /how-to-bend-a-rolling-offset-in-emt/
17. /rolling-offset-with-90-degree-fittings/
18. /3-4-inch-pvc-rolling-offset/ (per-size take-off pages)
19. /rolling-offset-calculator-feet-and-inches/
20. /rigid-and-imc-rolling-offset-calculator/

## Gap fix (2026-10-20)
Done:
- Gap 1: "Roll the fittings to X degrees from level (Y from plumb)" row and note in pipe mode, and in the copied text.
- Gap 2: kept the "no take-off set" hint; no silent default.
- Gap 3: PVC, copper and steel values left unchanged (no citable error found). Each material now shows its source as a link in the article and on its job page (Spears 417 column J; NIBCO 606 dimension C, page 11; ASME B16.9 via Texas Flange and Wermac). Copper 1 inch (3/8) outlier is now stated on the page.
- Gap 4: "Room for the run" input: room left over or short by, and the shallowest of 22.5, 45, 60 that fits.
- Gap 5: Copy link (numbers kept in the URL hash, share link wins on load) and Print (job ticket layout, light colors).
- Gap 6: in / mm toggle (math stays in inches; typed values convert on switch).
- Gap 7: formula line and "last checked October 20, 2026" under the diagram.
- Gaps 8 and 9: "Same offset with other fittings" table (22.5, 30, 45, 60; EMT angles in EMT mode).
- 10 pre-rendered job pages (45, 30, 22.5, 60 degree; EMT; formula; multiplier chart; PVC; copper; steel) with presets, computed tables, worked examples, FAQ, breadcrumb and FAQ schema, linked from the home page and each other.
- 7 new unit tests (33 total pass). Lighthouse 100/100/100/100 on home, copper and multiplier pages. Pages build stays noindex.
Skipped:
- 90 degree option: a 90 degree rolling offset has zero run and no meaning for this tool.
- Named author and Organization schema: no real name to use. Drag-the-dot diagram: low value (gap 11).
- EMT bend plane wording: no bender-maker source found (searched once); math is sound, wording unchanged. Still needs one electrician to read it.
