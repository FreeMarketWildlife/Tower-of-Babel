'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const sandbox = {window: {}};
vm.createContext(sandbox);
for (const file of ['palette.js', 'fog.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'buttonwood', file), 'utf8'), sandbox);
}
const A = sandbox.window.ButtonwoodArt, F = A.burialFog;
assert.equal(F.maxLayer, 10);
assert.equal(F.firstOpacity, .28);
assert.equal(F.maxOpacity, .96);
assert.equal(F.opacity(0), 0, 'exposed terrain keeps its native colors');
assert.equal(F.opacity(1), .28, 'first inaccessible layer is visibly shaded');
assert.equal(F.opacity(10), .96, 'ten layers reaches the almost-black cap');
assert.equal(F.opacity(100), .96, 'deep burial never becomes completely opaque');
for (let n = 1; n <= 10; n++) {
  assert.ok(F.opacity(n) > F.opacity(n - 1), 'every additional layer is darker: ' + n);
  assert.ok(F.opacity(n) < 1, 'native color remains beneath every layer');
}
assert.match(A.palette.buriedShade, /^#[0-9a-f]{6}$/i);
assert.notEqual(A.palette.buriedShade, '#000000', 'deep fog retains the warm palette floor');

const surface = F.build({left: -7, top: -2, width: 15, height: 18, isExposed: (_x, y) => y <= 0});
assert.equal(surface.left, -7); assert.equal(surface.top, -2);
assert.equal(surface.width, 15); assert.equal(surface.height, 18);
assert.equal(surface.layers.length, 15 * 18);
for (let y = -2; y < 16; y++) for (let x = -7; x < 8; x++) {
  assert.equal(surface.at(x, y), Math.max(0, Math.min(10, y)), 'vertical depth from the exposed surface');
}
assert.equal(surface.at(-8, 0), 10, 'outside the prepared field does not invent light');
assert.equal(surface.at(8, 0), 10);
assert.equal(surface.at(0, 16), 10);

const tunnel = F.build({left: -18, top: -5, width: 35, height: 17, isExposed: (x, y) => x === -4 && y === 3});
for (let y = -5; y < 12; y++) for (let x = -18; x < 17; x++) {
  assert.equal(tunnel.at(x, y), Math.min(10, Math.abs(x + 4) + Math.abs(y - 3)), 'cardinal depth around a negative-coordinate opening');
}
assert.equal(tunnel.at(-3, 4), 2, 'a diagonal corner does not count as an exposed side');

const dark = F.build({left: -5, top: 15, width: 20, height: 16, isExposed: () => false});
assert.ok(Array.from(dark.layers).every(n => n === 10), 'an enclosed region with no known opening stays dark');
const twoOpenings = F.build({left: 0, top: 0, width: 15, height: 15, isExposed: (x, y) => (x === 1 && y === 2) || (x === 12 && y === 11)});
for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) {
  assert.equal(twoOpenings.at(x, y), Math.min(10, Math.abs(x - 1) + Math.abs(y - 2), Math.abs(x - 12) + Math.abs(y - 11)), 'nearest exposed side wins');
}
const repeat = F.build({left: -18, top: -5, width: 35, height: 17, isExposed: (x, y) => x === -4 && y === 3});
assert.deepEqual(Array.from(repeat.layers), Array.from(tunnel.layers), 'field construction is deterministic');
console.log('PASS terrain fog: ten bounded opacity levels, cardinal exposure distance, negative coordinates, multiple openings and enclosed darkness');
