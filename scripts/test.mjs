import assert from 'node:assert/strict';
import * as o from '../src/lib/offset.js';

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
  near(o.takeoffFor('steel', '2', 45), 1.25, 1e-12);
  assert.ok(Number.isNaN(o.takeoffFor('steel', '1/2', 45)));
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
console.log(`\n${n} tests passed`);
