# Design and SEO review: rolling-offset-calculator

Reviewer: Miranda (independent). Date: 2026-10-20. Build: `astro build --outDir dist-design`, served on port 4446. Viewed with playwright-cli at 1280 and 390, light and dark. Tools: Pipe mode, EMT mode, error state, extreme values, 404, About.

## Scores (Lighthouse, headless Chrome, home page)
| Run | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 100 | 97 | 100 | 100 |
| Desktop | 100 | 97 | 100 | 100 |

LCP 1.0 s, CLS 0, TBT 0 ms, total weight 23 KiB. The only failed audit is colour contrast (item 1).

## Verdict
Clearly better than the competitors in the panel research (Omni, calculator.academy): two modes in one tool, live answers, fraction entry, color-keyed diagram, take-off table, copy button, dark mode, tiny weight. The look is clean and distinct (orange on warm paper, firm type). Logo, favicon, OG image are good and consistent. Must-fix count: **2** (both are small fixes). 8 should-fix, rest are polish.

## Findings
| # | Severity | Area | Finding | Fix |
|---|---|---|---|---|
| 1 | MUST | Accessibility | Contrast 4.46:1 (needs 4.5) for the label "Cut length / Total shrink" and its small decimal line on the orange result card (white at 92% on #b4540a). Same card in dark mode. Only Lighthouse a11y failure. | Darken `brand` to about #a84c08 (also helps the white-on-brand chips), or make the card text 100% white. Re-run Lighthouse. |
| 2 | MUST | Diagram | Labels clip at the left edge on wide or tall offsets. "True offset" is cut ("ue offset 100 1/16"") for rise 100, roll 3 at 45, and "...set 40 1/16"" for rise 2, roll 40. Labels also collide when roll is 0 (Rise and Travel overlap). The diagram is the page's main selling point, and users type extreme values. | Compute label x from the text width and clamp to the viewBox (use `text-anchor` flip near edges, or widen the viewBox to about 460 and offset the origin). Nudge label positions when two are closer than about 14 px. Test rise 2/roll 40, rise 100/roll 3, roll 0, rise 0. |
| 3 | SHOULD | Phone, one thumb | On a 390 wide phone the answers start about 700 px below the top of the tool, after the fraction buttons, angle and the whole take-off block. A user types rise and roll and sees no result without scrolling. | Show a sticky summary bar (true offset, travel, cut length) at the bottom of the screen on phones, or move the take-off block below the results. Keep the fixed height so CLS stays 0. |
| 4 | SHOULD | Error state | The error line sits at the bottom of the form, about 400 px below a bad Rise field on desktop and far below it on phone. Results show bare dashes and the diagram goes empty. Nothing tells the user what to do next in the results area. | Move `#err` directly under the Rise and Roll hint (replace the hint text while invalid). Link the field with `aria-describedby` to the error. Show "Fix the highlighted field" in the results note. |
| 5 | SHOULD | EMT mode | The diagram keeps pipe wording in EMT mode. The result says "Distance between bends" but the diagram label says "Travel", and the caption says "pipe center lines". "Run" has no clear use for a bender. | In EMT mode relabel the diagram "Bend to bend" and change the caption. Optionally add a one-line bend sequence: "Bend 1 at mark 1, rotate 36.9 degrees, bend 2 at mark 2". |
| 6 | SHOULD | Touch targets | Header links are 36 px tall. The About/Privacy/Terms/Contact line under the tool is 17 px tall with narrow gaps. Footer links are 17 to 20 px. Below the 44 px guideline for thumb use. | Give inline link rows `py-2.5` or `inline-block min-h-[44px]`. Raise header link padding to 44 px height on phones. |
| 7 | SHOULD | SEO content | Article is about 1,400 words with FAQ, good, but it lacks content for the queries the research named. No step list for bending a rolling offset in EMT. No printed take-off chart (people search "pvc fitting take-off chart"). The formula section is titled "The formulas". | Rename to "Rolling offset formula". Add "How to bend a rolling offset in EMT" (numbered steps) and a static take-off table per material (after the regression reviewer verifies the values). Add an H2 "Rolling offset chart" for 22.5, 30, 45, 60 degrees with multiplier, travel per inch and shrink. |
| 8 | SHOULD | SEO structure | One page carries every query. The research says "rolling offset calculator emt" is a separate, autocompleted query. No internal links inside the article (only footer and legal). | Later: add `/emt-rolling-offset-calculator/` (same tool preset to EMT, own H1, own article, own FAQ) and `/pipe-offset-take-off-chart/`. Link both from the home article and from each other. Add the new URLs to the sitemap. |
| 9 | SHOULD | Layout (desktop) | At 1280x800 the diagram is below the fold. Left column (inputs plus take-off) is much taller than the results column, so the right side has dead space beside the take-off block in EMT mode. | Make the results column sticky on lg screens (`lg:sticky lg:top-20`), or place the diagram first in the right column. |
| 10 | SHOULD | Accessibility | The whole results block is `aria-live="polite" aria-atomic="true"`, so a screen reader reads every value after each keystroke. | Keep live only on a short summary line ("Cut length 21 3/16 inches") and make it update after a 400 ms pause. |
| 11 | POLISH | SEO meta | `<meta name="keywords">` has no effect on Google. Open Graph tags lack `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image:alt`. | Remove the keywords tag. Add the image size and alt text. |
| 12 | POLISH | SEO meta | Title (51 chars) and description (140 chars) are the right length. The title has no "free" or "chart". | Optional: "Rolling Offset Calculator: Pipe and EMT Conduit, Free" (54 chars). Keep the H1 as is. |
| 13 | POLISH | JSON-LD | Both blocks parse. WebApplication has no `image` and no `featureList`. FAQPage matches the visible FAQ exactly (8 items, good length). | Add `image` (og.png), `featureList` (true offset, travel, run, shrink, cut length, EMT mode). Do not add ratings. |
| 14 | POLISH | FAQ | 8 questions, answers are plain and short. Missing the two highest-intent ones: "What is the multiplier for a 45 degree rolling offset?" and "How do I measure rise and roll?" | Add both (1.414 for 45, 2.0 for 30, 2.613 for 22.5; measure center to center). |
| 15 | POLISH | Accuracy wording | Shrink table shows 60 degrees as 0.577 in per inch (exact geometry). Most conduit benders and field charts quote 1/2 inch at 60 degrees. A user may think the tool is wrong. | Add a note under the table: "Field charts round this to 1/2 in." |
| 16 | POLISH | Dark mode | The selected "Pipe" or "EMT conduit" segment is a dark pill on a dark brown track. The difference is faint. | Use `--brand-soft` track with a lighter selected pill (`#26272c`) and a 1 px line. |
| 17 | POLISH | Dark mode | Orange 4.46 issue repeats here (see 1). The rest of the dark theme is clean: ink on dark is high contrast, swatches are lifted for the dark background. | Covered by item 1. |
| 18 | POLISH | Labels | "Other angle" wraps to two lines next to its field on 390 and 1280 wide forms. | Put the label above the field or shorten to "Custom". |
| 19 | POLISH | Manifest/icons | `icon-512.png` is full-bleed with no `purpose: "maskable"` entry. Fine on iOS. Android may crop the mark. | Add a maskable icon with 20% safe padding, or keep as is. |
| 20 | POLISH | Sitemap | Sitemap lists 5 URLs, no `lastmod`. Legal pages are indexable. Harmless. | Optional: set `lastmod` in the sitemap config. |

## Checked and fine
- Title, description, one H1, H2 outline in order (no skipped levels), canonical points to `https://rollingoffsetcalculator.com/`.
- Both JSON-LD blocks parse as valid JSON.
- OG image 1200x630 loads and reads well. Favicon SVG plus 32 px PNG, apple-touch 180, manifest icons 192 and 512 all exist. Logo mark reads at 30 px.
- `robots.txt` points to the sitemap index. Sitemap index and sitemap-0 are valid. 404 has `noindex`. `ads.txt` is a comment only while AdSense is off.
- No horizontal scroll at 390. CLS 0. No layout jump when switching modes or typing.
- Focus ring (`:focus-visible`) is defined and visible. Skip link exists. Labels are present on every field. Arrow-key radio group on angle chips works.
- Check numbers: rise 12, roll 9, 45 degrees gives 15 in and 21 3/16 in (21.21). EMT 30 degrees: 30 in between bends, 4 in shrink. Multiplier and shrink table values are right.
- Pipe take-off values were not checked (the regression reviewer owns that).
