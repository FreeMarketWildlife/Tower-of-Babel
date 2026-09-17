const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const s = {window: {}, Math, Number, Object};
vm.createContext(s);
for (const file of ['palette.js', 'sky.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../buttonwood', file), 'utf8'), s);
}
const A = s.window.ButtonwoodArt;
const at = (seconds, day = 1) => A.skyState(seconds, day);
const distance = (a, b) => Math.max(...Object.keys(a.colors).flatMap(k => a.colors[k].map((v, i) => Math.abs(v - b.colors[k][i]))));

// Every palette key and clock boundary is continuous, including the saved day wrap.
for (const boundary of [0, 9, 20, 30, 150, 160, 172, 180, 240]) {
  const before = boundary === 0 ? at(239.9999, 1) : at(boundary - .0001, 2);
  const after = boundary === 0 ? at(.0001, 2) : at(boundary + .0001, 2);
  assert.ok(distance(before, after) < .01, `continuous palette at ${boundary}`);
  for (const field of ['darkness', 'sunAlpha', 'moonAlpha', 'starAlpha']) {
    assert.ok(Math.abs(before[field] - after[field]) < .0001, `continuous ${field} at ${boundary}`);
  }
  assert.ok(Math.abs(before.tint.alpha - after.tint.alpha) < .0001, `continuous ambient light at ${boundary}`);
}
assert.equal(at(0).darkness, 1);
assert.equal(at(15).darkness, .5);
assert.equal(at(30).darkness, 0);
assert.equal(at(150).darkness, 0);
assert.equal(at(165).darkness, .5);
assert.equal(at(180).darkness, 1);
assert.equal(at(239).darkness, 1);
assert.equal(at(29.999).phase, 'sunrise');
assert.equal(at(30).phase, 'day');
assert.equal(at(149.999).phase, 'day');
assert.equal(at(150).phase, 'sunset');
assert.equal(at(179.999).phase, 'sunset');
assert.equal(at(180).phase, 'night');
assert.equal(at(240, 1).absoluteSeconds, at(0, 2).absoluteSeconds);
assert.deepEqual(at(240, 1), at(0, 2));
let previousDawn = 1, previousDusk = 0;
for (let t = 0; t <= 30; t += .125) {
  const dawn = at(t).darkness, dusk = at(150 + t).darkness;
  assert.ok(dawn <= previousDawn && dusk >= previousDusk, 'light progresses throughout each 30-second transition');
  previousDawn = dawn; previousDusk = dusk;
}
// Rendering consumes clock values without owning or advancing them.
const clock = Object.freeze({day: 8, phase: 'day', elapsed: 165000});
const serialized = JSON.stringify(clock), expected = at(clock.elapsed / 1000, clock.day);
for (let i = 0; i < 100; i++) assert.deepEqual(at(clock.elapsed / 1000, clock.day), expected);
assert.equal(JSON.stringify(clock), serialized);

let calls = [];
const stack = [];
const g = {
  globalAlpha: .7, fillStyle: '#000000',
  save() { stack.push({globalAlpha: this.globalAlpha, fillStyle: this.fillStyle}); },
  restore() { Object.assign(this, stack.pop()); },
  fillRect(x, y, w, h) {
    assert.ok([x, y, w, h].every(Number.isInteger), 'all sky rectangles use integer world pixels');
    assert.ok(w >= 0 && h >= 0, 'no negative pixel spans');
    assert.ok(Number.isFinite(this.globalAlpha) && this.globalAlpha >= 0 && this.globalAlpha <= 1);
    assert.match(this.fillStyle, /^#[0-9a-f]{6}$/);
    calls.push({x, y, w, h, color: this.fillStyle, alpha: this.globalAlpha});
  }
};
for (const [width, height, ground, camX] of [[640, 420, 270, 0], [390, 844, 400, -192], [320, 210, 140, 135], [1024, 820, 3100, 960], [640, 420, 0, 0], [640, 420, -400, -8000]]) {
  for (const seconds of [0, 9, 15, 30, 100, 150, 160, 172, 180, 225, 239.999]) {
    calls = [];
    const options = Object.freeze({width, height, ground, camX, seconds, day: 4});
    const result = A.paintSky(g, options);
    assert.deepEqual(result, at(seconds, 4));
    assert.equal(g.globalAlpha, .7, 'renderer restores the caller alpha');
    assert.equal(g.fillStyle, '#000000', 'renderer restores the caller fill color');
    assert.equal(stack.length, 0);
    assert.deepEqual(calls[0], {x: 0, y: 0, w: width, h: height, color: calls[0].color, alpha: 1}, 'cave fills the complete frame first');
    if (ground <= 0) assert.equal(calls.length, 1, 'sky never leaks below ground');
    else {
      assert.ok(calls.length > (ground <= height ? 6 : 1), 'native bands and visible scenery render');
      for (const p of calls.slice(1)) {
        assert.ok(p.x >= 0 && p.y >= 0 && p.x + p.w <= width && p.y + p.h <= Math.min(height, ground), 'scenery clips to sky and viewport');
      }
    }
  }
}
// Invalid optional camera/clock input must not introduce NaN in an otherwise usable frame.
calls = [];
A.paintSky(g, {width: 320.2, height: 210.1, ground: 120.6, seconds: NaN, day: Infinity, camX: NaN});
assert.ok(calls.length > 6);
console.log('PASS Buttonwood: 30-second dawn/dusk, continuous palettes/light/day wrap, saved-clock purity, native pixels and underground clipping');
