const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  { chromium } = require("playwright");
const base =
  process.env.SKY_TEST_URL || "http://127.0.0.1:8788/tower-of-babel/";
const hook = `window.defenseTest={
 get picking(){return defensePostPickV93},fresh(){for(const q of defenseEnemyBodiesV93.values())World.remove(eng.world,q);defenseEnemyBodiesV93.clear();defenseV93.restore({version:1});for(const q of feyBodiesV75.values())World.remove(eng.world,q);feyBodiesV75.clear();for(const q of miners)World.remove(eng.world,q);miners.clear();for(const b of structureBodiesV47.values())World.remove(eng.world,b);structureBodiesV47.clear();structuresV46=[];wildlifeV71=[];liquidSubV22.clear();for(const z of bs)World.remove(eng.world,z);bs.clear();grid.clear();for(let x=-60;x<=60;x++)mk(ctr(x),ctr(0),'stone',{terrain:true,static:true,cx:x,cy:0});for(const k of Object.keys(inv))inv[k]=0;for(const k of Object.keys(structureBagV46))structureBagV46[k]=0;solidCacheV57=null;feyTowerCacheV75=null;feyTowerStampV75=-Infinity;Object.assign(cam,{x:0,y:-110,z:1.4,anim:false});settlementV55.phase='day';defenseFiresV93.length=0;playerCraftV61=null;ui()},
 floor(x,y){mk(ctr(x),ctr(y),'stone',{terrain:true,static:true,cx:x,cy:y});solidCacheV57=null},grant(k,n){inv[k]=n;ui()},building(type,x,y){structureBagV46[type]++;if(!placeStructureV46({type,x,y}))throw new Error('Cannot place '+type);return structuresV46.at(-1).id},
 fey(species='wood-mouse',x=-16,y=0){const a=wildlifeNewV71(species,{x,y});a.x=a.homeX=x;a.y=a.homeY=y;wildlifeV71.push(a);becomeFeyV75(a);return 'f'+a.id},
 position(id,x,y){const a=defenseActorsV93().find(a=>a.id===id);Body.setPosition(a.body,{x,y});if(a.animal)wildlifePositionV71(a.animal)},
 tank(id,kind,amount){const b=structuresV46.find(b=>b.id===id);b.liquidKind=kind;b.liquidAmount=amount},get tanks(){return structuresV46.filter(b=>b.type==='tank').map(b=>({id:b.id,amount:b.liquidAmount,kind:b.liquidKind}))},stock(id,items){Object.assign(stockV56(structuresV46.find(b=>b.id===id)),items)},get stocks(){return structuresV46.map(b=>({id:b.id,type:b.type,stock:{...stockV56(b)}}))},get money(){return inv.gold},
 step(ms){for(let t=0;t<ms;t+=1000/60){const previous=gameClockV76.simulationTime;gameClockV76.simulationTime=(gameClockV76.simulationTime||1000)+t;Engine.update(eng,1000/60);stepStructuresV46(1000/60);gameClockV76.simulationTime=previous}},
 pure(ms){for(let t=0;t<ms;t+=20)defenseV93.step(20)},spawn:(kind,x,y)=>defenseV93.spawn(kind,{x,y}),save:saveGame,render(){__buttonwood.render(performance.now())},open(id){openBuildingV46(structuresV46.find(b=>b.id===id))},armory(){return structuresV46.find(b=>b.type==='armory')?.id},
 battle(){defenseV93.state.phase='battle';defenseV93.state.phaseTime=180000;defenseV93.state.queue=['raider'];defenseV93.state.spawn=99999;defenseV93.state.anchor={x:0,y:-100,baseX:0,baseY:0,armory:structuresV46.find(b=>b.type==='armory')?.id}},
 configure: (id,o)=>defenseV93.configure(id,o),equip(id,role,station){defenseV93.order(id,{role,station,active:true,alarm:false});void 0},get actors(){return defenseActorsV93().map(a=>({id:a.id,x:a.x,y:a.y,task:a.animal?.feyV75.task}))},capture(id){const a=wildlifeV71.find(a=>'f'+a.id===id);bucketBagV68.bucket=1;return captureWildlifeV71({animal:a,p:a})},buckets(){return{...bucketBagV68}},bucket(k,n){bucketBagV68[k]=n},finish(){defenseV93.finish()},get definitions(){return TowerDefense.structures},get source(){return JSON.parse(localStorage.getItem(SAVE_KEY))}
};`;
module.exports = { hook };
if (require.main === module)
  (async () => {
    const b = await chromium.launch({
      headless: true,
      executablePath:
        process.env.SKY_TEST_BROWSER ||
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });
    try {
      const p = await b.newPage({ viewport: { width: 1200, height: 850 } }),
        errors = [];
      p.on("pageerror", (e) => {
        errors.push(e.stack);
        console.error(e.stack);
      });
      p.on("console", (m) => {
        if (m.type() === "error") console.error(m.text());
      });
      await p.route("**/favicon.ico", (r) => r.fulfill({ status: 204 }));
      await p.addInitScript(() => (requestAnimationFrame = () => 0));
      await p.route("**/game-v93-defense.txt*", async (r) => {
        await r.fulfill({
          status: 200,
          contentType: "text/plain",
          body:
            fs.readFileSync("tower-of-babel/game-v93-defense.txt", "utf8") +
            "\n" +
            hook,
        });
      });
      const load = async () => {
        await p.goto(base);
        await p.waitForFunction(
          () => window.defenseTest && window.__buttonwood,
          null,
          { polling: 100, timeout: 20000 },
        );
      };
      await load();
      assert.equal(await p.locator("#structure-card-armory").count(), 1);
      assert.equal(await p.locator("#structure-card-trebuchet").count(), 1);
      assert.equal(
        await p.evaluate(() => skyStackDefense.state.phase),
        "peace",
      );
      await p.evaluate(() => {
        defenseTest.fresh();
        for (const [k, n] of Object.entries({
          wood: 200,
          stone: 200,
          ironIngot: 100,
          copperIngot: 50,
          leaves: 100,
          coal: 20,
          goldIngot: 10,
        }))
          defenseTest.grant(k, n);
      });
      await p.locator("#structuresOpen").click();
      await p.locator("#player-craft-armory").click();
      await p.evaluate(() => defenseTest.step(1600));
      const ids = await p.evaluate(() => ({
        armory: defenseTest.building("armory", 0, -128),
        smith: defenseTest.building("blacksmith", 160, -128),
        ballista: defenseTest.building("ballista", -192, -64),
      }));
      await p.locator("#structuresClose").click();
      await p.evaluate((id) => defenseTest.open(id), ids.smith);
      await p.selectOption("#buildingRecipe", "sword");
      await p.locator("#buildingProduce").click();
      await p.evaluate(() => defenseTest.step(4100));
      assert.equal(
        await p.evaluate(
          (id) => defenseTest.stocks.find((b) => b.id === id).stock.sword,
          ids.smith,
        ),
        1,
      );
      await p.locator("#buildingClose").click();
      const fey = await p.evaluate((id) => {
        defenseTest.stock(id, {
          sword: 1,
          shield: 1,
          bow: 1,
          arrow: 24,
          fireStaff: 1,
        });
        return defenseTest.fey("wood-mouse", -16, 0);
      }, ids.armory);
      await p.locator("#defenseOpenV93").click();
      await p.selectOption("#defenseActorV93", fey);
      await p.selectOption("#defenseRoleV93", "sword");
      await p.locator("#defenseAlarmV93").uncheck();
      await p.locator("#defenseAssignV93").click();
      await p.evaluate(() => defenseTest.step(100));
      assert.deepEqual(
        await p.evaluate((id) => skyStackDefense.state.orders[id].gear, fey),
        ["sword", "shield"],
      );
      assert.equal(
        await p.evaluate(
          (id) => defenseTest.actors.find((a) => a.id === id).task,
          fey,
        ),
        "Defend",
      );
      await p.locator('#defensePostV93').click();assert.equal(await p.evaluate(()=>defenseTest.picking),fey);await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>defenseTest.picking),null);await p.evaluate(()=>skyStackPause.resume());
    // Physical travel to a station on the same open approach, with no teleport.
      await p.evaluate(
        ({ fey, id }) => {
          skyStackDefense.assign(fey, { station: id });
          defenseTest.position(fey, -16, -14);
        },
        { fey, id: ids.ballista },
      );
      const start = await p.evaluate(
        (id) => defenseTest.actors.find((a) => a.id === id),
        fey,
      );
      await p.evaluate(() => defenseTest.step(2000));
      const end = await p.evaluate(
        (id) => defenseTest.actors.find((a) => a.id === id),
        fey,
      );
      assert(
        end.x < start.x - 20,
        "operator physically walks toward nearest accessible station edge",
      );
      await p.evaluate(
        ({ fey, id }) => {
          defenseTest.position(fey, -80, -14);
          defenseTest.stock(id, { bolt: 12 });
          defenseTest.battle();
          defenseTest.spawn("giant", -20, -14);
        },
        { fey, id: ids.ballista },
      );
      await p.evaluate(() => defenseTest.step(100));
      assert.equal(
        await p.evaluate(
          (id) => defenseTest.stocks.find((b) => b.id === id).stock.bolt,
          ids.ballista,
        ),
        11,
        "crew fires a finite bolt",
      );
      const cooldown = await p.evaluate(
        (id) => skyStackDefense.state.stations[id].cooldown,
        ids.ballista,
      );
      assert(cooldown > 0);
      await p.evaluate(() => defenseTest.save());
      await load();
      assert.equal(
        await p.evaluate(
          (id) => skyStackDefense.state.stations[id].cooldown,
          ids.ballista,
        ),
        cooldown,
      );
      assert.deepEqual(
        await p.evaluate((id) => skyStackDefense.state.orders[id].gear, fey),
        ["sword", "shield"],
      );
      const paused = await p.evaluate(() => {
        skyStackPause.pause();
        return skyStackDefense.state.time;
      });
      await p.evaluate(() => defenseTest.pure(1000));
      assert.equal(await p.evaluate(() => skyStackDefense.state.time), paused);
      await p.evaluate(() => skyStackPause.resume());
      await p.evaluate((id) => {
        defenseTest.capture(id);
        defenseTest.save();
      }, fey);
      assert.equal(
        await p.evaluate(
          (id) => skyStackDefense.state.orders[id] !== undefined,
          fey,
        ),
        false,
      );
      assert.equal(
        await p.evaluate(
          (id) => defenseTest.stocks.find((b) => b.id === id).stock.sword,
          ids.armory,
        ),
        1,
        "capture returns borrowed sword once",
      );
      // Native pixels and all species' role eligibility.
      const art = await p.evaluate(() => {
        const allowed = new Set(Object.values(ButtonwoodArt.palette)),
          result = [];
        for (const [id, d] of Object.entries(TowerDefense.structures)) {
          for (const c of [
            ButtonwoodArt.defenseSprite(id),
            ButtonwoodArt.defenseIcon(id),
          ]) {
            const pixels = c
              .getContext("2d")
              .getImageData(0, 0, c.width, c.height).data;
            for (let i = 0; i < pixels.length; i += 4) {
              if (!pixels[i + 3]) continue;
              if (pixels[i + 3] !== 255) throw Error(id + " fractional alpha");
              const hex =
                "#" +
                [pixels[i], pixels[i + 1], pixels[i + 2]]
                  .map((n) => n.toString(16).padStart(2, "0"))
                  .join("");
              if (!allowed.has(hex)) throw Error(id + " palette " + hex);
            }
          }
          result.push([
            id,
            ButtonwoodArt.defenseSprite(id).width,
            ButtonwoodArt.defenseIcon(id).width,
          ]);
        }
        return result;
      });
      assert.equal(art.length, 11);
      assert(art.every(([id, w, i]) => i === 32));
      await p.evaluate(() => defenseTest.fresh());
      const forms = await p.evaluate(() =>
        ButtonwoodArt.animalAnimations.roster.map((s, i) =>
          defenseTest.fey(s.id, -16 - i * 2, 0),
        ),
      );
      assert.equal(forms.length, 31);
      for (const role of [
        "sword",
        "bow",
        "fire",
        "frost",
        "lightning",
        "healing",
      ])
        assert.equal(
          await p.evaluate(
            ({ ids, role }) =>
              ids.filter((id) =>
                skyStackDefense.assign(id, {
                  role,
                  alarm: true,
                  active: false,
                }),
              ).length,
            { ids: forms, role },
          ),
          31,
        );
      // Native cauldron bucket transaction, no phantom liquid.
      const cauldron = await p.evaluate(() => {
        for (let x = 2; x < 4; x++) defenseTest.floor(x, -1);
        return defenseTest.building("oilDropper", 64, -96);
      });
      await p.evaluate((id) => {
        defenseTest.bucket("bucket:oil", 1);
        defenseTest.open(id);
      }, cauldron);
      await p.locator("#defenseBucketV93").click();
      assert.equal(
        await p.evaluate(() => defenseTest.buckets()["bucket:oil"]),
        0,
      );
      assert.equal(await p.evaluate(() => defenseTest.buckets().bucket), 1);
      assert.equal(
        await p.evaluate(
          (id) => defenseTest.stocks.find((b) => b.id === id).stock.oilCharge,
          cauldron,
        ),
        4,
      );
      await p.locator("#buildingClose").click();
      const liquidDelivery = await p.evaluate(
        ({ cauldron, f }) => {
          const tank = defenseTest.building("tank", -192, -96);
          defenseTest.tank(tank, "oil", 2);
          defenseTest.stock(cauldron, { oilCharge: 0 });
          defenseTest.position(f, -208, -14);
          skyStackDefense.assign(f, {
            job: "Supply",
            alarm: false,
            active: true,
          });
          defenseTest.pure(20);
          const picked = {
            tank: defenseTest.tanks.find((b) => b.id === tank).amount,
            cargo: skyStackDefense.state.orders[f].cargo,
          };
          skyStackDefense.release(f);
          return {
            picked,
            returned: defenseTest.tanks.find((b) => b.id === tank).amount,
          };
        },
        { cauldron, f: forms[0] },
      );
      assert.equal(liquidDelivery.picked.tank, 0);
      assert.equal(liquidDelivery.picked.cargo.n, 8);
      assert.equal(
        liquidDelivery.returned,
        2,
        "aborted liquid delivery returns exact Tank volume",
      );
      // Attached phone layouts and actual alarm UI.
      await p.evaluate(() => defenseTest.building("armory", 192, -128));
      for (const [width, height] of [
        [1200, 850],
        [390, 844],
        [320, 568],
        [844, 390],
      ]) {
        await p.setViewportSize({ width, height });
        await p.evaluate(() => skyStackDefense.open());
        const box = await p.locator("#defensePanelV93").boundingBox();
        assert(
          box.x >= 0 &&
            box.x + box.width <= width + 1 &&
            box.y >= 0 &&
            box.y + box.height <= height + 1,
          JSON.stringify({ width, box }),
        );
        await p.locator("#defenseCloseV93").click();
      }
      await p.setViewportSize({ width: 1200, height: 850 });
      await p.evaluate(() => skyStackDefense.open());
      await p.locator("#defenseBeginV93").click();
      assert.equal(
        await p.evaluate(() => skyStackDefense.state.phase),
        "warning",
      );
      assert(await p.locator("#defenseBeginV93").isDisabled());
      fs.mkdirSync("tower-of-babel/buttonwood/qa/defense", { recursive: true });
      await p.evaluate(() => defenseTest.render());
      await p.screenshot({
        path: "tower-of-babel/buttonwood/qa/defense/orders-desktop.png",
      });
      await p.setViewportSize({ width: 320, height: 568 });
      await p.evaluate(() => {
        skyStackDefense.open();
        defenseTest.render();
      });
      await p.waitForTimeout(100);
      await p.screenshot({
        path: "tower-of-babel/buttonwood/qa/defense/orders-phone.png",
      });
      const gallery = await b.newPage({
        viewport: { width: 1200, height: 900 },
      });
      await gallery.goto(base + "buttonwood/combat.html");
      await gallery.waitForSelector("article");
      await gallery.screenshot({
        path: "tower-of-babel/buttonwood/qa/defense/gallery.png",
        fullPage: true,
      });
      assert.deepEqual(errors, []);
      console.log(
        "PASS production crafting, equipment ledger, real crew travel/fire, reload/save/pause/capture, 31 species × 6 roles, palette/alpha/native icons, bucket conservation, attached desktop/phone UI and alarm",
      );
    } finally {
      await b.close();
    }
  })().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
