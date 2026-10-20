const assert = require("node:assert/strict"),
  D = require("../defense-core.js");
function fixture() {
  const people = [
      { id: "f1", fey: true, x: 0, y: 0 },
      { id: "f2", fey: true, x: 0, y: 0 },
      { id: "w1", fey: false, x: 0, y: 0 },
    ],
    bs = [
      {
        id: 1,
        type: "armory",
        x: 0,
        y: 0,
        stock: {
          sword: 1,
          shield: 1,
          bow: 2,
          arrow: 40,
          fireStaff: 1,
          frostStaff: 1,
          lightningStaff: 1,
          healingStaff: 1,
          bolt: 50,
          stone: 40,
          seedPod: 20,
          sapCharge: 5,
          oilCharge: 8,
          waterCharge: 4,
          wood: 10,
        },
      },
    ],
    events = [],
    world = [],
    fires = [],
    api = {
      actors: () => people,
      buildings: () => bs,
      stock: (b) => b.stock,
      door: (b) => ({ x: b.x, y: b.y }),
      stationPoint: (b) => ({ x: b.x, y: b.y }),
      paused: () => false,
      changed() {},
      move(a, p) {
        a.x = p.x;
        a.y = p.y;
      },
      suspendTask: () => ({ task: "Mine" }),
      restoreTask() {},
      refund(k, n, id) {
        const b = bs.find((b) => b.id === id) || bs[0];
        b.stock[k] = (b.stock[k] || 0) + n;
      },
      anchor: () => ({ x: 0, y: 0 }),
      spawnPoint: (a, s, k) => ({ x: s * 200, y: k === "flyer" ? -80 : 0 }),
      spawn() {},
      removeEnemy() {},
      syncEnemies() {},
      moveEnemy(e, t, dt, slow) {
        const d = Math.hypot(e.x - t.x, e.y - t.y) || 1,
          v = ((D.enemyTypes[e.kind].speed * dt) / 1000) * slow;
        e.x += ((t.x - e.x) / d) * v;
        e.y += ((t.y - e.y) / d) * v;
      },
      stopEnemy() {},
      enemyTarget: () => ({ x: 0, y: 0 }),
      obstruction: () => null,
      damageWorld: (t, n) => world.push(n),
      supported: () => true,
      repairTargets: () => [],
      repairPoint: (t) => t,
      repair() {},
      lost: () => false,
      reward(n) {
        events.push(["reward", n]);
      },
      event: (...e) => events.push(e),
      fires: () => fires,
      extinguish(p, r) {
        fires.splice(0);
      },
      ignite: (p) => fires.push(p),
      tickFires() {},
      knock() {},
    };
  const e = D.create(api);
  function step(ms) {
    for (let t = 0; t < ms; t += 20) e.step(Math.min(20, ms - t));
  }
  return { e, api, people, bs, events, step, world, fires };
}
{
  assert.equal(Object.keys(D.structures).length, 11);
  assert.equal(
    D.segment(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { min: { x: 40, y: -5 }, max: { x: 50, y: 5 } },
    ),
    0.4,
  );
  assert.equal(
    D.segment(
      { x: 0, y: 10 },
      { x: 100, y: 10 },
      { min: { x: 40, y: -5 }, max: { x: 50, y: 5 } },
    ),
    null,
  );
  const a = { x: 0, y: -100 },
    b = { x: 400, y: -10 },
    v = D.trajectory(a, b, true),
    t = v.life - 1;
  assert(Math.abs(a.y + v.vy * t + (v.g * t * t) / 2 - b.y) < 1e-8);
  console.log("PASS segment obstruction and ballistic arrival");
}
{
  const f = fixture();
  f.e.order("f1", { role: "sword", active: true, alarm: false });
  f.e.order("f2", { role: "sword", active: true, alarm: false });
  f.step(100);
  assert.equal(f.e.state.orders.f1.gear.length, 2);
  assert.equal(f.e.state.orders.f2.gear.length, 0);
  assert.equal(f.bs[0].stock.sword, 0);
  f.e.remove("f1");
  assert.equal(f.bs[0].stock.sword, 1);
  assert.equal(f.bs[0].stock.shield, 1);
  f.step(100);
  assert.equal(f.e.state.orders.f2.gear.length, 2);
  assert.equal(f.e.order("w1", { job: "Defend" }), false);
  assert(f.e.order("w1", { job: "Supply", active: true }));
  console.log("PASS exclusive equipment ledger, refunds and role eligibility");
}
{
  const f = fixture();
  f.e.order("f1", { role: "bow", active: true, alarm: false });
  f.step(60);
  assert.equal(f.bs[0].stock.arrow, 28);
  assert.equal(f.e.state.orders.f1.ammo, 12);
  const s = f.e.save();
  f.e.restore(s);
  assert.equal(f.e.state.orders.f1.ammo, 12);
  f.e.remove("f1");
  assert.equal(f.bs[0].stock.arrow, 40);
  assert.equal(f.bs[0].stock.bow, 2);
  console.log("PASS finite bow ammunition conserved through reload/return");
}
for (const type of Object.keys(D.structures).filter((k) => k !== "armory")) {
  const f = fixture(),
    d = D.structures[type];
  f.bs.push({
    id: 2,
    type,
    x: 20,
    y: 0,
    stock: { bolt: 10, stone: 10, seedPod: 10, oilCharge: 10 },
  });
  f.e.order("f1", { role: "bow", active: true, alarm: false, station: 2 });
  f.step(100);
  f.e.state.phase = "battle";
  f.e.state.phaseTime = 100000;
  f.e.state.queue = ["raider"];
  f.e.state.spawn = 99999;
  const p = d.drop
    ? { x: 20 + d.w * 16, y: 100 }
    : { x: 20 + Math.max(160, d.min + 100), y: 0 };
  f.e.spawn("giant", p);
  const before = f.bs[1].stock[d.ammo];
  f.step(40);
  if (d.ward) assert(f.e.station(f.bs[1]).ward > 0, type);
  else if (d.ram) {
    f.e.state.enemies[0].x = 80;
    f.step(40);
    assert(
      f.e.state.fields.some((v) => v.kind === "swing"),
      type,
    );
  } else {
    assert(
      f.e.state.shots.length ||
        f.e.state.fields.some((v) => v.kind === "spark"),
      type + " fires",
    );
    if (d.ammo)
      assert.equal(
        f.bs[1].stock[d.ammo],
        before - (d.costPerShot || 1),
        type + " finite ammo",
      );
  }
  const saved = f.e.save();
  f.e.restore(saved);
  assert.equal(f.e.station(f.bs[1]).cooldown, saved.stations[2].cooldown);
  console.log("PASS " + type + " operated firing and cooldown save");
}
{
  const f = fixture();
  f.bs.push({ id: 2, type: "ballista", x: 20, y: 0, stock: { bolt: 5 } });
  f.e.order("f1", { role: "bow", active: true, alarm: false, station: 2 });
  f.step(50);
  f.e.state.phase = "battle";
  f.e.state.phaseTime = 100000;
  f.e.state.queue = ["raider"];
  f.e.state.spawn = 99999;
  f.e.spawn("giant", { x: 220, y: 0 });
  f.api.obstruction = () => ({ t: 0.3, target: { x: 50, y: 0 } });
  f.step(100);
  assert.equal(f.bs[1].stock.bolt, 5);
  assert.equal(f.e.station(f.bs[1]).status, "Blocked");
  f.api.obstruction = () => null;
  f.step(100);
  assert.equal(f.bs[1].stock.bolt, 4);
  f.e.configure(2, { facing: -1 });
  f.e.station(f.bs[1]).cooldown = 0;
  f.step(100);
  assert.equal(f.bs[1].stock.bolt, 4);
  console.log("PASS blocked and wrong-facing shots preserve ammunition");
}
{
  const f = fixture();
  f.e.order("w1", { job: "Supply", active: true, alarm: false });
  f.bs.push({ id: 2, type: "ballista", x: 100, y: 0, stock: {} });
  f.step(20);
  assert.equal(f.bs[0].stock.bolt, 38);
  assert.equal(f.e.state.orders.w1.cargo.n, 12);
  const saved = f.e.save();
  f.e.restore(saved);
  f.step(80);
  assert.equal(f.bs[1].stock.bolt, 12);
  assert.equal(f.e.state.orders.w1.cargo, null);
  f.e.remove("w1");
  assert.equal(f.bs[0].stock.bolt + f.bs[1].stock.bolt, 50);
  console.log("PASS physical delivery state and cargo conservation");
}
for (const role of ["fire", "frost", "lightning", "healing"]) {
  const f = fixture();
  f.e.order("f1", { role, active: true, alarm: false });
  f.e.order("f2", { role: "bow", active: true, alarm: false });
  f.step(60);
  f.e.state.orders.f2.hp = 10;
  f.e.spawn("giant", { x: 100, y: 0 });
  f.step(60);
  assert(f.e.state.orders.f1.charge < 100, role + " spends charge");
  if (role === "healing") assert(f.e.state.orders.f2.hp > 10);
  else assert(f.e.state.shots.length || f.e.state.fields.length);
  console.log("PASS " + role + " staff finite charge/effect");
}
{
  const f = fixture();
  assert(f.e.begin());
  assert.equal(f.e.begin(), false);
  const before = f.e.save();
  f.api.paused = () => true;
  f.step(1000);
  assert.deepEqual(f.e.save(), before);
  f.api.paused = () => false;
  f.step(12000);
  assert.equal(f.e.state.phase, "battle");
  const mid = f.e.save();
  f.e.restore(mid);
  assert.equal(f.e.state.phase, "battle");
  f.e.state.queue = [];
  for (const e of f.e.state.enemies) e.hp = 0;
  f.step(40);
  assert.equal(f.e.state.phase, "recovery");
  assert.equal(f.events.filter((e) => e[0] === "reward").length, 1);
  f.step(6000);
  assert.equal(f.e.state.phase, "peace");
  assert.equal(f.events.filter((e) => e[0] === "reward").length, 1);
  console.log("PASS warning, battle, one reward, recovery and pause");
}
{
  const f = fixture();
  f.e.restore({
    version: 1,
    enemies: [
      { id: 1, kind: "unknown", x: 0, y: 0 },
      { id: 2, kind: "raider", x: NaN, y: 0 },
    ],
    orders: { bad: { role: "bow", post: { x: 0, y: 0 } } },
    shots: [{ x: Infinity, y: 0 }],
  });
  assert.equal(f.e.state.enemies.length, 0);
  assert.equal(f.e.state.shots.length, 0);
  assert.deepEqual(f.e.state.orders, {});
  console.log("PASS malformed state rejection");
}
{
  const f = fixture();
  f.e.order("f1", { role: "sword", active: false });
  f.e.order("f2", { role: "sword", active: true, alarm: false });
  f.step(100);
  assert.equal(
    f.e.state.orders.f2.gear.length,
    0,
    "preferred equipment is held for its named defender",
  );
  f.e.remove("f1");
  f.step(60);
  assert.equal(f.e.state.orders.f2.gear.length, 2);
  console.log(
    "PASS named equipment reservation releases without phantom refunds",
  );
}
{
  const f = fixture();
  f.e.order("f1", { role: "bow", active: true, alarm: false });
  f.e.order("f2", { role: "bow", active: true, alarm: false });
  f.step(60);
  f.bs.push({ id: 2, type: "ballista", x: 0, y: 0, stock: { bolt: 20 } });
  f.e.order("f1", { station: 2, helper: false, active: true, alarm: false });
  f.e.order("f2", { station: 2, helper: true, active: true, alarm: false });
  const s = f.e.station(f.bs[1]);
  s.cooldown = 1000;
  f.step(100);
  assert(Math.abs(s.cooldown - 865) < 1e-6);
  f.e.remove("f2");
  f.step(100);
  assert(Math.abs(s.cooldown - 765) < 1e-6);
  console.log("PASS exactly one reload helper grants a bounded speed increase");
}
{
  const f = fixture();
  const target = { x: 50, y: 0, material: "wood", damage: 6 };
  let repairs = 0;
  f.api.repairTargets = () => (target.damage ? [target] : []);
  f.api.repair = (t) => {
    t.damage = Math.max(0, t.damage - 2);
    repairs++;
  };
  f.e.order("w1", { job: "Repair", active: true, alarm: false });
  f.step(5000);
  assert.equal(repairs, 3);
  assert.equal(f.bs[0].stock.wood, 7);
  assert.equal(target.damage, 0);
  console.log("PASS repairs consume real materials once per successful repair");
}
{
  const f = fixture();
  f.bs.push({ id: 2, type: "wardLantern", x: 0, y: 0, stock: {} });
  f.e.order("f1", { role: "sword", station: 2, active: true, alarm: false });
  f.step(100);
  assert(f.e.wardAt({ x: 10, y: 10 }));
  f.e.worldHit({ x: 0, y: 0 }, 10);
  assert.equal(f.world.at(-1), 4);
  f.e.worldHit({ x: 1000, y: 0 }, 10);
  assert.equal(f.world.at(-1), 10);
  console.log("PASS wards mitigate damage inside their actual radius");
}
{
  const f = fixture();
  f.e.state.phase = "battle";
  f.e.state.phaseTime = 100000;
  f.e.state.anchor = { x: 0, y: 0 };
  f.e.state.queue = ["raider"];
  f.e.state.spawn = 99999;
  const a = f.e.spawn("armored", { x: 100, y: 0 }),
    b = f.e.spawn("raider", { x: 150, y: 0 });
  f.e.shoot({ x: 0, y: 0 }, a, { damage: 18, pierce: 3, speed: 650 }, "f1");
  f.step(300);
  assert(a.hp <= 42 && b.hp <= 10, "piercing bolt hits both with armor bypass");
  const c = f.e.spawn("giant", { x: 300, y: 0 }),
    before = c.hp;
  f.e.damage(c, 0.03, { pierce: true });
  assert(
    Math.abs(c.hp - (before - 0.03)) < 1e-8,
    "burn DOT has no half-hit per-frame inflation",
  );
  console.log(
    "PASS ordered piercing collisions, armor bypass and frame-sized damage",
  );
}
{
  const f = fixture();
  f.e.state.phase = "battle";
  f.e.state.phaseTime = 100000;
  f.e.state.anchor = { x: 0, y: 0 };
  f.e.state.queue = ["raider"];
  f.e.state.spawn = 99999;
  const a = f.e.spawn("giant", { x: 100, y: 0 }),
    b = f.e.spawn("giant", { x: 110, y: 0 });
  f.e.shoot(
    { x: 0, y: 0 },
    a,
    { damage: 13, splash: 64, slow: 5000, speed: 650 },
    1,
  );
  f.step(180);
  assert(a.hp < 180 && b.hp < 180);
  assert(f.e.state.fields.some((s) => s.kind === "bramble"));
  assert(a.slow > 0);
  f.fires.push({ x: 100, y: 0 });
  f.e.shoot(
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { damage: 0, splash: 50, kind: "waterCharge", speed: 650 },
    1,
  );
  f.step(180);
  assert.equal(f.fires.length, 0);
  console.log(
    "PASS splash, temporary brambles, slow status and water extinguishing",
  );
}
{
  const run = (fps) => {
    const f = fixture();
    f.e.begin();
    for (let i = 0; i < fps * 15; i++) f.e.step(1000 / fps);
    return f.e.save();
  };
  const reference = run(60);
  for (const rate of [30, 120, 144]) {
    const s = run(rate);
    assert.equal(s.phase, reference.phase);
    assert.equal(s.enemies.length, reference.enemies.length);
    assert(Math.abs(s.time - reference.time) < 0.001);
  }
  console.log("PASS combat time/phase/spawn parity at 30/60/120/144 Hz");
}
{
  const f = fixture();
  assert.doesNotThrow(() =>
    f.e.restore({
      version: 1,
      orders: { f1: null, f2: { role: "bow", post: { x: 0, y: 0 }, gear: {} } },
      stations: { 1: null },
      enemies: [null],
    }),
  );
  assert.equal(f.e.state.enemies.length, 0);
  console.log("PASS malformed nested records cannot break restore");
}
