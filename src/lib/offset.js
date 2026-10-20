// Core math for the rolling offset calculator. Plain JS so the test script can import it.
// All lengths are in inches. Angles are in degrees.

const RAD = Math.PI / 180;

/** Parse "12", "12.5", "12 3/8", "12-3/8", "3/8", `12 3/8"`. Returns NaN when it is not a length. */
export function parseLength(input) {
  if (typeof input === 'number') return input;
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

/** Format inches as a fraction to the nearest 1/16 plus a decimal. */
export function formatInches(x, digits = 2) {
  if (!Number.isFinite(x)) return { frac: '', dec: '', text: '' };
  const neg = x < 0;
  const n = Math.round(Math.abs(x) * 16);
  const whole = Math.floor(n / 16);
  let num = n % 16, den = 16;
  while (num && num % 2 === 0) { num /= 2; den /= 2; }
  let frac;
  if (!num) frac = String(whole);
  else frac = whole ? `${whole} ${num}/${den}` : `${num}/${den}`;
  if (neg && n) frac = '-' + frac;
  const dec = (neg ? '-' : '') + Math.abs(x).toFixed(digits);
  return { frac, dec, text: `${frac}"` };
}

/** True offset (the "set"): the diagonal of the rise and roll. */
export function trueOffset(rise, roll) { return Math.hypot(rise, roll); }

/** Travel: pipe centre line between the two fittings. */
export function travel(rise, roll, angle) { return trueOffset(rise, roll) / Math.sin(angle * RAD); }

/** Run: how far the offset moves along the pipe direction. */
export function run(rise, roll, angle) { return trueOffset(rise, roll) / Math.tan(angle * RAD); }

/** Multiplier for a bend angle: travel = true offset x multiplier. */
export function multiplier(angle) { return 1 / Math.sin(angle * RAD); }

/** Shrink per inch of offset: travel - run for one inch, which equals tan(angle / 2). */
export function shrinkPerInch(angle) { return Math.tan((angle / 2) * RAD); }

/** Angle of the offset inside the rise and roll plane, measured from the rise direction. */
export function offsetAngle(rise, roll) { return Math.atan2(roll, rise) / RAD; }

/** Cut length of the piece between two fittings. */
export function cutLength(travelLen, takeoff) { return travelLen - 2 * takeoff; }

/** Scale a 45 degree take-off to another fitting angle (the arm length follows tan(angle / 2)). */
export function scaleTakeoff(takeoff45, angle) {
  return takeoff45 * Math.tan((angle / 2) * RAD) / Math.tan(22.5 * RAD);
}

/**
 * Take-off per fitting at 45 degrees, in inches, by material and nominal size.
 * Pipe take-off = centre to face of the fitting minus the socket depth (steel: centre to weld end).
 * PVC and copper values are typical for common fittings. Makers differ, so the page tells people to measure.
 * Steel values are ASME B16.9 long radius 45 degree elbows (centre to end).
 */
export const TAKEOFF_45 = {
  pvc: { label: 'PVC Sch 40', sizes: { '1/2': 3 / 8, '3/4': 7 / 16, '1': 1 / 2, '1-1/4': 9 / 16, '1-1/2': 5 / 8, '2': 3 / 4, '3': 1, '4': 1.25 } },
  copper: { label: 'Copper, solder', sizes: { '1/2': 5 / 16, '3/4': 3 / 8, '1': 1 / 2, '1-1/4': 9 / 16, '1-1/2': 11 / 16, '2': 7 / 8, '3': 1.25, '4': 1.625 } },
  steel: { label: 'Steel, butt weld', sizes: { '1': 5 / 8, '1-1/4': 13 / 16, '1-1/2': 7 / 8, '2': 1.25, '2-1/2': 1.625, '3': 1.875, '4': 2.5, '6': 3.75 } },
};

/** Round-trip safe lookup used by the page. Returns inches or NaN. */
export function takeoffFor(material, size, angle) {
  const m = TAKEOFF_45[material];
  if (!m || !(size in m.sizes)) return NaN;
  return scaleTakeoff(m.sizes[size], angle);
}

/** Everything the page needs for one calculation. Returns null when there is no usable input. */
export function calculate({ rise, roll, angle, takeoff = 0, firstMark = NaN }) {
  if (!(rise >= 0) || !(roll >= 0) || !(rise > 0 || roll > 0)) return null;
  if (!(angle > 0 && angle < 90)) return null;
  const t = trueOffset(rise, roll);
  const tr = travel(rise, roll, angle);
  const r = run(rise, roll, angle);
  const k = Number.isFinite(takeoff) && takeoff > 0 ? takeoff : 0;
  const cut = cutLength(tr, k);
  const mult = multiplier(angle);
  const spi = shrinkPerInch(angle);
  const shrink = t * spi;
  const mark1 = Number.isFinite(firstMark) && firstMark >= 0 ? firstMark : NaN;
  return {
    trueOffset: t, travel: tr, run: r, cut, takeoff: k,
    multiplier: mult, shrinkPerInch: spi, shrink,
    offsetAngle: offsetAngle(rise, roll),
    mark1, mark2: Number.isFinite(mark1) ? mark1 + tr : NaN,
    cutIsShort: cut <= 0,
  };
}
