'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:8791/tower-of-babel/';
const hook = `window.extractionTest={
 inv,buckets:bucketBagV68,defs:STRUCTURES_V46,bag:structureBagV46,screen:w2s,save:saveGame,ui,
 get state(){return {pipes:[...pipesV70.values()],pipeBag:pipeBagV70,buildings:structuresV46.map(b=>({...b})),buckets:{...bucketBagV68},result:extractionResultV70,tool,job:playerCraftV61,saveKey:SAVE_KEY}},
 clear(){for(const d of document.querySelectorAll('dialog[open]'))d.close();stopPointerV52();World.clear(eng.world,false);Engine.clear(eng);bs.clear();grid.clear();miners.clear();structureBodiesV47.clear();structuresV46.length=0;pipesV70.clear();pipeBagV70=0;extractionSelectedV70=null;extractionResultV70=null;liquidSubV22.clear();liquidSubFlowV22.clear();liquidSubVisualV22.clear();liquidSubImpactV22.clear();for(const k of Object.keys(bucketBagV68))delete bucketBagV68[k];for(const k of Object.keys(structureBagV46))structureBagV46[k]=0;for(const k of Object.keys(inv))inv[k]=0;hotbarItemsV68.fill(null);seenItemsV68.clear();playerCraftV61=null;generated.add(-1);generated.add(0);cam.x=-32;cam.y=-128;cam.z=1;cam.anim=false;cameraSpringActiveV24=false;tool='pick';ui()},
 camera(x=-32,y=-128,z=1){cam.x=x;cam.y=y;cam.z=z;cam.anim=false;cameraSpringActiveV24=false},
 foundation(type,x,y){const d=STRUCTURES_V46[type];for(let n=0;n<d.w;n++)mk(x+n*B+B/2,y+d.h*B+B/2,'stone',{placed:true,static:true,nailed:true})},
 place(type,x,y){structureBagV46[type]++;const ok=placeStructureV46({type,x,y});if(!ok)throw Error('Fixture placement failed: '+validStructureV46({type,x,y}));return structuresV46.at(-1)},
 build(type,x,y){this.foundation(type,x,y);return this.place(type,x,y)},
 setup(kind='oil'){this.clear();this.build('pumpjack',-192,-224);this.build('tank',32,-224);pipeBagV70=40;this.route(-5,-4,-5,-2);this.route(-2,-5,0,-5);this.seed(-5,-2,kind);ui()},
 seed(x,y,kind,amount=1){liquidSeedTileV22(x,y,kind,amount)},
 route(x,y,ex=x,ey=y,remove=false){return pipeActionV70({x:x*B+8,y:y*B+8},{x:ex*B+8,y:ey*B+8},remove)},
 pipes(n){pipeBagV70=n;ui()},select:selectPipeToolV70,
 step(ms){stepStructuresV46(ms);ui()},volume(kind){return [...liquidSubV22.values()].filter(r=>!kind||r.kind===kind).reduce((sum,r)=>sum+r.a,0)/4},
 tank(){return structuresV46.find(b=>b.type==='tank')},pump(){return structuresV46.find(b=>b.type==='pumpjack')},
 open(type){openBuildingV46(structuresV46.find(b=>b.type===type))},bucket(deposit=false,kind){return bucketTankV70(this.tank(),deposit,kind)},drain(){return drainTankV70(this.tank())},pack(type){return packStructureV46(structuresV46.find(b=>b.type===type))},
 liquid:liquidSubV22,start:startPlayerCraftV61,craftPipes:craftPipesV70,
 block(x,y,material='stone'){return mk(x*B+B/2,y*B+B/2,material,{placed:true,static:true})},
 bedrock(x,y){return mk(x*B+B/2,y*B+B/2,'bedrock',{terrain:true,static:true,cx:x,cy:y})},
 validate(type,x,y){return validStructureV46({type,x,y})},
 render(){loop(performance.now())}
};`;
const closeTo = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-8, label + ': ' + actual + ' != ' + expected);

(async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.SKY_TEST_BROWSER || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1100, height: 820 }, hasTouch: mobile, isMobile: mobile });
      const page = await context.newPage(), errors = [], mode = mobile ? 'touch' : 'desktop';
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
      await page.route('**/favicon.ico', route => route.fulfill({ status: 204 }));
      await page.route('**/game-v8-part3.txt*', async route => {
        const response = await route.fetch();
        await route.fulfill({ response, body: (await response.text()).replace('restoreDynamicState(initialSave);', 'restoreDynamicState(initialSave);' + hook) });
      });
      const load = async () => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => window.extractionTest, null, { polling: 100, timeout: 30000 });
      };
      await load();
      assert.deepEqual(errors, [], 'production loader initializes');
      const state = () => page.evaluate(() => extractionTest.state);

      for (const kind of ['oil', 'water', 'lava']) {
        const result = await page.evaluate(kind => {
          const t = extractionTest; t.setup(kind); const before = t.volume(kind);
          t.step(250); const first = { world: t.volume(kind), tank: t.tank().liquidAmount, kind: t.tank().liquidKind, pump: t.pump().extractionStatus };
          t.step(750); return { before, first, world: t.volume(kind), tank: t.tank().liquidAmount, status: t.pump().extractionStatus };
        }, kind);
        closeTo(result.first.world, result.before, kind + ' source unchanged');
        closeTo(result.first.tank, 0.25, kind + ' rate');
        assert.equal(result.first.kind, kind); assert.equal(result.first.pump, 'pumping');
        closeTo(result.world, result.before, kind + ' source unchanged after pumping');
        closeTo(result.tank, 1, kind + ' one full block');
      }
      console.log('PASS ' + mode + ' real oil/water/lava solver cells transfer at one block per second without depleting the source');

      const stopped = await page.evaluate(() => {
        const t = extractionTest, checks = [];
        const check = (label, status, amount) => {
          const before = t.volume(); t.step(500);
          if (t.pump().extractionStatus !== status || t.volume() !== before || t.tank().liquidAmount !== amount) throw Error(label + ': ' + t.pump().extractionStatus);
          checks.push(label);
        };
        t.setup(); t.pump().paused = true; check('paused', 'paused', 0);
        t.setup(); t.tank().liquidAmount = 32; t.tank().liquidKind = 'oil'; check('full', 'full', 32);
        t.setup(); t.tank().liquidAmount = 2; t.tank().liquidKind = 'water'; check('mixed', 'mixed', 2);
        t.setup(); t.route(-1, -5, -1, -5, true); check('disconnected', 'no-tank', 0);
        t.setup(); t.route(-5, -4, -5, -4, true); check('missing intake', 'no-intake', 0);
        t.setup(); t.route(-2, -5, -2, -5, true); check('missing outlet', 'no-outlet', 0);
        t.setup(); t.liquid.clear(); check('dry', 'dry', 0);
        t.setup(); t.route(-5, -4, 0, -1); t.route(0, -1, 0, -5); check('loop', 'loop', 0);
        t.setup(); const before=t.volume(); t.step(0); t.step(-100); t.step(NaN); if(t.volume()!==before||t.tank().liquidAmount)throw Error('invalid elapsed');
        return checks;
      });
      assert.equal(stopped.length, 8);
      console.log('PASS ' + mode + ' paused/full/mixed/disconnected/dry/loop/invalid-time networks conserve liquid');

      await page.evaluate(() => { extractionTest.setup(); extractionTest.open('pumpjack'); });
      assert.equal(await page.locator('#extractionPanelV70').evaluate(element => element.open && !element.matches(':modal')), true);
      assert.deepEqual(await page.locator('#extractionPortraitV70').evaluate(element=>{
        const r=element.getBoundingClientRect();return {w:element.width,h:element.height,displayW:r.width,displayH:r.height};
      }),{w:128,h:96,displayW:128,displayH:96});
      await page.locator('#pumpPauseV70').click();
      assert.equal((await state()).buildings.find(b => b.type === 'pumpjack').paused, true);
      assert.equal(await page.locator('#pumpPauseV70').textContent(), 'Resume');
      await page.locator('#pumpPauseV70').click();
      assert.equal((await state()).buildings.find(b => b.type === 'pumpjack').paused, false);
      await page.locator('#extractionCloseV70').click();
      assert.equal(await page.locator('#structuresOpen').evaluate(element => document.activeElement === element), true);
      await page.evaluate(()=>extractionTest.open('pumpjack'));await page.keyboard.press('Escape');
      assert.equal(await page.locator('#extractionPanelV70').evaluate(element=>element.open),false);
      assert.equal(await page.locator('#structuresOpen').evaluate(element=>document.activeElement===element),true,'Escape restores equipment trigger focus');

      const tankTransactions = await page.evaluate(() => {
        const t = extractionTest, checks = [];
        const check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
        t.setup(); t.step(1000); t.buckets.bucket = 1; t.ui();
        check(!t.pack('tank'), 'nonempty tank cannot pack');
        check(t.bucket(), 'fill reusable bucket from tank');
        check(t.tank().liquidAmount === 0 && t.tank().liquidKind === null && t.buckets['bucket:oil'] === 1 && t.buckets.bucket === 0, 'exact tank to bucket transfer');
        check(t.bucket(true, 'oil'), 'deposit oil bucket');
        check(t.tank().liquidAmount === 1 && t.buckets['bucket:oil'] === 0 && t.buckets.bucket === 1, 'bucket empties and tank gains one block');
        t.buckets['bucket:water'] = 1;
        check(!t.bucket(true, 'water') && t.buckets['bucket:water'] === 1 && t.tank().liquidKind === 'oil', 'mixed deposit is pure rejection');
        t.block(4, -5); const before = t.volume();
        check(!t.drain() && t.tank().liquidAmount === 1 && t.volume() === before, 'blocked drain retains fluid');
        t.setup(); t.tank().liquidAmount=1;t.tank().liquidKind='lava';t.seed(4,-5,'water',0.25);const mixedBefore=t.volume();
        check(!t.drain() && t.tank().liquidAmount===1 && t.volume()===mixedBefore,'incompatible outlet retains tank contents');
        t.setup(); t.tank().liquidAmount = 0.375; t.tank().liquidKind = 'lava'; const initial=t.volume();
        check(t.drain(), 'fractional remainder drains');
        check(t.tank().liquidAmount === 0 && t.tank().liquidKind === null && Math.abs(t.volume()-initial-0.375)<1e-9, 'fractional drain conservation');
        check(t.pack('tank') && t.state.buildings.length === 1 && t.bag.tank === 1, 'empty tank packs normally');
        return checks;
      });
      assert.equal(tankTransactions.length, 11);
      console.log('PASS ' + mode + ' finite tank buckets, mixed/blocked rejection, fractional drain and pack boundaries');

      await page.evaluate(() => {
        const t=extractionTest;t.setup('water');t.step(375);t.pump().paused=true;t.buckets.bucket=2;t.buckets['bucket:oil']=1;t.save();
      });
      const beforeReload = await page.evaluate(() => ({ state:extractionTest.state, water:extractionTest.volume('water') }));
      await load();
      const afterReload = await page.evaluate(() => ({ state:extractionTest.state, water:extractionTest.volume('water') }));
      assert.deepEqual(afterReload.state.pipes, beforeReload.state.pipes);
      assert.equal(afterReload.state.pipeBag, beforeReload.state.pipeBag);
      assert.deepEqual(afterReload.state.buckets, beforeReload.state.buckets);
      assert.equal(afterReload.state.buildings.find(b=>b.type==='pumpjack').paused,true);
      closeTo(afterReload.state.buildings.find(b=>b.type==='tank').liquidAmount,0.375,'stored fraction restored');
      closeTo(afterReload.water,beforeReload.water,'remaining liquid restored');
      assert.equal(afterReload.state.saveKey,'skyStack.save.v1');
      console.log('PASS ' + mode + ' pipe layout, tank fractions/type, paused pump, buckets and real liquid survive save/reload');

      await page.evaluate(() => { const t=extractionTest;t.clear();for(const k of Object.keys(t.inv))t.inv[k]=100;t.ui(); });
      await page.locator('#structuresOpen').click();
      for (const [type,duration] of [['pumpjack',3000],['tank',2000]]) {
        const before=await page.evaluate(type=>({inv:{...extractionTest.inv},cost:extractionTest.defs[type].cost}),type);
        await page.locator('#player-craft-'+type).click();
        assert.equal((await state()).job.remaining,duration);
        assert.equal(await page.evaluate(type=>extractionTest.start(type),type),false);
        for(const [kind,amount] of Object.entries(before.cost))assert.equal(await page.evaluate(kind=>extractionTest.inv[kind],kind),before.inv[kind]-amount);
        await page.evaluate(duration=>extractionTest.step(duration-1),duration);
        assert.equal(await page.evaluate(type=>extractionTest.bag[type],type),0);
        await page.evaluate(()=>extractionTest.step(1));
        assert.equal(await page.evaluate(type=>extractionTest.bag[type],type),1);
      }
      const pipeBefore=await page.evaluate(()=>extractionTest.inv.ironIngot);
      await page.locator('#craftPipeV70').click();
      assert.equal((await state()).pipeBag,4);
      assert.equal(await page.evaluate(()=>extractionTest.inv.ironIngot),pipeBefore-1);
      await page.locator('#structuresClose').click();
      const placement = await page.evaluate(() => {
        const t=extractionTest;t.clear();t.foundation('tank',0,-128);t.pipes(4);t.route(1,-3);
        const blocked=t.validate('tank',0,-128);t.route(1,-3,1,-3,true);
        const valid=t.validate('tank',0,-128);t.place('tank',0,-128);
        t.bedrock(-3,0);const before=t.state.pipeBag,denied=t.route(-3,0);
        return {blocked,valid,denied,before,after:t.state.pipeBag,count:t.state.buildings.length};
      });
      assert.ok(placement.blocked,'pipe cells must prevent building placement');assert.equal(placement.valid,'');
      assert.equal(placement.denied,false,'bedrock cannot be drilled');assert.equal(placement.before,placement.after);assert.equal(placement.count,1);
      console.log('PASS ' + mode + ' exact crafting costs/timers, finite pipe recipe and collision/bedrock placement');

      await page.evaluate(() => { const t=extractionTest;t.clear();t.pipes(12);t.camera(0,-128,1);t.select(); });
      let from=await page.evaluate(()=>extractionTest.screen(-56,-184)),to=await page.evaluate(()=>extractionTest.screen(40,-120));
      const drag = async (start,end,cancel=false) => {
        if(mobile){
          const cdp=await context.newCDPSession(page);
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});
          for(let n=1;n<=5;n++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*n/5,y:start.y+(end.y-start.y)*n/5,id:1}]});
          await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});await cdp.detach();
        }else{
          await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:5});
          if(cancel)await page.dispatchEvent('#game','pointercancel',{pointerId:1,pointerType:'mouse',button:0});
          await page.mouse.up();
        }
      };
      await drag(from,to);
      assert.deepEqual((await state()).pipes,[{x:-2,y:-6},{x:-2,y:-5},{x:-2,y:-4},{x:-1,y:-4},{x:0,y:-4},{x:1,y:-4}]);
      assert.equal((await state()).pipeBag,6);
      await page.evaluate(()=>extractionTest.select(true));await drag(from,to);
      assert.equal((await state()).pipes.length,0);assert.equal((await state()).pipeBag,12);
      await page.evaluate(()=>extractionTest.select());await drag(from,to,true);
      assert.equal((await state()).pipes.length,0);assert.equal((await state()).pipeBag,12);
      if(mobile){
        const cdp=await context.newCDPSession(page),first={...from,id:1},second={x:from.x+80,y:from.y,id:2};
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first,second]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...first,x:first.x-10},{...second,x:second.x+10}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
        assert.equal((await state()).pipes.length,0);assert.equal((await state()).pipeBag,12);
      }
      await page.keyboard.press('Escape');assert.equal((await state()).tool,'pick');
      console.log('PASS real ' + mode + ' pipe drag lays a connected route, removal refunds, cancellation spends nothing');

      for(const viewport of mobile?[{width:320,height:568},{width:390,height:844},{width:844,height:390}]:[{width:1100,height:820}]){
        await page.setViewportSize(viewport);
        await page.evaluate(()=>{extractionTest.setup();extractionTest.open('tank')});
        const bounds=await page.locator('#extractionPanelV70').evaluate(element=>{const r=element.getBoundingClientRect(),bar=document.getElementById('bar').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,barTop:bar.top,scroll:element.scrollWidth,width:element.clientWidth}});
        assert.ok(bounds.left>=0&&bounds.right<=viewport.width&&bounds.top>=0&&bounds.bottom<=bounds.barTop-7,'attached equipment panel fits '+JSON.stringify(bounds));
        assert.ok(bounds.scroll<=bounds.width,'equipment panel has no horizontal overflow');
        const portrait=await page.locator('#extractionPortraitV70').evaluate(element=>{const r=element.getBoundingClientRect();return {w:element.width,h:element.height,displayW:r.width,displayH:r.height}});
        assert.deepEqual(portrait,{w:96,h:96,displayW:96,displayH:96});
        if(process.env.EXTRACTION_SCREENSHOT_DIR){fs.mkdirSync(process.env.EXTRACTION_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.EXTRACTION_SCREENSHOT_DIR+'/'+mode+'-'+viewport.width+'.png'})}
      }
      assert.deepEqual(errors,[]);await context.close();
      console.log('PASS ' + mode + ' native portraits, attached responsive panels and no runtime exceptions');
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
