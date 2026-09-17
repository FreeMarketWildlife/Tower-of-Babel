const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
 const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
 await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.playerTest={inv,defs:STRUCTURES_V46,bag:structureBagV46,step:stepStructuresV46,save:saveGame,ui,start:startPlayerCraftV61,render(){loop(performance.now())},get job(){return playerCraftV61},get dragging(){return !!structureDragV46},get buildings(){return structuresV46},get workshopTime(){return JOBS_V46.workshop.storehouse.duration}};`)});});
 const load=async()=>{await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:8769/tower-of-babel/');await page.waitForFunction(()=>window.playerTest,null,{polling:100,timeout:20000})};
 await load();await page.evaluate(()=>{for(const k of Object.keys(playerTest.inv))playerTest.inv[k]=1000;playerTest.ui()});await page.locator('#structuresOpen').click();
 assert.equal(await page.locator('.workshopStarter').count(),0);const types=await page.evaluate(()=>Object.keys(playerTest.defs));assert.equal(await page.locator('.playerCraftV61').count(),types.length);
 for(const type of types){
  const before=await page.evaluate(type=>({inv:{...playerTest.inv},bag:playerTest.bag[type],cost:playerTest.defs[type].cost}),type);
  await page.locator('#player-craft-'+type).click();
  assert.equal(await page.evaluate(()=>playerTest.dragging),false);assert.equal(await page.locator('#structuresPanel').evaluate(e=>e.open),true);
  assert.equal(await page.evaluate(()=>playerTest.job.remaining),1500);
  assert.equal(await page.evaluate(type=>playerTest.start(type),type),false);
  for(const [k,n] of Object.entries(before.cost))assert.equal(await page.evaluate(k=>playerTest.inv[k],k),before.inv[k]-n);
  await page.evaluate(()=>{playerTest.step(1499);playerTest.ui()});assert.equal(await page.evaluate(type=>playerTest.bag[type],type),before.bag);
  await page.evaluate(()=>{playerTest.step(1);playerTest.ui()});assert.equal(await page.evaluate(type=>playerTest.bag[type],type),before.bag+1);
 }
 assert.equal(await page.evaluate(()=>playerTest.buildings.length),0);assert.equal(await page.evaluate(()=>playerTest.workshopTime),5000);
 // Insufficient materials never charge or start a job.
 await page.evaluate(()=>{playerTest.inv.wood=0;playerTest.ui()});assert.equal(await page.locator('#player-craft-workshop').isDisabled(),true);assert.equal(await page.evaluate(()=>playerTest.start('workshop')),false);
 await page.evaluate(()=>{playerTest.inv.wood=100;playerTest.ui()});await page.locator('#player-craft-workshop').click();await page.evaluate(()=>{playerTest.step(750);playerTest.save()});
 const saved=await page.evaluate(()=>({wood:playerTest.inv.wood,bag:playerTest.bag.workshop}));await load();assert.equal(await page.evaluate(()=>playerTest.job.remaining),750);assert.equal(await page.evaluate(()=>playerTest.inv.wood),saved.wood);
 await page.evaluate(()=>{playerTest.step(750);playerTest.ui()});assert.equal(await page.evaluate(()=>playerTest.bag.workshop),saved.bag+1);await page.evaluate(()=>{playerTest.step(10000);playerTest.ui()});assert.equal(await page.evaluate(()=>playerTest.bag.workshop),saved.bag+1);
 // A future per-building duration can override the 1.5-second default.
 await page.evaluate(()=>{playerTest.defs.home.playerCraftTime=2000;playerTest.start('home')});assert.equal(await page.evaluate(()=>playerTest.job.remaining),2000);await page.evaluate(()=>{playerTest.step(2000);delete playerTest.defs.home.playerCraftTime;playerTest.ui()});
 await page.locator('#structuresOpen').click();await page.evaluate(()=>playerTest.render());await page.screenshot({path:'/tmp/player-crafting-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>playerTest.render());await page.screenshot({path:'/tmp/player-crafting-mobile.png'});
 const box=await page.locator('#structuresPanel').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390&&box.y>=0&&box.y+box.height<=844);
 assert.equal(await page.locator('#structuresPanel').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
 for(const type of types){await page.locator('#player-craft-'+type).scrollIntoViewIfNeeded();assert.equal(await page.locator('#player-craft-'+type).isVisible(),true)}
 assert.deepEqual(errors,[]);console.log('PASS every building crafts in 1500ms, exact costs, duplicate/insufficient rejection, no accidental placement, mid-craft reload, single completion, configurable timing, Workshop recipes preserved, desktop/mobile cards');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
