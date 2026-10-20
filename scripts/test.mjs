import assert from 'node:assert/strict';
// What is covered: the math, length parsing and formatting, the take-off tables (values, order, sources),
// and the form helpers in src/lib/inputs.js (angle parsing, fraction buttons, saved-state checks).
// Not covered: the page script in Tool.astro (DOM, diagram). Check that in a browser.
import * as o from '../src/lib/offset.js';
import * as f from '../src/lib/inputs.js';

const near = (a, b, eps = 0.005, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg ?? ''} expected ${b}, got ${a}`);
let n = 0;
const test = (name, fn) => { fn(); n++; console.log('ok', name); };

test('known check: rise 12, roll 9, 45 deg', () => {
  const c = o.calculate({ rise: 12, roll: 9, angle: 45 });
  near(c.trueOffset, 15, 1e-9);
  near(c.travel, 21.2132, 0.0001);
  near(c.run, 15, 1e-9);
});
test('30 deg travel is twice the true offset', () => {
  near(o.travel(12, 9, 30), 30, 1e-9);
  near(o.run(12, 9, 30), 25.9808, 0.0001);
});
test('22.5 and 60 deg', () => {
  near(o.travel(12, 9, 22.5), 39.1969, 0.001);
  near(o.travel(12, 9, 60), 17.3205, 0.0001);
});
test('3-4-5 style: rise 3, roll 4 gives true offset 5', () => near(o.trueOffset(3, 4), 5, 1e-12));
test('zero roll is a plain offset', () => near(o.calculate({ rise: 8, roll: 0, angle: 45 }).trueOffset, 8, 1e-12));
test('multiplier table', () => {
  near(o.multiplier(45), 1.4142, 0.0001);
  near(o.multiplier(30), 2, 1e-9);
  near(o.multiplier(22.5), 2.6131, 0.0001);
  near(o.multiplier(10), 5.7588, 0.0001);
  near(o.multiplier(60), 1.1547, 0.0001);
});
test('shrink per inch matches bender rules of thumb', () => {
  near(o.shrinkPerInch(45), 0.4142, 0.0001); // 3/8 in per in
  near(o.shrinkPerInch(30), 0.2679, 0.0001); // 1/4 in per in
  near(o.shrinkPerInch(22.5), 0.1989, 0.0001); // 3/16 in per in
  near(o.shrinkPerInch(10), 0.0875, 0.0001); // 1/16 in per in
});
test('shrink equals travel minus run', () => {
  const c = o.calculate({ rise: 12, roll: 9, angle: 45 });
  near(c.shrink, c.travel - c.run, 1e-9);
  near(c.shrink, 6.2132, 0.0001);
});
test('cut length after two take-offs', () => {
  const c = o.calculate({ rise: 12, roll: 9, angle: 45, takeoff: 0.5 });
  near(c.cut, 20.2132, 0.0001);
});
test('take-off scales with fitting angle', () => {
  near(o.scaleTakeoff(0.5, 45), 0.5, 1e-12);
  near(o.scaleTakeoff(0.5, 22.5), 0.2398, 0.001);
  near(o.scaleTakeoff(0.5, 60), 0.6969, 0.001);
  near(o.takeoffFor('steel', '2', 45), 1.375, 1e-12);
  near(o.takeoffFor('steel', '2', 22.5), 1.375 * Math.tan(11.25 * Math.PI / 180) / Math.tan(22.5 * Math.PI / 180), 1e-12);
  assert.ok(Number.isNaN(o.takeoffFor('steel', '1/2', 45)));
});
test('take-off tables match the catalogs (32nds for PVC and copper, B16.9 for steel)', () => {
  const table = (id) => Object.fromEntries(o.materialById(id).sizes);
  assert.deepEqual(table('pvc'), { '1/2': 11 / 32, '3/4': 7 / 16, '1': 15 / 32, '1-1/2': 19 / 32, '2': 11 / 16, '3': 27 / 32, '4': 35 / 32 });
  assert.deepEqual(table('copper'), { '1/2': 9 / 32, '3/4': 11 / 32, '1': 3 / 8, '1-1/4': 17 / 32, '1-1/2': 19 / 32, '2': 25 / 32, '2-1/2': 29 / 32, '3': 9 / 8, '4': 25 / 16 });
  assert.deepEqual(table('steel'), { '1': 0.875, '1-1/4': 1, '1-1/2': 1.125, '2': 1.375, '2-1/2': 1.75, '3': 2, '4': 2.5, '6': 3.75 });
});
test('size menu order is small to large (not the object-key order)', () => {
  const n = (s) => o.parseLength(s.replace('-', ' '));
  for (const m of o.TAKEOFF) {
    const nums = m.sizes.map(([s]) => n(s));
    assert.deepEqual(nums, [...nums].sort((a, b) => a - b), m.id);
    assert.ok(m.sizes.some(([s]) => s === m.defaultSize), `${m.id} default size exists`);
  }
  assert.deepEqual(o.materialById('pvc').sizes.map(([s]) => s).slice(0, 3), ['1/2', '3/4', '1']);
});
test('PVC and copper take-off only at 45 degrees; steel scales and is marked approximate', () => {
  assert.ok(Number.isNaN(o.takeoffFor('pvc', '2', 22.5)));
  assert.ok(Number.isNaN(o.takeoffFor('copper', '3/4', 60)));
  near(o.takeoffFor('pvc', '3', 45), 27 / 32, 1e-12);
  assert.ok(Number.isFinite(o.takeoffFor('steel', '4', 60)));
  assert.equal(o.isApproximate('steel', 22.5), true);
  assert.equal(o.isApproximate('steel', 45), false);
  assert.equal(o.isApproximate('pvc', 45), false);
});
test('cut length uses the catalog take-off (3/4 copper, 12 x 9, 45 deg)', () => {
  const c = o.calculate({ rise: 12, roll: 9, angle: 45, takeoff: o.takeoffFor('copper', '3/4', 45) });
  near(c.cut, 20.5257, 0.0001); // 21.2132 - 2 x 11/32
});
test('offset angle in the rise and roll plane', () => {
  near(o.offsetAngle(12, 9), 36.8699, 0.001);
  near(o.offsetAngle(1, 1), 45, 1e-9);
});
test('first mark and second mark', () => {
  const c = o.calculate({ rise: 12, roll: 9, angle: 45, firstMark: 10 });
  near(c.mark2, 31.2132, 0.0001);
});
test('bad input returns null', () => {
  assert.equal(o.calculate({ rise: 0, roll: 0, angle: 45 }), null);
  assert.equal(o.calculate({ rise: NaN, roll: 3, angle: 45 }), null);
  assert.equal(o.calculate({ rise: 3, roll: 3, angle: 0 }), null);
  assert.equal(o.calculate({ rise: 3, roll: 3, angle: 90 }), null);
});
test('parse lengths', () => {
  assert.equal(o.parseLength('12'), 12);
  assert.equal(o.parseLength('12.5'), 12.5);
  assert.equal(o.parseLength('12 3/8'), 12.375);
  assert.equal(o.parseLength('12-3/8'), 12.375);
  assert.equal(o.parseLength('3/4'), 0.75);
  assert.equal(o.parseLength('12 3/8"'), 12.375);
  assert.equal(o.parseLength('.5'), 0.5);
  assert.ok(Number.isNaN(o.parseLength('abc')));
  assert.ok(Number.isNaN(o.parseLength('')));
  assert.ok(Number.isNaN(o.parseLength('1/0')));
  assert.ok(Number.isNaN(o.parseLength('-4')));
});
test('parse feet and inches', () => {
  assert.equal(o.parseLength(`2'-3 1/2"`), 27.5);
  assert.equal(o.parseLength(`2' 3`), 27);
  assert.equal(o.parseLength(`2'3"`), 27);
  assert.equal(o.parseLength(`2'`), 24);
  assert.equal(o.parseLength('2 ft 3 in'), 27);
  assert.equal(o.parseLength(`10'-0"`), 120);
  assert.ok(Number.isNaN(o.parseLength(`2'-x`)));
  assert.ok(Number.isNaN(o.parseLength(`'3`)));
});
test('reject absurd lengths', () => {
  assert.ok(Number.isNaN(o.parseLength('1000000000000000000000')));
  assert.ok(Number.isNaN(o.parseLength('100001')));
  assert.equal(o.parseLength('100000'), 100000);
});
test('format to 1/16 inch', () => {
  assert.equal(o.formatInches(21.2132).frac, '21 3/16');
  assert.equal(o.formatInches(21.2132).dec, '21.21');
  assert.equal(o.formatInches(15).frac, '15');
  assert.equal(o.formatInches(0.5).frac, '1/2');
  assert.equal(o.formatInches(0.03).frac, '0');
  assert.equal(o.formatInches(20.2132).text, '20 3/16"');
  assert.equal(o.formatInches(11.97).frac, '12');
  assert.equal(o.formatInches(6.2132).frac, '6 3/16');
});
test('format never shows minus zero', () => {
  assert.equal(o.formatInches(-0.001).dec, '0.00');
  assert.equal(o.formatInches(-0.001).frac, '0');
  assert.equal(o.formatInches(-0.5).frac, '-1/2');
});
test('custom angle parses fractions and rejects junk', () => {
  assert.equal(f.parseAngle('22 1/2'), 22.5);
  assert.equal(f.parseAngle('11 1/4'), 11.25);
  assert.equal(f.parseAngle('22,5'), 22.5);
  assert.equal(f.parseAngle('22.5'), 22.5);
  assert.ok(Number.isNaN(f.parseAngle('45abc')));
  assert.ok(Number.isNaN(f.parseAngle('1e1')));
  assert.ok(Number.isNaN(f.parseAngle('')));
  assert.equal(f.parseAngle('1/2'), 0.5);
});
test('fraction buttons set the fraction and never drop digits', () => {
  assert.equal(f.applyFraction('12', '1/4'), '12 1/4');
  assert.equal(f.applyFraction('12 1/4', '3/8'), '12 3/8');
  assert.equal(f.applyFraction('12 1/4', '1/4'), '12');
  assert.equal(f.applyFraction('', '1/2'), '1/2');
  assert.equal(f.applyFraction('1/2', '1/2'), '');
  assert.equal(f.applyFraction('3/8', '1/4'), '1/4');
  assert.equal(f.applyFraction('12-3/8', '1/2'), '12 1/2');
  assert.equal(f.applyFraction('12.5', '1/4'), null); // field is left alone
  assert.equal(f.applyFraction('abc', '1/4'), null);
  assert.equal(f.applyFraction(`2'-3`, '1/4'), null);
});
test('exact fraction text for table take-offs', () => {
  assert.equal(f.fractionText(11 / 32), '11/32');
  assert.equal(f.fractionText(1 + 3 / 32), '1 3/32');
  assert.equal(f.fractionText(2), '2');
  assert.equal(f.fractionText(0.2398), '0.24');
});
test('saved state is checked: bad types, ranges and custom angle text', () => {
  assert.equal(f.sanitizeSaved(null), null);
  assert.equal(f.sanitizeSaved('x'), null);
  const bad = f.sanitizeSaved({ mode: 'hax', angle: { pipe: null, emt: 200 }, customText: { pipe: 'abc', emt: '22 1/2' }, rise: 5, roll: '9', material: 'lead' });
  assert.equal(bad.mode, 'pipe');
  assert.equal(bad.angle.pipe, 45); // saved null falls back to the default
  assert.equal(bad.angle.emt, 22.5); // custom text wins over a bad number
  assert.equal(bad.customText.pipe, ''); // junk text is dropped, so field and answer agree
  assert.equal(bad.customText.emt, '22 1/2');
  assert.equal(bad.rise, '');
  assert.equal(bad.roll, '9');
  assert.equal(bad.material, '');
  const ok = f.sanitizeSaved({ mode: 'emt', angle: { pipe: 60, emt: 10 }, customText: {}, material: 'steel', size: '2' });
  assert.deepEqual([ok.mode, ok.angle.pipe, ok.angle.emt, ok.material, ok.size], ['emt', 60, 10, 'steel', '2']);
});
test('default angles', () => {
  assert.deepEqual(f.DEFAULT_ANGLE, { pipe: 45, emt: 30 });
  assert.ok(f.PRESETS.pipe.includes(f.DEFAULT_ANGLE.pipe) && f.PRESETS.emt.includes(f.DEFAULT_ANGLE.emt));
});
test('fitting roll angle: 12 rise, 9 roll gives 53.1 from level and 36.9 from plumb', () => {
  near(o.fittingRoll(12, 9), 53.1301, 0.001);
  near(o.fittingRoll(12, 9) + o.offsetAngle(12, 9), 90, 1e-9);
  near(o.fittingRoll(5, 5), 45, 1e-9);
});
test('same offset at other angles', () => {
  const a = o.alternatives(12, 9, [22.5, 30, 45, 60]);
  near(a[1].travel, 30, 1e-9);
  near(a[2].travel, 21.2132, 0.0001);
  near(a[2].run, 15, 1e-9);
  near(a[3].multiplier, 1.1547, 0.0001);
});
test('fits in run: room left and shallowest fitting', () => {
  let r = o.fitsInRun(12, 9, 45, 18, [22.5, 45, 60]);
  near(r.room, 3, 1e-9);
  assert.equal(r.shallowest, 45); // 22.5 needs 36.2 in
  r = o.fitsInRun(12, 9, 45, 10, [22.5, 45, 60]);
  near(r.room, -5, 1e-9);
  assert.equal(o.fitsInRun(12, 9, 45, 5, [22.5, 45, 60]).shallowest, null);
  assert.equal(r.shallowest, 60); // 60 deg needs 8.66 in
});
test('millimeters', () => {
  near(o.parseMm('254'), 10, 1e-9);
  near(o.parseMm('25,4 mm'), 1, 1e-9);
  assert.ok(Number.isNaN(o.parseMm('12 1/2')));
  assert.ok(Number.isNaN(o.parseMm('')));
  assert.ok(Number.isNaN(o.parseMm('-3')));
  assert.equal(o.formatMm(15).text, '381.0 mm');
  assert.equal(o.formatMm(-0.0001).text, '0.0 mm');
});
test('every take-off table has a source link', () => {
  for (const m of o.TAKEOFF) assert.ok(m.links.length && m.links.every(([label, href]) => label && href.startsWith('https://')), m.id);
});
test('share link round trip', () => {
  const q = f.encodeShare({ mode: 'pipe', unit: 'in', rise: '12', roll: '9 1/2', angleText: '45', material: 'copper', size: '3/4', takeoff: '11/32', fit: '18' });
  const s = f.sanitizeSaved(f.decodeShare('#' + q));
  assert.deepEqual([s.mode, s.rise, s.roll, s.angle.pipe, s.material, s.size, s.takeoff, s.fit, s.unit], ['pipe', '12', '9 1/2', 45, 'copper', '3/4', '11/32', '18', 'in']);
  const e = f.sanitizeSaved(f.decodeShare('#m=emt&u=mm&r=305&l=230&a=11.25&k=250'));
  assert.deepEqual([e.mode, e.unit, e.rise, e.angle.emt, e.customText.emt, e.mark1], ['emt', 'mm', '305', 11.25, '11.25', '250']);
  assert.equal(f.decodeShare(''), null);
  const junk = f.sanitizeSaved(f.decodeShare('#m=zzz&a=999&mat=lead&u=km'));
  assert.deepEqual([junk.mode, junk.angle.pipe, junk.material, junk.unit], ['pipe', 45, '', 'in']);
});
console.log(`\n${n} tests passed`);
