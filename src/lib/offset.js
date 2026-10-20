// Core math for the rolling offset calculator. Plain JS so the test script can import it.
// All lengths are in inches. Angles are in degrees.

const RAD = Math.PI / 180;

/** Longest length we accept, in inches. Stops typos such as 1000000000000000000000. */
export const MAX_LENGTH = 100000;

/** Parse an inch string: "12", "12.5", "12 3/8", "12-3/8", "3/8", `12 3/8"`. Returns NaN when it is not a length. */
function parseInches(input) {
  let s = String(input ?? '').trim().replace(/["”″]|in(ches)?\b/gi, '').trim();
  if (!s) return NaN;
  s = s.replace(/(\d)-(\d+\/\d+)/, '$1 $2').replace(/\s+/g, ' ');
  let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[3] === 0 ? NaN : +m[1] + +m[2] / +m[3];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return +m[2] === 0 ? NaN : +m[1] / +m[2];
  if (/^\d*\.?\d+$/.test(s) || /^\d+\.$/.test(s)) return parseFloat(s);
  return NaN;
}

/**
 * Parse a length into inches. Accepts inches ("12", "12.5", "12 3/8", `12 3/8"`)
 * and feet with inches (`2'-3 1/2"`, `2' 3`, `2'`, "2 ft 3 in"). Returns NaN when it is not a length
 * or when it is above MAX_LENGTH.
 */
export function parseLength(input) {
  if (typeof input === 'number') return input >= 0 && input <= MAX_LENGTH ? input : NaN;
  const s = String(input ?? '').trim().replace(/[′’‘]/g, "'");
  const ft = s.match(/^(\d+(?:\.\d+)?)\s*(?:'|ft\b|feet\b|foot\b)\s*-?\s*(.*)$/i);
  let v;
  if (ft) {
    const rest = ft[2].trim();
    const inches = rest ? parseInches(rest) : 0;
    v = Number.isFinite(inches) ? +ft[1] * 12 + inches : NaN;
  } else {
    v = parseInches(s);
  }
  return v <= MAX_LENGTH ? v : NaN;
}

/** Format inches as a fraction to the nearest 1/16 plus a decimal (2 places). */
export function formatInches(x) {
  if (!Number.isFinite(x)) return { frac: '', dec: '', text: '' };
  const n = Math.round(Math.abs(x) * 16);
  const whole = Math.floor(n / 16);
  let num = n % 16, den = 16;
  while (num && num % 2 === 0) { num /= 2; den /= 2; }
  let frac;
  if (!num) frac = String(whole);
  else frac = whole ? `${whole} ${num}/${den}` : `${num}/${den}`;
  // Show a minus sign only when the rounded value is not zero (no "-0.00").
  const dec = Math.abs(x).toFixed(2);
  const neg = x < 0 && n > 0 && +dec !== 0;
  if (neg) frac = '-' + frac;
  return { frac, dec: (neg ? '-' : '') + dec, text: `${frac}"` };
}

/** True offset (the "set"): the diagonal of the rise and roll. */
export function trueOffset(rise, roll) { return Math.hypot(rise, roll); }

/** Travel: pipe center line between the two fittings. */
export function travel(rise, roll, angle) { return trueOffset(rise, roll) / Math.sin(angle * RAD); }

/** Run: how far the offset moves along the pipe direction. */
export function run(rise, roll, angle) { return trueOffset(rise, roll) / Math.tan(angle * RAD); }

/** Multiplier for a bend angle: travel = true offset x multiplier. */
export function multiplier(angle) { return 1 / Math.sin(angle * RAD); }

/** Shrink per inch of offset: travel - run for one inch, which equals tan(angle / 2). */
export function shrinkPerInch(angle) { return Math.tan((angle / 2) * RAD); }

/**
 * Tilt of the bend plane from the rise (vertical) direction, in degrees.
 * Both bends of a rolling offset lie in this one plane.
 */
export function offsetAngle(rise, roll) { return Math.atan2(roll, rise) / RAD; }

/**
 * Take-off per fitting, in inches: center of the fitting to the bottom of the socket
 * (steel butt weld: center to weld end). Cut length = travel - 2 x take-off.
 *
 * Every value below is read from a maker catalog or a standard. Nothing is calculated.
 * Sizes are listed in the order the size menu shows them.
 *
 * PVC: Spears Manufacturing, Sch 40 45 degree socket elbow, series 417, column J (center to socket bottom,
 *   tolerance +/- 1/32). Catalog "PVC White Schedule 40 Fittings, Unions, Saddles", parts 417-005 to 417-100.
 *   https://www.spearsmfg.com/super_sourcebook/SSB-1%20Part%202%20Technical%20Information%20Catalog/003%20PVC%20White%20Schedule%2040%20Fittings,%20Unions,%20Saddles.pdf
 *   Left out on purpose: 1-1/4 and 2-1/2. The printed values do not fit the size pattern (probable catalog typos).
 *
 * Copper: NIBCO, 606 wrought copper 45 degree elbow C x C, dimension C (center to bottom of cup), revision 5/9/2013, page 11.
 *   https://static.au-uw2-stg.autodesk.com/MSF11653_additional_11653_Nibco_20607.pdf
 *   Values are as printed. The 1 inch value (3/8) sits low next to 3/4 and 1-1/4; measure it before you rely on it.
 *
 * Steel: ASME B16.9 45 degree long radius elbow, center to end (dimension A). Two tables agree:
 *   https://texasflange.com/butt-weld-fittings/elbow-45-long-radius/ (inches)
 *   https://www.wermac.org/fittings/dim_elbows_a.html (mm: 22, 25, 29, 35, 44, 51, 64, 95)
 *
 * Makers differ. Catalog values are for 45 degree fittings only; see takeoffFor.
 */
export const TAKEOFF = [
  {
    id: 'pvc', label: 'PVC Sch 40', source: 'Spears series 417, 45° socket elbow, column J', defaultSize: '3/4', onlyAt45: true,
    sizes: [['1/2', 11 / 32], ['3/4', 7 / 16], ['1', 15 / 32], ['1-1/2', 19 / 32], ['2', 11 / 16], ['3', 27 / 32], ['4', 1 + 3 / 32]],
  },
  {
    id: 'copper', label: 'Copper, solder', source: 'NIBCO 606, 45° wrought elbow, dimension C', defaultSize: '3/4', onlyAt45: true,
    sizes: [['1/2', 9 / 32], ['3/4', 11 / 32], ['1', 3 / 8], ['1-1/4', 17 / 32], ['1-1/2', 19 / 32], ['2', 25 / 32], ['2-1/2', 29 / 32], ['3', 1 + 1 / 8], ['4', 1 + 9 / 16]],
  },
  {
    id: 'steel', label: 'Steel, butt weld', source: 'ASME B16.9 long radius 45° elbow, center to end', defaultSize: '2', onlyAt45: false,
    sizes: [['1', 7 / 8], ['1-1/4', 1], ['1-1/2', 1 + 1 / 8], ['2', 1 + 3 / 8], ['2-1/2', 1 + 3 / 4], ['3', 2], ['4', 2.5], ['6', 3.75]],
  },
];

/** Look up one material by id. */
export function materialById(id) { return TAKEOFF.find((m) => m.id === id); }

/** Scale a 45 degree take-off to another fitting angle (the arm length follows tan(angle / 2)). Steel only, approximate. */
export function scaleTakeoff(takeoff45, angle) {
  return takeoff45 * Math.tan((angle / 2) * RAD) / Math.tan(22.5 * RAD);
}

/**
 * Take-off per fitting for a material, size and angle, in inches. Returns NaN when there is no honest value:
 * unknown size, or PVC or copper at any angle except 45 (no catalog value is used for them).
 * Steel at other angles is scaled from the 45 degree value and is approximate; isApproximate() tells the page to warn.
 */
export function takeoffFor(material, size, angle) {
  const m = materialById(material);
  const row = m && m.sizes.find(([s]) => s === size);
  if (!row) return NaN;
  if (angle === 45) return row[1];
  return m.onlyAt45 ? NaN : scaleTakeoff(row[1], angle);
}

/** True when takeoffFor() gives a scaled number rather than a catalog number. */
export function isApproximate(material, angle) {
  const m = materialById(material);
  return !!m && !m.onlyAt45 && angle !== 45;
}

/** Everything the page needs for one calculation. Returns null when there is no usable input. */
export function calculate({ rise, roll, angle, takeoff = 0, firstMark = NaN }) {
  if (!(rise >= 0) || !(roll >= 0) || !(rise > 0 || roll > 0)) return null;
  if (!(angle > 0 && angle < 90)) return null;
  const t = trueOffset(rise, roll);
  const tr = travel(rise, roll, angle);
  const r = run(rise, roll, angle);
  const k = Number.isFinite(takeoff) && takeoff > 0 ? takeoff : 0;
  const cut = tr - 2 * k;
  const mult = multiplier(angle);
  const spi = shrinkPerInch(angle);
  const shrink = t * spi;
  const mark1 = Number.isFinite(firstMark) && firstMark >= 0 ? firstMark : NaN;
  return {
    trueOffset: t, travel: tr, run: r, cut, takeoff: k,
    multiplier: mult, shrinkPerInch: spi, shrink,
    offsetAngle: offsetAngle(rise, roll),
    mark1, mark2: Number.isFinite(mark1) ? mark1 + tr : NaN,
  };
}
