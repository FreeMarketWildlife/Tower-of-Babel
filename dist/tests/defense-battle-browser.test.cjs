const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  { chromium } = require("playwright"),
  { hook } = require("./defense-browser.test.cjs"),
  D = require("../defense-core.js");
const base =
  process.env.SKY_TEST_URL || "http://127.0.0.1:8788/tower-of-babel/";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.SKY_TEST_BROWSER ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  try {
    const p = await browser.newPage({ viewport: { width: 1200, height: 850 } }),
      errors = [];
    p.on("pageerror", (e) => errors.push(e.stack));
    await p.addInitScript(() => (requestAnimationFrame = () => 0));
    await p.route("**/game-v93-defense.txt*", (r) =>
      r.fulfill({
        contentType: "text/plain",
        body:
          fs.readFileSync("tower-of-babel/game-v93-defense.txt", "utf8") +
          "\n" +
          hook,
      }),
    );
    await p.goto(base);
    await p.waitForFunction(
      () => window.defenseTest && window.__buttonwood,
      null,
      { polling: 100 },
    );
    for (const type of Object.keys(D.structures).filter(
      (k) => k !== "armory",
    )) {
      const result = await p.evaluate((type) => {
        defenseTest.fresh();
        const armory = defenseTest.building("armory", -384, -128);
        defenseTest.stock(armory, { sword: 1, shield: 1 });
        const f = defenseTest.fey("wood-mouse", -240, 0);
        defenseTest.equip(f, "sword", null);
        defenseTest.step(80);
        const d = defenseTest.definitions[type],
          bottom = d.drop ? -64 : 0;
        if (d.drop) for (let x = -1; x < d.w; x++) defenseTest.floor(x, -2);
        const b = defenseTest.building(type, 0, bottom - d.h * 32);
        defenseTest.position(f, -16, bottom - 14);
        skyStackDefense.assign(f, { station: b, active: true, alarm: false });
        defenseTest.stock(b, {
          bolt: 12,
          stone: 12,
          seedPod: 12,
          oilCharge: 12,
        });
        defenseTest.battle();
        const x = d.drop
          ? d.w * 32
          : d.ram
            ? 98
            : d.heavy
              ? 650
              : d.min
                ? Math.max(d.min + 120, 220)
                : 160;
        defenseTest.spawn("giant", x, d.drop ? -45 : -14);
        const before = defenseTest.stocks.find((v) => v.id === b).stock[d.ammo];
        defenseTest.step(100);
        const s = skyStackDefense.state;
        return {
          type,
          station: s.stations[b],
          shots: s.shots.length,
          fields: s.fields.length,
          before,
          after: defenseTest.stocks.find((v) => v.id === b).stock[d.ammo],
          crew: s.orders[f],
          enemy: s.enemies[0],
          b,
        };
      }, type);
      assert(result.crew.gear.length === 2, type + " physical equipment");
      assert(
        result.station.cooldown > 0,
        type + " fires/wards in production: " + JSON.stringify(result),
      );
      if (D.structures[type].ammo)
        assert.equal(
          result.before - result.after,
          D.structures[type].costPerShot || 1,
          type + " real stock",
        );
      console.log("PASS production " + type);
    }
    // A real raid is allowed to finish using finite equipment and automatic target selection.
    const battle = await p.evaluate(() => {
      defenseTest.fresh();
      const armory = defenseTest.building("armory", -128, -128);
      defenseTest.stock(armory, {
        bow: 12,
        arrow: 240,
        fireStaff: 6,
        sword: 6,
        shield: 6,
      });
      for (let i = 0; i < 12; i++) {
        const f = defenseTest.fey(
          i % 2 ? "bird" : "wood-mouse",
          i % 2 ? 16 : -144,
          0,
        );
        defenseTest.equip(f, "bow", null);
      }
      defenseTest.step(300);
      skyStackDefense.begin();
      for (let i = 0; i < 80; i++) defenseTest.step(1000);
      defenseTest.render();
      return { state: skyStackDefense.state, money: defenseTest.money };
    });
    assert.equal(
      battle.state.outcome,
      "Defended",
      JSON.stringify({
        phase: battle.state.phase,
        enemies: battle.state.enemies,
        orders: battle.state.orders,
      }),
    );
    assert.equal(battle.state.phase, "peace");
    assert(battle.money >= 5);
    assert(battle.state.kills >= 6);
    console.log(
      "PASS first real finite-ammunition raid, victory, reward and recovery",
    );
    // Physics still blocks hostile bodies; climbers rise instead of passing through a wall.
    const physics = await p.evaluate(() => {
      defenseTest.fresh();
      const a = defenseTest.building("armory", 0, -128);
      defenseTest.battle();
      defenseTest.spawn("raider", -60, -14);
      defenseTest.spawn("climber", -60, -14);
      defenseTest.spawn("flyer", -100, -160);
      defenseTest.step(4000);
      return skyStackDefense.state.enemies.map((e) => ({
        kind: e.kind,
        x: e.x,
        y: e.y,
      }));
    });
    const ground = physics.find((e) => e.kind === "raider"),
      climber = physics.find((e) => e.kind === "climber"),
      flyer = physics.find((e) => e.kind === "flyer");
    assert(ground.x < 12, "ground body does not cross building");
    assert(
      climber.y < ground.y - 5,
      "climber ascends exposed wall: " + JSON.stringify(physics),
    );
    assert(flyer.y < -80, "flyer remains airborne");
    console.log("PASS actual ground/climber/flyer physics");
    // Saved in-flight projectiles retain position, gravity and hit ledger.
    const shot = await p.evaluate(() => {
      defenseTest.fresh();
      defenseTest.building("armory", -384, -128);
      defenseTest.battle();
      defenseTest.spawn("siege", 600, -14);
      defenseTest.step(100);
      defenseTest.save();
      return skyStackDefense.state.shots;
    });
    await p.reload();
    await p.waitForFunction(
      () => window.defenseTest && window.__buttonwood,
      null,
      { polling: 100 },
    );
    assert.deepEqual(await p.evaluate(() => skyStackDefense.state.shots), shot);
    console.log("PASS active siege projectile save/reload");
    const stress = await p.evaluate(() => {
      defenseTest.fresh();
      const a = defenseTest.building("armory", 0, -128);
      defenseTest.stock(a, { bow: 120, arrow: 1440 });
      for (let i = 0; i < 120; i++) {
        const id = defenseTest.fey("wood-mouse", 144, 0);
        defenseTest.equip(id, "bow", null);
      }
      defenseTest.pure(100);
      defenseTest.battle();
      for (let i = 0; i < 64; i++) defenseTest.spawn("giant", 300 + i * 4, -14);
      const begin = performance.now();
      defenseTest.step(500);
      const state = skyStackDefense.state;
      return {
        ms: performance.now() - begin,
        enemies: state.enemies.length,
        shots: state.shots.length,
        fields: state.fields.length,
        orders: Object.keys(state.orders).length,
        bytes: JSON.stringify(state).length,
      };
    });
    assert.equal(stress.orders, 120);
    assert(stress.enemies <= 64 && stress.shots <= 160 && stress.fields <= 160);
    console.log("STRESS", JSON.stringify(stress));
    const strip = await p.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 720;
      c.height = 31 * 56;
      const g = c.getContext("2d");
      g.fillStyle = ButtonwoodArt.palette.cream;
      g.fillRect(0, 0, c.width, c.height);
      for (const [row, s] of ButtonwoodArt.animalAnimations.roster.entries())
        for (const [col, role] of Object.keys(TowerDefense.roles).entries()) {
          const x = col * 120 + 52,
            y = row * 56 + 44,
            sprite = ButtonwoodArt.wildlifeSprite(s.id, {
              frame: 0,
              direction: 1,
            });
          g.drawImage(sprite, x - sprite.width / 2, y - sprite.height);
          ButtonwoodArt.paintDefenseGear(
            g,
            role,
            x + Math.min(14, ButtonwoodArt.wildlifeSizes[s.id].width / 2),
            y - 12.8,
            1,
            1,
          );
        }
      return c.toDataURL();
    });
    fs.writeFileSync(
      "tower-of-babel/buttonwood/qa/defense/fey-equipment.png",
      Buffer.from(strip.split(",")[1], "base64"),
    );
    await p.evaluate(() => {
      defenseTest.fresh();
      const a = defenseTest.building("armory", -320, -128);
      defenseTest.stock(a, {
        sword: 4,
        shield: 4,
        bow: 8,
        arrow: 100,
        fireStaff: 4,
      });
      for (const [i, role] of ["sword", "bow", "fire", "bow"].entries()) {
        const f = defenseTest.fey(
          ["wood-mouse", "bird", "box-turtle", "sand-lizard"][i],
          -176,
          0,
        );
        defenseTest.equip(f, role, null);
        defenseTest.pure(100);
        defenseTest.position(f, -80 + i * 32, -14);
      }
      const b = defenseTest.building("ballista", 0, -64);
      defenseTest.stock(b, { bolt: 20 });
      defenseTest.building("catapult", 160, -96);
      defenseTest.battle();
      defenseTest.spawn("armored", 400, -14);
      defenseTest.spawn("climber", 350, -14);
      defenseTest.spawn("flyer", 300, -150);
      defenseTest.step(250);
      defenseTest.render();
    });
    await p.waitForTimeout(100);
    await p.screenshot({
      path: "tower-of-babel/buttonwood/qa/defense/battle.png",
    });
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
