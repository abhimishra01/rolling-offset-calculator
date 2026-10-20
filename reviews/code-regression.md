# Code review, regression lens: rolling-offset-calculator (Sherlock)

**Verdict: the geometry is correct, but the take-off tables are not. Do not ship until the PVC, copper and steel values are replaced and the size list order bug is fixed. 4 must-fix.**

## What I checked
- Recomputed 9 cases by hand and by script (12/9/45, 6/8/22.5, 24/7/60, 5/12/30, 0/10/45, 10/0/45, 3/4/0.5, 12.5/9.25/11.25, 1e6 values). True offset, travel, run, shrink and cut all match the formulas and the known check (15, 21.21). Article tables (common pairs, multiplier and shrink) also match.
- Template rules hold in a fresh build (own outDir, deleted): canonical on every page, `public/_headers` has the pages.dev noindex rules, 404 has noindex and is not in the sitemap, legal pages are in the footer, sitemap lists 5 URLs, GA and AdSense scripts are absent, `ads.txt` is a comment when AdSense is empty.
- Template leftovers already on the fixer list (README, new-tool.sh, screenshots in git, duplicate legal links on home page, build-date "Last updated", British spelling): not repeated here.

## Take-off values checked against sources
Take-off here means center to bottom of socket (center to weld end for steel). `cut = travel - 2 x take-off`, so a take-off error counts twice.

| Material and size | Code (in) | Source value (in) | Error per cut |
|---|---|---|---|
| PVC 1/2 | 3/8 | 11/32 | +1/16 |
| PVC 3/4 | 7/16 | 7/16 | none |
| PVC 1 | 1/2 | 15/32 | +1/16 |
| PVC 1-1/4 | 9/16 | printed 3/8 (looks like a catalog typo, H column also off pattern) | unverified |
| PVC 1-1/2 | 5/8 | 19/32 | +1/16 |
| PVC 2 | 3/4 | 11/16 | +1/8 |
| PVC 3 | 1 | 27/32 | +5/16 |
| PVC 4 | 1 1/4 | 1 3/32 | +5/16 |
| Copper 1/2 | 5/16 | 9/32 | +1/16 |
| Copper 3/4 | 3/8 | 11/32 | +1/16 |
| Copper 1 | 1/2 | 3/8 | +1/4 |
| Copper 1-1/4 | 9/16 | 17/32 | +1/16 |
| Copper 1-1/2 | 11/16 | 19/32 | +3/16 |
| Copper 2 | 7/8 | 25/32 | +3/16 |
| Copper 3 | 1 1/4 | 1 1/8 | +1/4 |
| Copper 4 | 1 5/8 | 1 9/16 | +1/8 |
| Steel 1 | 5/8 | 7/8 (0.88) | -1/2 |
| Steel 1-1/4 | 13/16 | 1 | -3/8 |
| Steel 1-1/2 | 7/8 | 1 1/8 | -1/2 |
| Steel 2 | 1 1/4 | 1 3/8 | -1/4 |
| Steel 2-1/2 | 1 5/8 | 1 3/4 | -1/4 |
| Steel 3 | 1 7/8 | 2 | -1/4 |
| Steel 4, 6 | 2 1/2, 3 3/4 | 2 1/2, 3 3/4 | none |

Sources:
- PVC: Spears Sch 40 45 degree socket elbow, series 417, column J (centerline to socket bottom, tolerance plus or minus 1/32). Spears catalog "PVC White Schedule 40 Fittings, Unions, Saddles", page with parts 417-005 to 417-100. https://www.spearsmfg.com/super_sourcebook/SSB-1%20Part%202%20Technical%20Information%20Catalog/003%20PVC%20White%20Schedule%2040%20Fittings,%20Unions,%20Saddles.pdf . Also gives 2-1/2 = 21/32. I could not open Charlotte's table, so this is one maker only.
- Copper: NIBCO catalog, 606 45 degree elbow C x C wrot, dim C (center to bottom of cup), revision 5/9/2013: https://static.au-uw2-stg.autodesk.com/MSF11653_additional_11653_Nibco_20607.pdf . Also gives 2-1/2 = 29/32. One maker only.
- Steel: ASME B16.9 45 degree long radius elbow, center to end, from two independent tables that agree: https://texasflange.com/butt-weld-fittings/elbow-45-long-radius/ (inches) and https://www.wermac.org/fittings/dim_elbows_a.html (mm: 22, 25, 29, 35, 44, 51, 64, 95). I did not read the standard itself. The code values look like 1.5 x NPS x tan(22.5), which is wrong for NPS 3 and smaller.

## Findings

| Severity | File:line | Finding | Why | Fix |
|---|---|---|---|---|
| must | src/lib/offset.js:68-72 | PVC take-offs are too large at every size except 3/4 (3 and 4 inch by 5/32 each). | A plumber cuts 5/16 too short on 3 and 4 inch PVC. The Reviewer note asked for a source check, and the values fail it. | Replace with Spears J values above, cite the maker in the comment and on the page. Remove 1-1/4 until a second source confirms it (the Spears print of 3/8 is not credible). |
| must | src/lib/offset.js:68-72 | Copper take-offs are too large at every size except 4 inch (1 inch by 1/8, 3 inch by 1/8). | Same as above. | Replace with NIBCO dim C values above. Optionally add 2-1/2 = 29/32. |
| must | src/lib/offset.js:71 | Steel values are wrong for 6 of 8 sizes, and the errors are 1/4 to 1/2 inch per fitting. | They were derived from a formula, not read from the B16.9 table. Pipefitters will notice. | Use 7/8, 1, 1 1/8, 1 3/8, 1 3/4, 2, 2 1/2, 3 3/4. Update scripts/test.mjs:50 (it asserts the wrong 1.25 for 2 inch). |
| must | src/lib/offset.js:68-72 and src/components/Tool.astro:244 | JavaScript orders integer-like keys first, so `Object.keys(sizes)` is `1, 2, 3, 4, 1/2, 3/4, 1-1/4, 1-1/2`. The size dropdown shows the wrong order, and the default (`keys[1]`) is 2 inch for every material, not 3/4. I confirmed the order in node. | Visible bug, and it breaks the "typical default size" intent. | Store sizes as an ordered array of `{size, takeoff}` and render in that order. Add a test for the order. |
| should | src/components/Tool.astro:250 | The take-off box is filled with the value rounded to 1/16, and the calculation then uses that rounded text. Catalog values are in 32nds (11/32, 15/32, 19/32). | Adds up to 1/32 per fitting error that the user cannot see. | Fill the box with a decimal to 3 places (0.344), or keep the exact number in state and show the fraction only as a label. |
| should | src/lib/offset.js:57-60 and :75-79 | The 22.5 and 60 degree take-offs scale the 45 degree value with tan(angle/2). Spears 22.5 degree values (416 series J) do not follow that: 3 inch is 9/16 real vs 0.405 scaled (off 5/32), 2 inch 3/8 vs 0.33, 1 inch 9/32 vs 0.23. No US PVC or copper 60 degree fitting exists, so the 60 value is invented. | Cut lengths at non-45 angles are wrong by up to 5/16 and look as precise as the 45 degree ones. | For PVC and copper, offer 45 only (or 45 and 22.5 from the maker table) and for other angles ask for "my own number". Keep scaling for steel only and say it is approximate. |
| should | src/components/Article.astro:80, src/data/faq.ts:7 | "Rotate the conduit between the two bends, measured from the rise direction" is not how a rolling offset is bent. Both bends are in one plane, tilted by atan(roll/rise) from the rise direction. Between the two bends you turn the conduit 180 degrees. | An electrician who follows the text bends the wrong shape. | Reword: the tool's "offset direction" is the tilt of the bend plane. Make bend 1, turn the conduit 180 degrees, make bend 2 at the second mark. Rename the row "Bend plane tilt from rise". |
| should | src/components/Article.astro:45 | Worked example uses a 3/4 copper take-off of "about 3/8" and 0.75 total. NIBCO gives 11/32, so cut = 21.21 - 0.69 = 20.52 (20 1/2). | Example must match the tool once the table is fixed. | Update the numbers after the table fix. |
| should | src/components/Tool.astro:331 | Shrink per inch is shown as a 1/16 fraction: 45 degrees shows "7/16 (0.414)" while the article and FAQ say "about 3/8"; 10 degrees shows "1/16 (0.088)". | The page contradicts itself, and 1/16 rounding of a ratio makes no sense. | Show the decimal only (0.414). Keep the 3/8 rule of thumb in the article. |
| should | src/components/Tool.astro:262-268 | A fraction button on "12.5" gives "12 1/4": it drops the .5 silently. | Wrong number with no warning. | If the value is not a whole number plus a fraction, keep the decimal part, or replace with a clear rule (disable fraction buttons when the field holds a decimal). |
| should | src/components/Tool.astro:188,197 | A bad custom angle (NaN) is saved as null, then reload falls back to 45 while the custom field still shows the bad text. | The field says "abc" and the result uses 45 with no error. | On load, if customText is set and the angle is null, re-parse customText, or drop customText. |
| should | src/pages/privacy.astro:20 | Says only the theme choice is stored, but the tool saves all inputs under `roc-v1`. | The privacy text is inaccurate. | Add "and your last calculator inputs". |
| nice | src/components/Tool.astro:230 | Clearing a custom angle in EMT mode returns to 22.5, but the EMT default is 30. | Small inconsistency. | Use the same default as the initial state. |
| nice | src/components/Tool.astro:291, offset.js:99 | Dead code: `allowEmpty ? NaN : NaN`, and `cutIsShort` is never read. | Confusing leftovers. | Delete. |
| nice | src/components/Tool.astro:228 | Custom angle uses `parseFloat`, so "45abc" and "1e1" pass. | Silent acceptance of bad input. | Validate with the same strict pattern as `parseLength`. |
| nice | src/lib/offset.js:6-18 | No support for feet-inches (2'-3 1/2"), the vulgar fraction, or a comma decimal. | US trades often write feet and inches. The error message appears with no hint. | Add feet-inches parsing, or say "inches only" in the error text. |
| nice | scripts/test.mjs | Tests cover math and parsing but nothing on the take-off table (values, order, source) and nothing on the page. | The table errors above passed all 15 tests. | Add a table test that pins each value with its source, and an order test. |
| nice | src/lib/offset.js:62-66 | Steel cut length ignores the weld root gap (about 1/8 inch per joint). | Cut is long by about 1/4 inch for welded joints. | Add a one-line note under the take-off box for steel. |
