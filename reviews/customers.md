# Mock-customer test: rolling offset calculator

Tested on the live build (Astro build into dist-customers, served on port 4447) with playwright-cli. Viewports: 390x844, 412x915, 360x640 (phones), 1440x900 (desktop). Light and dark theme. Math was checked by hand against the known case (rise 12, roll 9, 45 deg gives 15 and 21.21): correct. Other values I typed also matched hand math.

## Dave, 52, journeyman plumber, iPhone (390x844)
Job: 2" PVC rolling offset, rise 10 1/2, roll 14 1/4, 45 degree fittings.
He typed "10 1/2" and "14 1/4" straight into the boxes, picked PVC Sch 40, then the size. He got true offset 17 11/16", travel 25 1/16", cut length 23 9/16". About 25 seconds, but the answer sat 1.5 screens below the boxes, so he scrolled down and up each time he changed a number. The size list read "1, 2, 3, 4, 1/2, 3/4, 1-1/4, 1-1/2", which looked like a bug. He tried the fraction buttons: tapping 3/4 on "8" gave "8 3/4", then 1/8 replaced it with "8 1/8", and a second tap on 1/8 wiped it back to "8". The label says "Add", so that surprised him.
- Click on Google over the others? Yes, if the snippet says phone and cut length. The title is plain and says what it is.
- Under 30 seconds? Barely, because of the scrolling.
- Confused: the size order, the fraction buttons that replace instead of add, the "Run" box he never uses. He also does his measuring in feet and inches (2'-3 1/2") and had to convert first.
- To bookmark: results visible while typing, feet-and-inch input.
- Trust: The 3/4" take-off for 2" PVC looked short to him. He would check it against the fitting in his hand. The page says to, which he liked, but it gives no source.
- Come back: yes, if he does not have to scroll.

## Maria, 24, first-year electrician apprentice, Android (412x915)
Job: EMT, rise 6, roll 10, 30 degree bender, first mark 12".
She switched to EMT conduit and got: distance between bends 23 5/16", total shrink 3 1/8", mark 2 at 35 5/16". The multiplier of 2.000 matched what her instructor taught. She understood marks and shrink. She did not know what "Offset direction from rise 59.0 deg" meant for her bender. The explanation is far down in the article and only says "how far to rotate the conduit". In the diagram, the "True offset" label is cut off at the left edge ("fset 11 11/16"").
- Click on Google? Yes, "EMT conduit" in the title helps.
- Under 30 seconds? Yes, about 20 seconds.
- Confused: which way to rotate the bender, and by how much. The "Run" box is not useful to her. The picture shows pipe in a box, not a conduit bend.
- To bookmark: a plain line that says "Rotate the conduit 59 degrees between bends" and which mark to read on the bender.
- Trust: yes, the numbers match her cheat sheet.
- Come back: yes, once the rotation is spelled out.

## Tom, 61, pipefitter, shop laptop (1440x900)
Job: 4" butt-weld steel, rise 18, roll 26.5, 22.5 degree fittings.
Desktop layout works well: inputs left, answers right, no scrolling. He got true offset 32 1/16", travel 83 11/16", cut length 81 5/16". He checked it against his own formula (radius x tan of half the angle, 6" x tan 22.5 = about 2.49"), and the 45 degree number matched. The 22.5 and 60 degree take-offs for weld fittings are scaled, not looked up, and 60 degree weld elbows are not a stocked item. He also found that the page remembered the numbers from a previous visit (18 and 26.5). He liked that, but he wants to know why they are there.
- Click on Google? Maybe. He would pick the page that shows a printable sheet.
- Under 30 seconds? Yes, 15 seconds.
- Confused: where the steel take-offs come from (long radius? short radius?), no root gap for weld joints, no print.
- To bookmark: a "Print or save as PDF" layout, a note "long radius elbows", root gap input.
- Trust: the math yes. The take-off values he wants a source for.
- Come back: yes for quick checks.

## Jenny, 38, plumbing estimator and project coordinator, office desktop
Job: 3/4" copper, rise 12, roll 9, 45 degrees, then a custom take-off.
She got cut length 20 7/16" and it matched the worked example in the article. She used "My own number" with 1 1/16" and it worked. She typed a 9" take-off and got a cut length of 3 3/16" with no warning (legal, since the number is hers). At 20" take-off she got a clear "Check the numbers" note. She went to the About page, which says "the take-off sizes in the table". There is no table on the site. She looked for one to copy into her estimate and could not find it. The "Copy results" button said "Copied", but she could not tell what it copied.
- Click on Google? Yes, the article with the worked example and the pairs table reads well.
- Under 30 seconds? Yes.
- Confused: the missing take-off table that About mentions, and what "Copy results" copies.
- To bookmark: a visible take-off table with the source, a way to enter feet and inches, a "Clear" button (old values stay in the boxes).
- Trust: high for the math, medium for the take-off values with no source.
- Come back: yes, would send the link to her crew.

## Carlos, 45, master electrician, old phone in dark mode, gloves (360x640)
Job: set the page up on a lift, EMT, then pipe, in the dark theme.
The dark theme is easy to read. The buttons are 44px tall, which works with thin gloves. No sideways scroll at 360px. On the small phone the results are about 1.5 screens below the boxes, so he lost the boxes whenever he looked at the answer. The "Pipe" menu cut off "My own number" ("My own nur"). He also noticed that the page opened in the mode he used last, which he liked.
- Click on Google? Yes.
- Under 30 seconds? About 35 seconds, mostly scrolling.
- Confused: truncated dropdown text, the page keeps his last numbers, no way to clear them.
- To bookmark: results that stay on screen, or a sticky result bar.
- Trust: yes, the numbers match his own bender math.
- Come back: yes.

## Ranked change list
Count = personas (of 5) who asked for it or hit the problem.

### Must
1. Show the main answer while typing on a phone (sticky result bar, or results placed above the take-off block). Count: 3 (Dave, Maria, Carlos: all phone users).
2. Add feet-and-inch input (2'-3 1/2" and 2-3 1/2 style), or a feet field. Plumbers read tapes in feet and inches and the field now rejects "1'-2". Count: 3 (Dave, Tom, Jenny).
3. Source for take-off values, shown on the page (a visible take-off table with maker names and catalog pages), or remove values that cannot be verified. The About page also refers to a table that does not exist. Count: 3 (Dave, Tom, Jenny asked where the numbers come from).
4. Tell EMT users how to rotate the bender: "Rotate the conduit X degrees between bends" in the results, not only a number called "Offset direction from rise". Count: 2 (Maria, Carlos).

### Should
5. Fix the size dropdown order (1/2, 3/4, 1, 1 1/4, 1 1/2, 2, 3, 4, then 6). Count: 2 (Dave and Jenny saw the odd order).
6. Fix the clipped "True offset" label at the left of the diagram on phones (390, 412 and 360 widths). Also the diagram overlaps run and true offset lines, so they read as one. Count: 3 (Maria, Dave, Carlos).
7. Make the fraction buttons add to the field (or say "Set the fraction"), and do not clear the value on a second tap. Count: 2 (Dave, Carlos).
8. Add a "Clear" or "Reset" button, since values and mode are saved between visits. Count: 3 (Tom, Jenny, Carlos).
9. Print or save as PDF layout (job sheet with inputs and results). Count: 2 (Tom, Jenny).

### Nice
10. Say what "Copy results" copies (show a short preview or text under the button). Count: 1 (Jenny).
11. Widen the pipe-type select so "My own number" does not truncate on a 360px phone. Count: 1 (Carlos).
12. For steel, note long radius vs short radius and add root gap. Count: 1 (Tom).
13. In EMT mode, hide "Run" or explain it. Count: 1 (Maria).
