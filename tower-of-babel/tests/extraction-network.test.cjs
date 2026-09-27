'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Network = require('../extraction-network.js');
const tests = [];
const test = (name, run) => tests.push({ name, run });
const pipe = (x, y, kind) => kind ? { x, y, kind } : { x, y };
const pump = (id = 'pump', intake = pipe(0, 0), outlet = pipe(5, 0), options = {}) => ({ id, intake, outlet, ...options });
const tank = (id = 'tank', ports = [pipe(6, 0)], options = {}) => ({ id, ports, amount: 0, kind: null, capacity: 32, ...options });
const basic = () => ({ pipes: [pipe(0, 0), pipe(0, 1), pipe(5, 0), pipe(6, 0)], pumps: [pump()], tanks: [tank()] });
function reservoir(entries, extractionLimit = Infinity) {
  const cells = new Map(entries.map(([x, y, kind, amount]) => [x + ',' + y, { kind, amount }]));
  let queries = 0, extractions = 0;
  return {
    query(x, y) { queries++; const source = cells.get(x + ',' + y); return source && { ...source }; },
    extract(x, y, kind, requested) {
      extractions++;
      const source = cells.get(x + ',' + y);
      if (!source || source.kind !== kind) return 0;
      const actual = Math.min(source.amount, requested, extractionLimit);
      source.amount -= actual;
      return actual;
    },
    get remaining() { return [...cells.values()].reduce((sum, cell) => sum + cell.amount, 0); },
    get queries() { return queries; }, get extractions() { return extractions; },
  };
}
function conserved(before, adapter, result) {
  assert.ok(Math.abs(before - adapter.remaining - result.tanks.reduce((sum, current) => sum + current.amount, 0)) < 1e-10,
    'world liquid plus stored liquid must be conserved');
}

test('exposes identical browser and CommonJS API without a DOM', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../extraction-network.js'), 'utf8'), context);
  assert.equal(typeof context.window.ExtractionNetwork.update, 'function');
  assert.equal(typeof context.window.ExtractionNetwork.createNetwork, 'function');
  assert.deepEqual([...context.window.ExtractionNetwork.KINDS], ['oil', 'water', 'lava']);
});

test('moves exact fractional block quantities and never mutates caller records', () => {
  const state = basic(), snapshot = JSON.stringify(state), source = reservoir([[0, 1, 'oil', 3]]);
  const result = Network.update(state, 0.125, source);
  assert.equal(result.totalTransferred, 0.125);
  assert.equal(result.tanks[0].amount, 0.125);
  assert.equal(result.tanks[0].kind, 'oil');
  assert.equal(result.pumps[0].status, 'pumping');
  assert.equal(JSON.stringify(state), snapshot);
  assert.equal(result.componentTypes[result.componentByCell['0,0']], 'oil');
  assert.equal(result.componentTypes[result.componentByCell['5,0']], 'oil');
  conserved(3, source, result);
});

test('one intake cell is a valid shallow-pool terminal; a continued connector is excluded', () => {
  const state = basic(); state.pipes = [pipe(0, 0), pipe(5, 0), pipe(6, 0)];
  let source = reservoir([[0, 0, 'water', 2]]);
  assert.equal(Network.update(state, 1, source).totalTransferred, 1);
  state.pipes.push(pipe(0, 1));
  source = reservoir([[0, 0, 'water', 2]]);
  const result = Network.update(state, 1, source);
  assert.equal(result.pumps[0].status, 'dry');
  assert.equal(source.remaining, 2);
});

test('branch terminals ignore dry surface ends and split output across tanks', () => {
  const state = basic();
  state.pipes.push(pipe(0, 2), pipe(1, 1), pipe(2, 1), pipe(7, 0));
  state.tanks = [tank('a', [pipe(6, 0)], { capacity: 0.25 }), tank('b', [pipe(7, 0)])];
  const source = reservoir([[0, 2, 'oil', 4]]);
  const result = Network.update(state, 1, source);
  assert.deepEqual(result.tanks.map(current => current.amount), [0.25, 0.75]);
  assert.equal(result.totalTransferred, 1);
  conserved(4, source, result);
});

test('cycles terminate and do not invent a terminal inside a loop', () => {
  const state = basic();
  state.pipes = [pipe(0, 0), pipe(1, 0), pipe(0, 1), pipe(1, 1), pipe(5, 0), pipe(6, 0)];
  const source = reservoir([[1, 1, 'oil', 4]]);
  const result = Network.update(state, 1, source);
  assert.equal(result.components.length, 2);
  assert.equal(result.pumps[0].status, 'dry');
  assert.equal(source.extractions, 0);
});

test('an intake cycle with a real branch terminal can still pump', () => {
  const state = basic();
  state.pipes = [pipe(0, -1), pipe(0, 0), pipe(1, 0), pipe(0, 1), pipe(1, 1), pipe(1, 2), pipe(5, 0), pipe(6, 0)];
  state.pumps[0].intake = pipe(0, -1);
  const source = reservoir([[1, 2, 'water', 4]]), result = Network.update(state, 1, source);
  assert.equal(result.pumps[0].status, 'pumping');
  assert.equal(result.totalTransferred, 1);
  conserved(4, source, result);
});

test('inlet and outlet joined externally are a loop, never a working pump', () => {
  const state = basic();
  state.pipes.push(pipe(1, 0), pipe(2, 0), pipe(3, 0), pipe(4, 0));
  const source = reservoir([[0, 1, 'oil', 4]]);
  const result = Network.update(state, 1, source);
  assert.equal(result.pumps[0].status, 'loop');
  assert.equal(source.extractions, 0);
  assert.equal(source.remaining, 4);
});

test('missing intake, outlet, or reachable tank cannot destroy world liquid', () => {
  for (const [expected, edit] of [
    ['no-intake', state => { state.pipes = state.pipes.filter(cell => cell.x !== 0); }],
    ['no-outlet', state => { state.pipes = state.pipes.filter(cell => cell.x !== 5); }],
    ['no-tank', state => { state.tanks[0].ports = [pipe(99, 99)]; }],
  ]) {
    const state = basic(); edit(state);
    const source = reservoir([[0, 1, 'oil', 4]]), result = Network.update(state, 1, source);
    assert.equal(result.pumps[0].status, expected);
    assert.equal(source.remaining, 4);
    assert.equal(source.extractions, 0);
  }
});

test('full tanks stop extraction; partial headroom caps removal exactly', () => {
  const state = basic(); state.tanks[0] = tank('tank', [pipe(6, 0)], { amount: 31.75, kind: 'lava' });
  const source = reservoir([[0, 1, 'lava', 5]]);
  const result = Network.update(state, 1, source);
  assert.equal(result.totalTransferred, 0.25); assert.equal(result.tanks[0].amount, 32);
  conserved(36.75, source, result);
  const next = Network.update({ ...state, tanks: result.tanks }, 1, source);
  assert.equal(next.pumps[0].status, 'full');
  assert.equal(next.totalTransferred, 0); assert.equal(source.extractions, 1);
});

test('mixed intake sources, pipe types, or connected tank types prevent extraction', () => {
  for (const variant of ['sources', 'pipe', 'tank', 'two-tanks']) {
    const state = basic();
    const entries = [[0, 1, 'oil', 3]];
    if (variant === 'sources') { state.pipes.push(pipe(1, 1), pipe(2, 1), pipe(0, 2)); entries.push([2, 1, 'water', 2]); entries[0][1] = 2; }
    if (variant === 'pipe') state.pipes[0].kind = 'water';
    if (variant === 'tank') state.tanks[0] = tank('tank', [pipe(6, 0)], { amount: 1, kind: 'water' });
    if (variant === 'two-tanks') {
      state.tanks = [tank('a', [pipe(6, 0)], { amount: 1, kind: 'oil' }), tank('b', [pipe(6, 0)], { amount: 1, kind: 'lava' })];
    }
    const source = reservoir(entries), before = source.remaining;
    const result = Network.update(state, 1, source);
    assert.equal(result.pumps[0].status, 'mixed', variant);
    assert.equal(source.extractions, 0, variant); assert.equal(source.remaining, before);
  }
});

test('multiple pumps share one real source without duplication and order by id', () => {
  const state = basic();
  state.pumps = [pump('b'), pump('a')];
  const source = reservoir([[0, 1, 'water', 1.25]]), result = Network.update(state, 1, source);
  assert.deepEqual(result.pumps.map(current => [current.id, current.amount]), [['a', 1], ['b', 0.25]]);
  assert.equal(result.tanks[0].amount, 1.25); assert.equal(source.remaining, 0);
  conserved(1.25, source, result);
});

test('two intake networks cannot overwrite a shared tank with different liquids', () => {
  const state = basic();
  state.pipes.push(pipe(10, 0), pipe(10, 1));
  state.pumps.push(pump('z', pipe(10, 0), pipe(5, 0)));
  const source = reservoir([[0, 1, 'oil', 2], [10, 1, 'water', 2]]);
  const result = Network.update(state, 1, source);
  assert.equal(result.tanks[0].amount, 1); assert.equal(result.tanks[0].kind, 'oil');
  assert.deepEqual(result.pumps.map(current => current.status), ['pumping', 'mixed']);
  conserved(4, source, result);
});

test('tank ports do not bridge topology, but contents constrain every connected port', () => {
  const state = basic();
  state.pipes.push(pipe(10, 0), pipe(10, 1), pipe(15, 0), pipe(16, 0));
  state.pumps.push(pump('z', pipe(10, 0), pipe(15, 0)));
  state.tanks[0].ports.push(pipe(16, 0));
  const source = reservoir([[0, 1, 'oil', 2], [10, 1, 'water', 2]]);
  const result = Network.update(state, 1, source);
  assert.notEqual(result.componentByCell['5,0'], result.componentByCell['15,0']);
  assert.equal(result.componentTypes[result.componentByCell['15,0']], 'oil');
  assert.equal(result.pumps[1].status, 'mixed');
  conserved(4, source, result);
});

test('diagonal cells are disconnected and negative coordinates work', () => {
  const state = { pipes: [pipe(-2, -2), pipe(-2, -1), pipe(5, 0), pipe(6, 1)],
    pumps: [pump('pump', pipe(-2, -2))], tanks: [tank('tank', [pipe(6, 1)])] };
  const source = reservoir([[-2, -1, 'oil', 2]]);
  assert.equal(Network.update(state, 1, source).pumps[0].status, 'no-tank');
  state.pipes.push(pipe(6, 0));
  assert.equal(Network.update(state, 1, source).totalTransferred, 1);
});

test('disconnecting or editing coordinates rebuilds a bounded topology cache', () => {
  const network = Network.createNetwork(), state = basic(), source = reservoir([[0, 1, 'oil', 20]]);
  network.update(state, 0, source); network.update({ ...state, pipes: [...state.pipes].reverse() }, 0, source);
  assert.equal(network.getStats().topologyBuilds, 1);
  state.pipes = state.pipes.filter(cell => cell.x !== 6);
  assert.equal(network.update(state, 1, source).pumps[0].status, 'no-tank');
  for (let i = 0; i < 100; i++) network.update({ pipes: [pipe(i, 0)] }, 0);
  assert.equal(network.getStats().cacheEntries, 1);
  assert.equal(network.getStats().cells, 1);
  assert.equal(source.extractions, 0);
});

test('invalid dt, disabled pumps, zero rates and overflowed budgets never extract', () => {
  for (const dt of [0, -1, NaN, Infinity, -Infinity, undefined, '1']) {
    const source = reservoir([[0, 1, 'oil', 2]]), result = Network.update(basic(), dt, source);
    assert.equal(result.pumps[0].status, 'paused');
    assert.equal(source.queries, 0); assert.equal(source.extractions, 0);
  }
  for (const options of [{ enabled: false }, { rate: 0 }, { rate: -1 }, { rate: Infinity }, { rate: Number.MAX_VALUE }]) {
    const state = basic(); Object.assign(state.pumps[0], options);
    const source = reservoir([[0, 1, 'oil', 2]]), result = Network.update(state, 2, source);
    assert.equal(result.pumps[0].status, 'paused'); assert.equal(source.extractions, 0);
  }
});

test('adapter partial removal is credited exactly, including depleted shared pools', () => {
  const state = basic(), source = reservoir([[0, 1, 'oil', 2]], 0.125);
  const result = Network.update(state, 1, source);
  assert.equal(result.totalTransferred, 0.125); assert.equal(result.tanks[0].amount, 0.125);
  conserved(2, source, result);
});

test('repeated frame updates conserve fluid and respect rate across changing headroom', () => {
  let state = basic(); state.tanks[0].capacity = 3.75;
  const source = reservoir([[0, 1, 'oil', 5]]), network = Network.createNetwork();
  for (let frame = 0; frame < 300; frame++) {
    const result = network.update(state, 1 / 60, source);
    assert.ok(result.totalTransferred <= 1 / 60);
    assert.ok(result.tanks[0].amount <= 3.75);
    conserved(5, source, result);
    state = { ...state, tanks: result.tanks };
  }
  assert.equal(state.tanks[0].amount, 3.75);
  assert.ok(Math.abs(source.remaining - 1.25) < 1e-10);
  assert.equal(network.getStats().topologyBuilds, 1);
});

test('invalid occupied tanks remain intact and cannot accept extraction', () => {
  const state = basic(); state.tanks[0].amount = 40; state.tanks[0].kind = 'oil';
  const source = reservoir([[0, 1, 'oil', 4]]), result = Network.update(state, 1, source);
  assert.equal(result.tanks[0].amount, 40); assert.equal(source.extractions, 0);
  assert.equal(result.diagnostics[0].type, 'invalid-tank');
});

test('adapter exceptions retain already completed transfers in returned tanks', () => {
  const state = basic(); state.tanks = [tank('a', [pipe(6, 0)], { capacity: 0.25 }), tank('b')];
  const source = reservoir([[0, 1, 'oil', 2]]), originalExtract = source.extract.bind(source);
  let calls = 0;
  source.extract = (...args) => { if (++calls === 2) throw new Error('atomic removal failed'); return originalExtract(...args); };
  const result = Network.update(state, 1, source);
  assert.equal(result.totalTransferred, 0.25); assert.equal(result.tanks[0].amount, 0.25);
  assert.equal(result.diagnostics[0].type, 'extract-error');
  conserved(2, source, result);
});

test('renewable pumping fills storage without extracting or limiting rate to shallow cells', () => {
  for (const kind of Network.KINDS) {
    const state = {...basic(),renewableSources:true}, source=reservoir([[0,1,kind,.00001]]);
    for(let i=0;i<128;i++){const result=Network.update(state,.25,source);state.tanks=result.tanks;assert.equal(result.totalTransferred,.25)}
    assert.equal(state.tanks[0].amount,32);assert.equal(source.remaining,.00001);assert.equal(source.extractions,0);
    assert.equal(Network.update(state,1,source).pumps[0].status,'full');
    state.tanks[0].amount=0;state.tanks[0].kind=null;
    assert.equal(Network.update(state,1,{query:()=>null}).pumps[0].status,'dry');
    assert.equal(Network.update(state,1,{query:()=>({kind,amount:1})}).totalTransferred,1);
  }
});

test('only coincident, opposite cardinal faces form a direct connection', () => {
  const outlet={x:128,y:80,dx:1,dy:0},inlet={x:128,y:80,dx:-1,dy:0};
  assert.equal(Network.portsTouch(outlet,inlet),true);
  for(const face of [null,{...inlet,x:160},{...inlet,y:112},{...inlet,dx:1},{...inlet,dx:0,dy:1},{...inlet,dx:-2},{...inlet,x:NaN}])assert.equal(Network.portsTouch(outlet,face),false);
  const state={renewableSources:true,pipes:[pipe(0,0),pipe(0,1)],pumps:[pump('p',pipe(0,0),pipe(4,2),{outletFace:outlet})],tanks:[tank('t',[],{faces:[inlet]})]};
  const source=reservoir([[0,1,'water',1]]);
  let result=Network.update(state,1,source);assert.equal(result.totalTransferred,1);assert.equal(result.pumps[0].status,'pumping');assert.equal(source.extractions,0);
  for(const face of [{...inlet,x:160},{...inlet,y:112},{...inlet,dx:1}]){
    state.tanks[0].faces=[face];assert.equal(Network.update(state,1,source).pumps[0].status,'no-outlet');
  }
});

test('direct tanks honor full, pause, mixing and external pipe constraints', () => {
  const face={x:128,y:80,dx:1,dy:0};
  const state={renewableSources:true,pipes:[pipe(0,0),pipe(0,1),pipe(8,0)],pumps:[pump('p',pipe(0,0),pipe(4,2),{outletFace:face})],tanks:[tank('t',[pipe(8,0)],{faces:[{...face,dx:-1}]})]};
  const source=reservoir([[0,1,'water',1]]);
  state.tanks[0].amount=32;state.tanks[0].kind='water';assert.equal(Network.update(state,1,source).pumps[0].status,'full');
  state.tanks[0].amount=1;state.tanks[0].kind='oil';assert.equal(Network.update(state,1,source).pumps[0].status,'mixed');
  state.tanks[0].amount=0;state.tanks[0].kind=null;state.pumps[0].enabled=false;assert.equal(Network.update(state,1,source).pumps[0].status,'paused');
  state.pumps[0].enabled=true;state.tanks.push(tank('other',[pipe(8,0)],{amount:2,kind:'lava'}));assert.equal(Network.update(state,1,source).pumps[0].status,'mixed');
  state.tanks.pop();state.tanks[0].ports=[pipe(0,0)];assert.equal(Network.update(state,1,source).pumps[0].status,'loop');
  assert.equal(source.extractions,0);assert.equal(source.remaining,1);
});

test('multiple renewable pumps share a source and never overfill shared tanks', () => {
  const state={...basic(),renewableSources:true};state.pumps.push(pump('second'));state.tanks[0].capacity=1.25;
  const source=reservoir([[0,1,'oil',.01]]),result=Network.update(state,1,source);
  assert.equal(result.totalTransferred,1.25);assert.deepEqual(result.pumps.map(p=>p.amount),[1,.25]);assert.equal(source.remaining,.01);assert.equal(source.extractions,0);
});

let failed = 0;
for (const { name, run } of tests) {
  try { run(); console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name); console.error(error); }
}
if (failed) process.exitCode = 1;
else console.log('PASS all ' + tests.length + ' extraction network checks');
