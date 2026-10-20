// Pure helpers for the calculator form. The page script calls these, and scripts/test.mjs tests them.
import { parseLength, TAKEOFF } from './offset.js';

/** Fitting or bend angles offered as buttons, per mode. */
export const PRESETS = { pipe: [22.5, 45, 60], emt: [10, 22.5, 30, 45, 60] };
/** Start-up angle per mode. One place, so reset, load and the first paint agree. */
export const DEFAULT_ANGLE = { pipe: 45, emt: 30 };

/** Parse the custom angle field. Accepts 22.5, 22,5, 22 1/2. Returns NaN for empty or junk. */
export function parseAngle(text) {
  // A degree sign or the word degrees after the number is allowed (45°, 22.5 deg).
  const t = String(text ?? '').trim().replace(/\s*(°|degrees?|deg)$/i, '').trim();
  if (!t) return NaN;
  return parseLength(/^\d+,\d+$/.test(t) ? t.replace(',', '.') : t);
}

/**
 * Set the fraction part of a length field, from a fraction button.
 * "12" + 1/4 gives "12 1/4". "12 1/4" + 1/4 again gives "12" (toggle off). "12 1/4" + 3/8 gives "12 3/8".
 * Returns null when the text is not a whole number with an optional fraction (for example 12.5 or 2'-3),
 * so the caller can leave the field alone and tell the user, instead of dropping digits.
 */
export function applyFraction(text, frac) {
  const m = String(text ?? '').trim().replace(/(\d)-(\d)/, '$1 $2').match(/^(\d+)?\s*(?:(\d+\/\d+))?$/);
  if (!m) return null;
  const whole = m[1] ?? '0';
  if (m[2] === frac) return whole === '0' ? '' : whole;
  return whole === '0' ? frac : `${whole} ${frac}`;
}

/** Format a table take-off exactly: catalog values are in 32nds, so "11/32" and "1 3/32" stay exact. */
export function fractionText(x, maxDen = 32) {
  const n = Math.round(x * maxDen);
  if (Math.abs(n / maxDen - x) > 1e-9) return String(Math.round(x * 1000) / 1000);
  let num = n % maxDen, den = maxDen;
  const whole = Math.floor(n / maxDen);
  while (num && num % 2 === 0) { num /= 2; den /= 2; }
  if (!num) return String(whole);
  return whole ? `${whole} ${num}/${den}` : `${num}/${den}`;
}

const MODES = ['pipe', 'emt'];
const clip = (v) => (typeof v === 'string' ? v.slice(0, 40) : '');
const validAngle = (a) => typeof a === 'number' && a > 0 && a < 90;

/**
 * Check what came back from localStorage. Never trust it: wrong types and ranges fall back to defaults.
 * A saved custom angle text is parsed again, and wins over a saved number, so the field and the answer agree.
 * Returns null when there is nothing usable.
 */
export function sanitizeSaved(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const out = {
    mode: MODES.includes(raw.mode) ? raw.mode : 'pipe',
    angle: { ...DEFAULT_ANGLE },
    customText: { pipe: '', emt: '' },
    rise: clip(raw.rise), roll: clip(raw.roll), takeoff: clip(raw.takeoff), mark1: clip(raw.mark1), fit: clip(raw.fit), jgap: clip(raw.jgap),
    unit: raw.unit === 'mm' ? 'mm' : 'in',
    material: '', size: clip(raw.size),
  };
  for (const m of MODES) {
    if (validAngle(raw.angle?.[m])) out.angle[m] = raw.angle[m];
    const text = clip(raw.customText?.[m]).trim();
    if (text) {
      const a = parseAngle(text);
      if (validAngle(a)) { out.angle[m] = a; out.customText[m] = text; }
    }
  }
  if (raw.material === 'custom' || TAKEOFF.some((t) => t.id === raw.material)) out.material = raw.material;
  return out;
}

const SHARE_KEYS = { m: 'mode', r: 'rise', l: 'roll', t: 'takeoff', k: 'mark1', f: 'fit', g: 'jgap', u: 'unit', mat: 'material', sz: 'size' };

/** Turn the form state into a short query string for the share link. Empty fields are left out. */
export function encodeShare(s) {
  const q = new URLSearchParams();
  const put = (k, v) => { if (v !== undefined && v !== null && String(v).trim() !== '') q.set(k, String(v).trim()); };
  put('m', s.mode); put('r', s.rise); put('l', s.roll); put('a', s.angleText);
  put('u', s.unit === 'mm' ? 'mm' : ''); put('mat', s.material); put('sz', s.material && s.material !== 'custom' ? s.size : '');
  put('t', s.takeoff); put('k', s.mark1); put('f', s.fit); put('g', s.jgap);
  return q.toString();
}

/** Read a share link (the part after #) into the same shape sanitizeSaved checks. Returns null when it holds nothing. */
export function decodeShare(hash) {
  const q = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  if (![...q.keys()].length) return null;
  const raw = { angle: {}, customText: {} };
  for (const [k, name] of Object.entries(SHARE_KEYS)) if (q.has(k)) raw[name] = q.get(k);
  const mode = MODES.includes(raw.mode) ? raw.mode : 'pipe';
  const a = parseAngle(q.get('a'));
  if (validAngle(a)) {
    raw.angle[mode] = a;
    if (!PRESETS[mode].includes(a)) raw.customText[mode] = String(q.get('a')).slice(0, 40);
  }
  return raw;
}
