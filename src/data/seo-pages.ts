// Job pages: one real page per search topic. Every number below is computed from src/lib/offset.js,
// so the text cannot drift from the tool. Each page has its own preset for the calculator.
import { calculate, fittingRoll, travel, run, multiplier, shrinkPerInch, formatInches, takeoffFor, materialById, TAKEOFF } from '../lib/offset.js';
import { fractionText } from '../lib/inputs.js';

export interface Table { caption: string; head: string[]; rows: string[][]; }
export interface Block { h: string; p?: string[]; ul?: string[]; ol?: string[]; table?: Table; after?: string[]; }
export interface SeoPage {
  slug: string; title: string; h1: string; description: string; lead: string; label: string;
  preset: { mode: 'pipe' | 'emt'; angle: number; material?: string; size?: string };
  blocks: Block[]; faq: { q: string; a: string }[];
}

const T = (x: number) => formatInches(x).text;
const D = (x: number) => formatInches(x).dec;
const n3 = (x: number) => x.toFixed(3);
const PAIRS: [number, number][] = [[3, 4], [6, 8], [5, 12], [12, 9], [8, 15], [24, 7]];

function pairTable(angle: number): Table {
  return {
    caption: `True offset, travel and run at ${angle} degrees for common rise and roll pairs`,
    head: ['Rise', 'Roll', 'True offset', `Travel at ${angle}°`, `Run at ${angle}°`],
    rows: PAIRS.map(([rise, roll]) => {
      const c = calculate({ rise, roll, angle })!;
      return [`${rise}"`, `${roll}"`, `${D(c.trueOffset)}"`, `${T(c.travel)} (${D(c.travel)})`, `${T(c.run)} (${D(c.run)})`];
    }),
  };
}

function angleOtherTable(): Table {
  return {
    caption: 'The same 12 inch rise and 9 inch roll at each common angle',
    head: ['Angle', 'Multiplier', 'Travel', 'Run', 'Shrink'],
    rows: [22.5, 30, 45, 60].map((a) => {
      const c = calculate({ rise: 12, roll: 9, angle: a })!;
      return [`${a}°`, n3(multiplier(a)), `${T(c.travel)} (${D(c.travel)})`, `${T(c.run)} (${D(c.run)})`, `${T(c.shrink)} (${D(c.shrink)})`];
    }),
  };
}

const closer = 'Pick the pipe type and size in the tool to subtract the fitting take-off and get the cut length.';

function angleBlocks(angle: number, extra: Block[]): Block[] {
  const m = multiplier(angle), r = 1 / Math.tan(angle * Math.PI / 180), s = shrinkPerInch(angle);
  return [
    {
      h: `What changes at ${angle} degrees`,
      p: [`With ${angle} degree fittings, the travel is the true offset times ${n3(m)}. The run is the true offset times ${n3(r)}. Every inch of true offset costs ${s.toFixed(3)} inch of length in a bent conduit run (shrink).`],
      ul: [`Travel = true offset x ${n3(m)}`, `Run = true offset x ${n3(r)}`, `Shrink per inch of offset = ${s.toFixed(3)} in`],
    },
    ...extra,
    { h: `Rise and roll pairs at ${angle} degrees`, p: ['These pairs give a whole number for the true offset, so you can check your own math against them.'], table: pairTable(angle) },
    { h: 'Compare with the other angles', p: ['The offset is the same. Only the fitting angle changes. A smaller angle makes a longer travel and a longer run.'], table: angleOtherTable() },
  ];
}

const ex45 = calculate({ rise: 12, roll: 9, angle: 45, takeoff: takeoffFor('copper', '3/4', 45) })!;
const exF = calculate({ rise: 12, roll: 9, angle: 45 })!;
const ex2pvc = calculate({ rise: 12, roll: 9, angle: 45, takeoff: takeoffFor('pvc', '2', 45) })!;
const ex2steel = calculate({ rise: 12, roll: 9, angle: 45, takeoff: takeoffFor('steel', '2', 45) })!;

function takeoffTable(id: string): Table {
  const m = materialById(id);
  return {
    caption: `${m.label} take-off per 45 degree fitting by pipe size`,
    head: ['Pipe size', 'Take-off (in)', 'Decimal'],
    rows: m.sizes.map(([sz, v]: [string, number]) => [`${sz.replace('-', ' ')}"`, fractionText(v), v.toFixed(3)]),
  };
}

function multTable(): Table {
  const angles = [5, 10, 11.25, 22.5, 30, 45, 60];
  return {
    caption: 'Multiplier, shrink and run factor by bend angle',
    head: ['Bend angle', 'Multiplier (1 / sin)', 'Shrink per inch of offset', 'Run factor (1 / tan)'],
    rows: angles.map((a) => [`${a}°`, n3(multiplier(a)), `${shrinkPerInch(a).toFixed(3)} in`, n3(1 / Math.tan(a * Math.PI / 180))]),
  };
}

function betweenTable(): Table {
  const angles = [10, 22.5, 30, 45, 60];
  const offs = [2, 4, 6, 8, 10, 12, 15, 18, 24];
  return {
    caption: 'Distance between bends (inches) by true offset and bend angle',
    head: ['True offset', ...angles.map((a) => `${a}°`)],
    rows: offs.map((o) => [`${o}"`, ...angles.map((a) => `${(o * multiplier(a)).toFixed(2)}`)]),
  };
}

export const pages: SeoPage[] = [
  {
    slug: '45-degree-rolling-offset-calculator', label: '45 degree', title: '45 Degree Rolling Offset Calculator',
    h1: '45 Degree Rolling Offset Calculator',
    description: 'Free 45 degree rolling offset calculator. Enter rise and roll to get true offset, travel, run and cut length. Travel is the true offset times 1.414.',
    lead: 'Enter the rise and roll. The tool is set to 45 degree fittings, the most common choice for pipe.',
    preset: { mode: 'pipe', angle: 45 },
    blocks: angleBlocks(45, [
      { h: 'Why 45 degree fittings are the default', p: [
        'A 45 degree fitting is easy to find in every pipe material. It also gives one handy fact: the run equals the true offset. If the true offset is 15 inches, the offset uses up 15 inches of straight pipe.',
        'It turns the flow less than a 90 degree fitting, and it needs less room than a 22.5 degree fitting.'] },
      { h: 'Worked example', p: [`Rise 12 inches, roll 9 inches, 3/4 inch copper. True offset is 15 inches. Travel is ${T(ex45.travel)} (${D(ex45.travel)}). The 45 degree copper take-off is 11/32 inch, so the cut length is ${T(ex45.cut)} (${D(ex45.cut)}).`, closer] },
    ]),
    faq: [
      { q: 'What is the multiplier for a 45 degree rolling offset?', a: `It is ${n3(multiplier(45))}. Multiply the true offset by it to get the travel.` },
      { q: 'Why is the run equal to the true offset at 45 degrees?', a: 'The tangent of 45 degrees is 1. Run is the true offset divided by that tangent, so the two are equal.' },
      { q: 'How much shrink does a 45 degree bend in conduit cause?', a: `About 3/8 inch for each inch of true offset (exactly ${shrinkPerInch(45).toFixed(3)}).` },
    ],
  },
  {
    slug: '30-degree-rolling-offset-calculator', label: '30 degree', title: '30 Degree Rolling Offset Calculator',
    h1: '30 Degree Rolling Offset Calculator',
    description: 'Free 30 degree rolling offset calculator for EMT conduit and pipe. The distance between bends is exactly twice the true offset.',
    lead: 'The tool is set to a 30 degree bend in EMT conduit. Switch to Pipe if you use 30 degree fittings.',
    preset: { mode: 'emt', angle: 30 },
    blocks: angleBlocks(30, [
      { h: 'Why electricians like 30 degrees', p: [
        'The multiplier is exactly 2. The distance between the two bends is twice the true offset. You can do it in your head: a true offset of 15 inches means the marks are 30 inches apart.',
        'Shrink is about 1/4 inch for each inch of offset, so a 15 inch true offset loses about 4 inches of length.'] },
      { h: 'Using 30 degrees with pipe', p: ['A 30 degree pipe fitting is also called a 1/12 bend in drain, waste and vent work. It is less common than the 45. This site has no catalog take-off for it, so type the take-off of your own fitting in Pipe mode.'] },
    ]),
    faq: [
      { q: 'What is the multiplier for 30 degrees?', a: 'It is 2.000, because the sine of 30 degrees is 0.5.' },
      { q: 'How far apart are the bends for a 12 inch rise and 9 inch roll?', a: `The true offset is 15 inches, so the bends are ${T(travel(12, 9, 30))} apart.` },
      { q: 'Can I use a 30 degree bend in a rolling offset?', a: 'Yes. A rolling offset can use any bend angle. Both bends use the same angle.' },
    ],
  },
  {
    slug: '22-5-degree-rolling-offset-calculator', label: '22.5 degree', title: '22.5 Degree Rolling Offset Calculator',
    h1: '22.5 Degree Rolling Offset Calculator',
    description: 'Free 22.5 degree rolling offset calculator. Get travel, run and cut length for a long, gentle offset. Multiplier 2.613.',
    lead: 'The tool is set to 22.5 degree fittings. Use it for a long, gentle offset.',
    preset: { mode: 'pipe', angle: 22.5 },
    blocks: angleBlocks(22.5, [
      { h: 'When to use 22.5 degrees', p: [
        'A 22.5 degree fitting is also called a 1/16 bend. It turns the flow only a little. That helps on drain lines, where you want smooth flow and few stoppages. Always check your local code for allowed fittings.',
        `The price is room. For a true offset of 15 inches, the run is ${T(15 / Math.tan(22.5 * Math.PI / 180))}, against 15 inches at 45 degrees.`] },
      { h: 'Take-off at 22.5 degrees', p: ['The catalogs list take-off for 45 degree fittings only. For PVC and copper this tool shows no table value at 22.5 degrees. Measure the center to socket bottom on your fitting and type it in. For steel, the tool scales the 45 degree value and marks it approximate.'] },
    ]),
    faq: [
      { q: 'What is the multiplier for 22.5 degrees?', a: `It is ${n3(multiplier(22.5))}. Multiply the true offset by it to get the travel.` },
      { q: 'What is the shrink at 22.5 degrees?', a: `About 3/16 inch for each inch of true offset (exactly ${shrinkPerInch(22.5).toFixed(3)}).` },
      { q: 'Is 22.5 degrees the same as an 11.25 degree bend?', a: 'No. 11.25 degrees is half of 22.5. Use the custom angle field in the tool for 11.25 or any other angle.' },
    ],
  },
  {
    slug: '60-degree-rolling-offset-calculator', label: '60 degree', title: '60 Degree Rolling Offset Calculator',
    h1: '60 Degree Rolling Offset Calculator',
    description: 'Free 60 degree rolling offset calculator. Short, steep offsets with travel, run and cut length. Multiplier 1.155.',
    lead: 'The tool is set to 60 degree fittings. Use it when the offset must be short.',
    preset: { mode: 'pipe', angle: 60 },
    blocks: angleBlocks(60, [
      { h: 'When to use 60 degrees', p: [
        'A 60 degree fitting is also called a 1/6 bend. It makes the run short. For a true offset of 15 inches, the run is only ' + T(15 / Math.tan(Math.PI / 3)) + '. The cost is a sharper turn in the flow and a bigger shrink in conduit.',
        'Not every maker sells 60 degree fittings in every size, so check stock before you plan the job.'] },
      { h: 'Shrink at 60 degrees', p: [`Shrink is ${shrinkPerInch(60).toFixed(3)} inch for each inch of true offset. Many field charts round this to 1/2 inch. The tool shows the exact value.`] },
    ]),
    faq: [
      { q: 'What is the multiplier for 60 degrees?', a: `It is ${n3(multiplier(60))}. Multiply the true offset by it to get the travel.` },
      { q: 'Is there a catalog take-off for 60 degree fittings?', a: 'The catalogs this tool uses list 45 degree fittings only. Type the take-off of your own fitting.' },
    ],
  },
  {
    slug: 'emt-rolling-offset-calculator', label: 'EMT conduit', title: 'EMT Rolling Offset Calculator',
    h1: 'EMT Rolling Offset Calculator',
    description: 'Free EMT rolling offset calculator. Get the distance between bends, multiplier, shrink and bend plane tilt for conduit from rise and roll.',
    lead: 'The tool is set to EMT conduit with a 30 degree bend. Change the angle to match your bender.',
    preset: { mode: 'emt', angle: 30 },
    blocks: [
      { h: 'What the calculator gives you', ul: [
        'True offset: the diagonal across the rise and roll.',
        'Distance between bends: true offset times the multiplier.',
        'Total shrink: the length the conduit loses in the two bends.',
        'Bend plane tilt: how far the plane of both bends leans from the rise direction.'] },
      { h: 'Steps for a rolling offset', ol: [
        'Measure the rise and the roll from center line to center line.',
        'Enter them and pick the bender angle.',
        'Mark bend 1. Add the shrink to your overall length.',
        'Mark bend 2 the distance between bends from the first mark.',
        'Make bend 1 with the plane at the tilt shown.',
        'Turn the conduit 180 degrees and make bend 2 on its mark.'],
        after: ['Dry fit the piece and check it against the job before you cut the run.'] },
      { h: 'Multiplier and shrink by angle', table: multTable() },
      { h: 'Distance between bends', p: ['Find your true offset in the left column, then read across to your bend angle.'], table: betweenTable() },
    ],
    faq: [
      { q: 'What bend angle should I use for a rolling offset?', a: 'Use 30 degrees for most work. It has a multiplier of exactly 2. Use 45 degrees when the offset must be short, and 22.5 degrees for a long, gentle offset.' },
      { q: 'What is shrink?', a: 'Shrink is the length the conduit run loses when you bend an offset into it. It equals the true offset times the tangent of half the bend angle. Add it to your overall length before you cut.' },
      { q: 'Do I need a first mark?', a: 'No. Enter the first mark from the end of the conduit, and the tool gives you the second mark.' },
    ],
  },
  {
    slug: 'rolling-offset-formula', label: 'Rolling offset formula', title: 'Rolling Offset Formula and Calculator',
    h1: 'Rolling Offset Formula',
    description: 'The rolling offset formulas for true offset, travel, run, shrink and cut length, with worked examples and a free calculator.',
    lead: 'Every formula below is in the calculator. Enter your rise and roll to check your own math.',
    preset: { mode: 'pipe', angle: 45 },
    blocks: [
      { h: 'The formulas', ul: [
        'True offset = square root of (rise squared + roll squared)',
        'Travel = true offset / sin(angle)',
        'Run = true offset / tan(angle)',
        'Multiplier = 1 / sin(angle)',
        'Shrink = true offset x tan(angle / 2)',
        'Cut length = travel - 2 x take-off',
        'Fitting roll angle from level = arctangent(rise / roll)'] },
      { h: 'Where they come from', p: [
        'Look at the offset from the end of the pipe. The rise and the roll are the two legs of a right triangle. The true offset is the long side.',
        'Now look at the true offset from the side. It is one leg of a second right triangle. The travel is the long side, and the fitting angle sits between the travel and the run. That gives the sine and the tangent in the formulas.'] },
      { h: 'Three worked examples', table: {
        caption: 'Worked examples at 45 degrees',
        head: ['Rise', 'Roll', 'True offset', 'Travel', 'Run', 'Roll fittings to'],
        rows: [[6, 8], [12, 9], [24, 7]].map(([rise, roll]) => {
          const c = calculate({ rise, roll, angle: 45 })!;
          return [`${rise}"`, `${roll}"`, `${D(c.trueOffset)}"`, `${T(c.travel)} (${D(c.travel)})`, `${T(c.run)}`, `${(Math.atan2(rise, roll) * 180 / Math.PI).toFixed(1)}° from level`];
        }) } },
      { h: 'Rolling offset formula worked step by step', p: [
        `Take a rise of 12 inches, a roll of 9 inches and 45 degree fittings. True offset = square root of (12 x 12 + 9 x 9) = square root of 225 = ${D(exF.trueOffset)} inches.`,
        `Travel = ${D(exF.trueOffset)} / sin 45 = ${D(exF.travel)} inches, or about ${T(exF.travel)}. Run = ${D(exF.trueOffset)} / tan 45 = ${D(exF.run)} inches. For pipe, subtract the take-off of each fitting from the travel to get the cut length.`] },
      { h: 'The fitting roll angle', p: ['When you set the two fittings, they must lie in the plane of the true offset. For a rise of 12 and a roll of 9, that plane tilts 53.1 degrees from level, or 36.9 degrees from plumb. The tool shows both numbers.'] },
    ],
    faq: [
      { q: 'How do you calculate a rolling offset?', a: `Find the true offset: the square root of rise squared plus roll squared. Divide it by the sine of the fitting angle to get the travel. For a 12 inch rise, a 9 inch roll and 45 degree fittings, the true offset is ${D(exF.trueOffset)} inches and the travel is ${D(exF.travel)} inches.` },
      { q: 'What is the rolling offset formula?', a: 'The true offset is the square root of rise squared plus roll squared. The travel is the true offset divided by the sine of the fitting angle.' },
      { q: 'Is the rolling offset formula the same for pipe and conduit?', a: 'Yes. Pipe adds a take-off for each fitting. Conduit adds shrink for the bends.' },
    ],
  },
  {
    slug: 'rolling-offset-example', label: 'Rolling offset example', title: 'Rolling Offset Example With Pipe Cut Lengths',
    h1: 'Rolling Offset Example',
    description: 'A rolling offset example worked in full for copper, PVC and steel pipe at 45 degrees, with true offset, travel, run and cut length.',
    lead: 'One rise and roll, three pipe types. Check each number against the calculator.',
    preset: { mode: 'pipe', angle: 45, material: 'copper', size: '3/4' },
    blocks: [
      { h: 'The job', p: ['A pipe must clear a duct. The rise is 12 inches and the roll is 9 inches. You use 45 degree fittings on both ends of the offset.'] },
      { h: 'Rolling offset pipe example, step by step', ol: [
        `True offset = square root of (12 squared + 9 squared) = ${D(exF.trueOffset)} inches.`,
        `Travel = ${D(exF.trueOffset)} / sin 45 = ${D(exF.travel)} inches, or about ${T(exF.travel)}.`,
        `Run = ${D(exF.trueOffset)} / tan 45 = ${D(exF.run)} inches. The offset uses up that much straight pipe.`,
        'Look up the take-off of your fitting and subtract it twice, once for each end.'] },
      { h: 'Cut length for three pipe types', p: ['Same offset, three materials. Only the take-off changes.'], table: {
        caption: 'Cut length for a 12 inch rise and 9 inch roll at 45 degrees',
        head: ['Pipe', 'Travel', 'Take-off each', 'Cut length'],
        rows: [['3/4" copper', ex45, takeoffFor('copper', '3/4', 45)], ['2" PVC Sch 40', ex2pvc, takeoffFor('pvc', '2', 45)], ['2" steel, butt weld', ex2steel, takeoffFor('steel', '2', 45)]]
          .map(([name, c, k]: [string, ReturnType<typeof calculate>, number]) => [name, `${T(c!.travel)} (${D(c!.travel)})`, `${fractionText(k)} (${k.toFixed(3)})`, `${T(c!.cut)} (${D(c!.cut)})`]) } },
      { h: 'Check your own numbers', p: ['Change the rise, roll or size in the calculator above. The take-off values come from maker catalogs for 45 degree fittings. Steel butt weld joints also need a root gap, which you subtract yourself.'] },
    ],
    faq: [
      { q: 'How do you calculate a rolling offset?', a: `Take the square root of rise squared plus roll squared to get the true offset. Divide that by the sine of the fitting angle to get the travel. Subtract the take-off of both fittings for the cut length.` },
      { q: 'Does a rolling offset use the same fittings as a plain offset?', a: 'Yes. The fittings are the same. A rolling offset just turns the pair of fittings to a tilted plane, so the pipe moves up and sideways together.' },
    ],
  },
  {
    slug: 'how-to-do-a-rolling-offset', label: 'How to do a rolling offset', title: 'How to Do a Rolling Offset in Pipe and Conduit',
    h1: 'How to Do a Rolling Offset',
    description: 'How to do a rolling offset in pipe or EMT conduit: measure rise and roll, find the travel, cut and set the fittings. With a free calculator.',
    lead: 'Follow the steps below. Enter your rise and roll in the calculator to get each number.',
    preset: { mode: 'pipe', angle: 45 },
    blocks: [
      { h: 'Steps for pipe', ol: [
        'Measure the rise and the roll from the center line of the first pipe to the center line of the second.',
        'Pick the fitting angle. 45 degrees is the usual choice.',
        'Find the true offset and the travel with the calculator.',
        'Subtract the take-off of both fittings from the travel. The result is the cut length.',
        'Cut the pipe and dry fit the two fittings.',
        `Turn the fittings so they lie in the plane of the true offset. For a 12 inch rise and 9 inch roll, that plane tilts ${fittingRoll(12, 9).toFixed(1)} degrees from level.`,
        'Mark the fittings and the pipe, then glue, solder or weld.'] },
      { h: 'Steps for EMT conduit', ol: [
        'Measure the rise and the roll, and switch the calculator to EMT conduit.',
        'Pick the bender angle. 30 degrees has a multiplier of exactly 2.',
        'Mark bend 1. Mark bend 2 the distance between bends from the first mark.',
        'Make bend 1 with the plane at the tilt shown.',
        'Turn the conduit 180 degrees and make bend 2 on its mark.',
        'Add the shrink to your overall length before you cut.'] },
      { h: 'Common mistakes', ul: ['Measuring to the edge of the pipe, not the center.', 'Using different angles on the two ends.', 'Forgetting the take-off, so the piece comes out too long.', 'Setting the fittings level or plumb, when they must lie in the tilted plane.'] },
    ],
    faq: [
      { q: 'How do you calculate a rolling offset?', a: 'Find the true offset from the rise and roll, then divide it by the sine of the fitting angle. That gives the travel, the center to center length of the angled piece.' },
      { q: 'What is the hardest part of a rolling offset?', a: 'Setting the fittings in the right plane. Both fittings must lie in the plane that holds the true offset, not level and not plumb.' },
    ],
  },
  {
    slug: 'rolling-offset-multiplier-chart', label: 'Multiplier chart', title: 'Rolling Offset Multiplier Chart',
    h1: 'Rolling Offset Multiplier Chart',
    description: 'Rolling offset multiplier and shrink chart for conduit bends from 5 to 60 degrees, plus a distance-between-bends table by true offset.',
    lead: 'Look up a multiplier below, or enter your rise and roll to get the exact distance between bends.',
    preset: { mode: 'emt', angle: 30 },
    blocks: [
      { h: 'Multiplier, shrink and run factor', p: ['The multiplier is one divided by the sine of the bend angle. Multiply the true offset by it to get the distance between bends. The run factor is one divided by the tangent. The shrink is for each inch of true offset.'], table: multTable() },
      { h: 'Distance between bends', p: ['True offset in the left column. Read across for the distance between bends, in inches.'], table: betweenTable() },
      { h: 'How to find the true offset', p: ['For a plain offset, the true offset is the rise. For a rolling offset, it is the square root of rise squared plus roll squared. The calculator above does it for you.'] },
      { h: 'A note on rounded values', p: ['Field charts often round the multipliers to 5.8, 2.6, 2, 1.4 and 1.2. The chart here shows three decimals. For short offsets the difference is small. For long ones, use the exact value.'] },
    ],
    faq: [
      { q: 'What are the common bender multipliers?', a: `${[10, 22.5, 30, 45, 60].map((a) => `${a} degrees: ${multiplier(a).toFixed(2)}`).join(', ')}.` },
      { q: 'How do I find the multiplier for an odd angle?', a: 'Divide 1 by the sine of the angle. The custom angle field in the tool does this for you.' },
    ],
  },
  {
    slug: 'pvc-rolling-offset-calculator', label: 'PVC', title: 'PVC Rolling Offset Calculator',
    h1: 'PVC Rolling Offset Calculator',
    description: 'Free PVC rolling offset calculator with Schedule 40 45 degree fitting take-off by pipe size, cited to the Spears catalog.',
    lead: 'The tool is set to 2 inch PVC Schedule 40 with 45 degree fittings. Change the size in the take-off box.',
    preset: { mode: 'pipe', angle: 45, material: 'pvc', size: '2' },
    blocks: [
      { h: 'PVC take-off per 45 degree fitting', p: ['Take-off is the distance from the center of the fitting to the bottom of the socket. The pipe bottoms out in the socket, so the tool subtracts the take-off twice.'], table: takeoffTable('pvc') },
      { h: 'Source', p: ['Values are from Spears Manufacturing, Schedule 40 45 degree socket elbow, series 417, column J, with a tolerance of plus or minus 1/32 inch.'], ul: TAKEOFF.find((m) => m.id === 'pvc').links.map(([label, href]: [string, string]) => `<a href="${href}" rel="noopener">${label}</a>`),
        after: ['The 1-1/4 and 2-1/2 inch sizes are not listed. The printed catalog values for those two sizes break the pattern of the other sizes, so they look like typos. Type your own number for those sizes. Other makers differ, so measure the fitting in your hand when the job is costly.'] },
      { h: 'Worked example', p: [`Rise 12 inches, roll 9 inches, 2 inch PVC. Travel is ${T(ex2pvc.travel)}. Take-off is 11/16 inch per fitting. Cut length = ${D(ex2pvc.travel)} - 2 x 0.6875 = ${D(ex2pvc.cut)} inches, about ${T(ex2pvc.cut)}.`] },
      { h: 'Tips for PVC', ul: ['Dry fit the offset before you glue it.', 'Mark the fitting and the pipe so the fitting stays at the right roll angle while the cement sets.', 'The table is for 45 degree fittings only. For 22.5 or 60 degree fittings, type your own take-off.'] },
    ],
    faq: [
      { q: 'What is the take-off of a 2 inch PVC 45 degree elbow?', a: `11/16 inch (0.688), from Spears series 417.` },
      { q: 'Why does this tool not give 1-1/4 inch PVC?', a: 'The catalog values for 1-1/4 and 2-1/2 inch do not fit the pattern of the other sizes. They look like misprints, so the tool leaves them out.' },
    ],
  },
  {
    slug: 'copper-rolling-offset-calculator', label: 'Copper', title: 'Copper Rolling Offset Calculator',
    h1: 'Copper Rolling Offset Calculator',
    description: 'Free copper pipe rolling offset calculator with NIBCO 606 45 degree elbow take-off by size. Get the cut length for sweat fittings.',
    lead: 'The tool is set to 3/4 inch copper with 45 degree fittings. Change the size in the take-off box.',
    preset: { mode: 'pipe', angle: 45, material: 'copper', size: '3/4' },
    blocks: [
      { h: 'Copper take-off per 45 degree fitting', p: ['Take-off here is dimension C, the center of the fitting to the bottom of the cup. The tool subtracts it twice.'], table: takeoffTable('copper') },
      { h: 'Source', ul: TAKEOFF.find((m) => m.id === 'copper').links.map(([label, href]: [string, string]) => `<a href="${href}" rel="noopener">${label}</a>`),
        after: ['The 1 inch value is 3/8, as NIBCO prints it. It sits low between the 3/4 and 1-1/4 inch values, so measure that fitting before you rely on it. Other makers differ by a small amount.'] },
      { h: 'Worked example', p: [`Rise 12 inches, roll 9 inches, 3/4 inch copper. Travel is ${T(ex45.travel)}. Take-off is 11/32 inch per fitting. Cut length = ${D(ex45.travel)} - 2 x 0.344 = ${D(ex45.cut)} inches, about ${T(ex45.cut)}.`] },
      { h: 'Tips for copper', ul: ['Cut the tube square and measure from the bottom of the cup, not the end of the fitting.', 'Dry fit and mark the tube depth in each cup before you solder.', 'The table is for 45 degree fittings only. For other angles, type your own take-off.'] },
    ],
    faq: [
      { q: 'What is the take-off of a 3/4 inch copper 45 degree elbow?', a: '11/32 inch (0.344), from NIBCO 606.' },
      { q: 'Does the cut length include the cup depth?', a: 'The tube bottoms out in the cup. Center to cup bottom is the take-off, so the cut length is the tube length between the two cup bottoms.' },
    ],
  },
  {
    slug: 'steel-pipe-rolling-offset-calculator', label: 'Steel pipe', title: 'Steel Pipe Rolling Offset Calculator',
    h1: 'Steel Pipe Rolling Offset Calculator',
    description: 'Free steel pipe rolling offset calculator with ASME B16.9 45 degree long radius elbow take-off by size for butt weld fittings.',
    lead: 'The tool is set to 2 inch butt weld steel with 45 degree long radius elbows. Change the size in the take-off box.',
    preset: { mode: 'pipe', angle: 45, material: 'steel', size: '2' },
    blocks: [
      { h: 'Steel take-off per 45 degree elbow', p: ['Take-off here is the center to end dimension of an ASME B16.9 long radius 45 degree elbow, measured to the weld end.'], table: takeoffTable('steel') },
      { h: 'Source', ul: TAKEOFF.find((m) => m.id === 'steel').links.map(([label, href]: [string, string]) => `<a href="${href}" rel="noopener">${label}</a>`),
        after: ['The two tables agree.'] },
      { h: 'Worked example', p: [`Rise 12 inches, roll 9 inches, 2 inch steel. Travel is ${T(ex2steel.travel)}. Take-off is 1 3/8 inch per elbow. Cut length = ${D(ex2steel.travel)} - 2 x 1.375 = ${D(ex2steel.cut)} inches, about ${T(ex2steel.cut)}.`] },
      { h: 'Root gap and other angles', p: ['A butt weld needs a root gap, often about 1/8 inch per joint. The tool does not include it in the cut length, so subtract it yourself. Steel at an angle other than 45 degrees is scaled from the 45 degree value. Treat that result as approximate and check it against your fitting.'] },
    ],
    faq: [
      { q: 'What is the take-off of a 2 inch steel 45 degree long radius elbow?', a: '1 3/8 inch (1.375), center to end, from ASME B16.9 dimension tables.' },
      { q: 'Do I subtract the weld gap?', a: 'Yes, if your procedure leaves a gap. The tool shows the cut length without it.' },
    ],
  },
];

export const bySlug = (slug: string) => pages.find((p) => p.slug === slug)!;
