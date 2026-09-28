const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const sandbox = {window: {}};
vm.createContext(sandbox);
for (const file of ['biomes.js', 'buttonwood/palette.js', 'buttonwood/sky.js', 'buttonwood/biomes.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), sandbox);
}
const B = sandbox.window.ButtonwoodBiomes, A = sandbox.window.ButtonwoodArt;
const ids = ['mountains', 'plains', 'jungle', 'ocean'];
const sum = weights => Object.values(weights).reduce((a, b) => a + b, 0);
const near = (a, b) => Math.abs(a - b) < .00001;
const orders = new Set();
for (const seed of [0, 1, 2, 7, 999, 829041, 2147483648, 4294967295]) {
  assert.equal(B.biomeAt(seed, 0), 'mountains');
  assert.equal(B.weightsAt(seed, 0).mountains, 1, 'spawn is well inside a full mountain region');
  const order = [];
  for (let i = -100; i <= 100; i++) {
    const region = B.regionAt(seed, i * B.span);
    assert.equal(region.index, i);
    assert.ok(region.width >= 2304 && region.width <= 3840, 'large, seed-jittered region');
    assert.equal(B.regionAt(seed, region.start).index, i, 'inclusive start');
    assert.equal(B.regionAt(seed, region.end).index, i + 1, 'exclusive end');
    assert.equal(B.regionAt(seed, region.end).start, region.end, 'no gaps or overlaps');
    for (const x of [region.start, region.start + 100, (region.start + region.end) / 2, region.end - 100, region.end]) {
      const weights = B.weightsAt(seed, x);
      assert.ok(near(sum(weights), 1));
      assert.ok(Object.values(weights).every(v => Number.isFinite(v) && v >= 0 && v <= 1));
      assert.deepEqual(B.regionAt(seed, x), B.regionAt(seed, x), 'stable without mutable world state');
    }
    for (const edge of [region.start - B.transition / 2, region.start, region.start + B.transition / 2]) {
      const before = B.weightsAt(seed, edge - .0001), after = B.weightsAt(seed, edge + .0001);
      assert.ok(ids.every(id => near(before[id], after[id])), 'continuous music/scenery border including negative coordinates');
    }
    order.push(region.id);
  }
  assert.equal(new Set(order).size, 4, 'every biome occurs to explore');
  for (let i = 0; i < 200; i += 4) assert.equal(new Set(order.slice(i, i + 4)).size, 4, 'shuffled blocks preserve biome diversity');
  orders.add(order.join(','));
}
assert.equal(orders.size, 8, 'world seed changes region order');
assert.equal(B.biomeAt(NaN, Infinity), 'mountains', 'invalid optional seed/coordinate falls back safely');

let calls = [], stack = [];
const g = {
  globalAlpha: .4, fillStyle: '#000000',
  save() { stack.push({globalAlpha: this.globalAlpha, fillStyle: this.fillStyle}); },
  restore() { Object.assign(this, stack.pop()); },
  fillRect(x, y, w, h) {
    assert.ok([x, y, w, h].every(Number.isInteger), 'native integer rectangles');
    assert.ok(w > 0 && h > 0, 'visible spans only');
    assert.ok(Number.isFinite(this.globalAlpha) && this.globalAlpha >= 0 && this.globalAlpha <= 1);
    assert.match(this.fillStyle, /^#[0-9a-f]{6}$/);
    calls.push({x, y, w, h, color: this.fillStyle, alpha: this.globalAlpha});
  }
};
const silhouettes = new Set();
for (const id of ids) for (const [width, height, ground, camX] of [
  [800, 340, 320, 0], [390, 844, 530, -8145], [320, 210, 140, 3419],
  [1024, 820, 3100, 960], [640, 420, 0, 0], [640, 420, -400, -8000]
]) for (const seconds of [15, 80, 165, 210]) {
  calls = [];
  const weights = Object.freeze(Object.fromEntries(ids.map(k => [k, k === id ? 1 : 0])));
  const options = Object.freeze({width, height, ground, camX, seconds, day: 6, biomeWeights: weights, biomeSeed: 843290});
  const state = A.paintSky(g, options);
  assert.equal(state.phase, A.skyState(seconds, 6).phase);
  assert.equal(g.globalAlpha, .4); assert.equal(g.fillStyle, '#000000'); assert.equal(stack.length, 0);
  for (const r of calls.slice(1)) {
    assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= width && r.y + r.h <= Math.min(height, ground), 'all scenery clips above real ground');
  }
  if (ground <= 0) assert.equal(calls.length, 1, 'underground never draws surface scenery');
  if (width === 800 && seconds === 80) silhouettes.add(JSON.stringify(calls));
}
assert.equal(silhouettes.size, 4, 'all four biome scenes have distinct native compositions');
console.log('PASS biomes: deterministic seeded regions, mountain spawn, diverse large regions, continuous borders, native scenery, all phases, phone/desktop/underground clipping');
