const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
 const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.workerTest={
  setup(){for(const q of miners)World.remove(eng.world,q);miners.clear();restingMiners.length=0;familiesV55.clear();childrenV55=[];settlementV55={day:1,phase:'day',elapsed:0};const h={id:++structureIdV46,type:'home',x:640,y:-128,job:null,auto:false,paused:false};structuresV46.push(h);addStructureBodyV47(h);createMinerAt(580,-30);createMinerAt(600,-30);createMinerAt(620,-30);shelterWorkersV55();refreshWorkersV55()},
  step(ms,roll=1){stepWorkersV55(ms,()=>roll)},save:saveGame,
  get state(){return {clock:{...settlementV55},families:[...familiesV55.values()],children:childrenV55.map(c=>({...c})),adults:adultsV55().length,sleeping:[...miners].filter(q=>q.game.sleepingV55).length}},
  pack(){const h=homesV55()[0];packStructureV46(h);shelterWorkersV55()},open(){openBuildingV46(homesV55()[0])},
  craft(){const b={id:++structureIdV46,type:'workshop',x:1000,y:-128,selected:'home',job:null,auto:false,paused:false};structuresV46.push(b);inv.wood=15;inv.stone=5;assertCraft=startStructureV46(b);stepStructuresV46(5000);return {ok:assertCraft,homes:structureBagV46.home,stockHomes:b.stock.home,wood:inv.wood,stone:inv.stone}},
  draw(){cam.x=640;cam.y=-100;ctx.setTransform(DPR,0,0,DPR,0,0);bg();for(const z of bs)draw(z);for(const q of miners)drawMiner(q,0);drawGoldBursts(0)}
 };`.replace('assertCraft=startStructureV46(b)','const assertCraft=startStructureV46(b)'))})});
 const load=async()=>{await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:8767/tower-of-babel/');await page.waitForFunction(()=>window.workerTest,null,{polling:100,timeout:20000})};await load();
 await page.evaluate(()=>workerTest.setup());assert.equal((await page.evaluate(()=>workerTest.state)).sleeping,0);
 await page.evaluate(()=>workerTest.step(179999,0));assert.equal((await page.evaluate(()=>workerTest.state)).clock.phase,'day');
 await page.evaluate(()=>workerTest.step(1,0));let s=await page.evaluate(()=>workerTest.state);assert.equal(s.sleeping,2);assert.equal(s.families.filter(f=>f.pregnant).length,1);assert.equal(s.children.length,0);
 await page.evaluate(()=>{workerTest.open();workerTest.draw();workerTest.save()});await page.screenshot({path:'/tmp/workers-night.png'});await load();s=await page.evaluate(()=>workerTest.state);assert.equal(s.sleeping,2);assert.equal(s.families.filter(f=>f.pregnant).length,1);
 await page.evaluate(()=>workerTest.step(59999));assert.equal((await page.evaluate(()=>workerTest.state)).children.length,0);
 await page.evaluate(()=>workerTest.step(1));s=await page.evaluate(()=>workerTest.state);assert.equal(s.children.length,1);assert.equal(s.children[0].days,0);assert.equal(s.sleeping,0);
 await page.evaluate(()=>workerTest.step(180000));s=await page.evaluate(()=>workerTest.state);assert.equal(s.children[0].days,1);assert.equal(s.adults,3);
 await page.evaluate(()=>{workerTest.save();workerTest.draw()});await load();assert.equal((await page.evaluate(()=>workerTest.state)).children[0].days,1);
 await page.evaluate(()=>workerTest.step(240000));s=await page.evaluate(()=>workerTest.state);assert.equal(s.children.length,0);assert.equal(s.adults,4);
 await page.evaluate(()=>workerTest.pack());assert.equal((await page.evaluate(()=>workerTest.state)).sleeping,0);
 const crafted=await page.evaluate(()=>workerTest.craft());assert.equal(crafted.ok,true);assert.equal(crafted.homes,1);assert.equal(crafted.stockHomes,1);assert.equal(crafted.wood,0);assert.equal(crafted.stone,0);
 await page.evaluate(()=>workerTest.setup());await page.evaluate(()=>workerTest.step(180000,.25));assert.equal((await page.evaluate(()=>workerTest.state)).families.filter(f=>f.pregnant).length,0);
 await page.evaluate(()=>workerTest.step(240000,.249999));assert.equal((await page.evaluate(()=>workerTest.state)).families.filter(f=>f.pregnant).length,1);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{workerTest.open();workerTest.draw()});
 const box=await page.locator('#homePanel').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390);assert.ok(box.y>=0&&box.y+box.height<=844);await page.screenshot({path:'/tmp/workers-mobile.png'});
 await page.waitForTimeout(50);assert.doesNotMatch(await page.locator('body').innerText(),/\bminers?\b/i);assert.deepEqual(errors,[]);
 console.log('PASS exact day/night boundaries, two beds, 25% threshold, pregnancy and sleeping reload, birth, baby/kid growth, packing, home crafting, rendering and Worker copy');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
