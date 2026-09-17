'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the real rendering helpers without loading the DOM or physics engine.
const integration = fs.readFileSync(path.join(__dirname, '../buttonwood/integration.txt'), 'utf8');
const start = integration.indexOf('const bwTerrainDirections=');
const end = integration.indexOf('\nartTileV32=function', start);
assert.ok(start >= 0 && end > start, 'Buttonwood terrain helper block exists');
const source = integration.slice(start, end);
const key = (x, y) => `${x},${y}`;
const plain = value => JSON.parse(JSON.stringify(value));

function world() {
  const bs = new Set(), grid = new Map();
  const scope = { B: 32, bs, grid, key, artPaletteV32: Object.fromEntries(
    ['dirt', 'stone', 'deepslate', 'bedrock', 'obsidian', 'wood', 'leaves'].map(k => [k, []])),
  };
  vm.runInNewContext(source + '\nglobalThis.index = bwIndexTerrain; globalThis.neighbors = bwTerrainNeighbors;', scope);
  const body = (cx, cy, material = 'dirt', options = {}) => {
    const cols = options.cols ?? 1, rows = options.rows ?? 1;
    const z = {
      position: { x: cx * 32 + cols * 16, y: cy * 32 + rows * 16 },
      velocity: { x: 0, y: 0 }, angle: 0, angularVelocity: 0,
      isStatic: options.terrain === true, isSleeping: options.terrain !== true,
      game: { material, terrain: options.terrain === true, placed: options.terrain !== true,
        cx: options.terrain ? cx : null, cy: options.terrain ? cy : null,
        w: cols * 32 - 1, h: rows * 32 - 1 },
    };
    bs.add(z);
    if (z.game.terrain) grid.set(key(cx, cy), z);
    return z;
  };
  return {
    bs, grid, body, index: scope.index,
    neighbors: (z, x = 0, y = 0, cols = 1, rows = 1) => plain(scope.neighbors(z, x, y, cols, rows)),
  };
}

let failures = 0;
function test(name, fn) {
  try { fn(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}\n${error.stack}`); }
}

test('all eight neighbors use world coordinates across negative cells', () => {
  const w = world(), center = w.body(-3, -4, 'dirt', { terrain: true });
  const around = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0],
    ne: [1, -1], se: [1, 1], sw: [-1, 1], nw: [-1, -1] };
  for (const [side, [dx, dy]] of Object.entries(around)) w.body(-3 + dx, -4 + dy, side, { terrain: true });
  w.index();
  assert.deepEqual(w.neighbors(center), { cx: -3, cy: -4, neighbors: {
    meadow: false, n: 'n', e: 'e', s: 's', w: 'w', ne: 'ne', se: 'se', sw: 'sw', nw: 'nw',
  } });
});

test('excavation and removed placements lose their joins on the next render', () => {
  const w = world(), center = w.body(0, 0, 'dirt', { terrain: true });
  const natural = w.body(-1, 0, 'stone', { terrain: true });
  const placed = w.body(1, 0, 'dirt');
  w.index();
  assert.equal(w.neighbors(center).neighbors.w, 'stone');
  assert.equal(w.neighbors(center).neighbors.e, 'dirt');
  w.bs.delete(natural); w.grid.delete('-1,0'); w.bs.delete(placed);
  w.index();
  assert.equal(w.neighbors(center).neighbors.w, null);
  assert.equal(w.neighbors(center).neighbors.e, null);
});

test('aligned settled 2×2 placements join internally and with adjacent world cells', () => {
  const w = world(), piece = w.body(-4, -3, 'dirt', { cols: 2, rows: 2 });
  w.body(-4, -4, 'bedrock', { terrain: true });
  w.body(-5, -4, 'obsidian', { terrain: true });
  const east = w.body(-2, -2, 'stone'); east.isStatic = true; east.isSleeping = false;
  w.index();
  assert.deepEqual(w.neighbors(piece, 0, 0, 2, 2), { cx: -4, cy: -3, neighbors: {
    meadow: false, n: 'bedrock', e: 'dirt', s: 'dirt', w: null,
    ne: null, se: 'dirt', sw: null, nw: 'obsidian',
  } });
  assert.equal(w.neighbors(piece, 1, 1, 2, 2).neighbors.e, 'stone');
  assert.equal(w.neighbors(east).neighbors.w, 'dirt');
});

test('moving, rotated, unsnapped, malformed, and freshly awake pieces do not join the world', () => {
  const changes = {
    translatedX: z => { z.position.x += 1; },
    translatedY: z => { z.position.y += 1; },
    rotated: z => { z.angle = .02; },
    moving: z => { z.velocity.x = .1; },
    spinning: z => { z.angularVelocity = .02; },
    malformedSize: z => { z.game.w = 30; },
    freshlyAwake: z => { z.isSleeping = false; z.isStatic = false; },
    naturalTree: z => { z.game.naturalTree = true; },
    unsupportedMaterial: z => { z.game.material = 'unrecognized'; },
  };
  for (const [name, change] of Object.entries(changes)) {
    const w = world(), ground = w.body(0, 0, 'dirt', { terrain: true }), piece = w.body(1, 0);
    change(piece); w.index();
    assert.equal(w.neighbors(ground).neighbors.e, null, `${name} is excluded from neighboring terrain`);
    assert.equal(w.neighbors(piece).neighbors.w, null, `${name} cannot borrow a terrain join`);
  }
});

test('a moving multi-block piece keeps its own internal texture joins', () => {
  const w = world(), piece = w.body(-7, 3, 'stone', { cols: 2, rows: 2 });
  piece.isSleeping = false; piece.velocity.x = 2; piece.angle = .3;
  w.body(-8, 3, 'dirt', { terrain: true }); w.index();
  const n = w.neighbors(piece, 0, 0, 2, 2).neighbors;
  assert.equal(n.e, 'stone'); assert.equal(n.s, 'stone'); assert.equal(n.se, 'stone');
  assert.equal(n.n, null); assert.equal(n.w, null);
});

test('overlapping placements suppress joins in both directions until the overlap is removed', () => {
  const w = world(), ground = w.body(0, 0, 'dirt', { terrain: true });
  const a = w.body(1, 0, 'dirt'), b = w.body(1, 0, 'stone');
  w.index();
  assert.equal(w.neighbors(ground).neighbors.e, null, 'Outside tile does not join an ambiguous target');
  assert.equal(w.neighbors(a).neighbors.w, null, 'An ambiguous source does not join an outside tile');
  assert.equal(w.neighbors(b).neighbors.w, null, 'Neither overlapping material claims an outside join');
  w.bs.delete(b); w.index();
  assert.equal(w.neighbors(ground).neighbors.e, 'dirt');
  assert.equal(w.neighbors(a).neighbors.w, 'dirt');
});

test('a partly overlapped piece retains its interior but cannot lend any external joins', () => {
  const w = world(), piece = w.body(-2, -2, 'dirt', { cols: 2, rows: 2 });
  const ground = w.body(-2, -3, 'dirt', { terrain: true });
  w.body(-1, -2, 'dirt'); w.body(-1, -2, 'stone'); w.index();
  assert.equal(w.neighbors(piece, 0, 0, 2, 2).neighbors.e, 'dirt', 'An overlapping piece retains its own interior');
  assert.equal(w.neighbors(piece, 0, 1, 2, 2).neighbors.ne, 'dirt', 'Internal diagonal texture stays coherent');
  assert.equal(w.neighbors(piece, 0, 0, 2, 2).neighbors.n, null, 'The conflicted body cannot borrow outside joins');
  assert.equal(w.neighbors(ground).neighbors.s, null, 'Even a clear cell of a conflicted body cannot lend a join');
  assert.equal(w.neighbors(ground).neighbors.se, null, 'Three overlapping bodies still produce an ambiguous diagonal');
});

test('meadow decoration belongs only to natural surface dirt', () => {
  const w = world();
  const surface = w.body(0, 0, 'dirt', { terrain: true });
  const underground = w.body(0, 1, 'dirt', { terrain: true });
  const rock = w.body(1, 0, 'stone', { terrain: true });
  const placed = w.body(2, 0, 'dirt'); w.index();
  assert.equal(w.neighbors(surface).neighbors.meadow, true);
  for (const z of [underground, rock, placed]) assert.equal(w.neighbors(z).neighbors.meadow, false);
});

test('indexing and repeated neighbor reads leave physics bodies and world grid untouched', () => {
  const w = world(), dirt = w.body(0, 0, 'dirt', { terrain: true });
  const piece = w.body(-2, -2, 'stone', { cols: 2, rows: 2 });
  const moving = w.body(1, 0); moving.velocity.y = 3; moving.isSleeping = false;
  const bodies = [...w.bs], cells = [...w.grid], before = JSON.stringify(bodies);
  for (let i = 0; i < 20; i++) {
    w.index(); w.neighbors(dirt); w.neighbors(piece, 0, 0, 2, 2); w.neighbors(moving);
  }
  assert.equal(JSON.stringify([...w.bs]), before);
  assert.deepEqual([...w.bs], bodies); assert.deepEqual([...w.grid], cells);
  assert.equal(w.grid.size, 1, 'The visual index never inserts placed pieces into the physics grid');
});

if (failures) process.exitCode = 1;
