const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
 const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
 await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.storageTest={
 start:startStructureV46,jobs:JOBS_V46,employee(b){const p=buildingDoorV56(b);createMinerAt(p.x,p.y);const q=[...miners].at(-1);b.workerId=q.game.id;b.auto=true;q.game.atWorkV56=b.id},inv,bag:structureBagV46,craft:craftWorkshopV46,place:placeStructureV46,open:openBuildingV46,transfer:transferStockV56,step:stepStructuresV46,save:saveGame,pack:packStructureV46,ui,art:structureSpriteV46,icon:uiPixelV48,
 get buildings(){return structuresV46},render(){loop(performance.now())},
 fixture(){for(const z of [...bs]){World.remove(eng.world,z);bs.delete(z)}grid.clear();for(const q of miners)World.remove(eng.world,q);miners.clear();for(const body of structureBodiesV47.values())World.remove(eng.world,body);structureBodiesV47.clear();structuresV46=[];
 for(let x=-20;x<30;x++)mk(ctr(x),ctr(0),'dirt',{terrain:true,static:true,cx:x,cy:0});Object.assign(cam,{x:160,y:-130,z:1,anim:false});Object.assign(inv,{wood:2000,stone:2000,dirt:100,ironOre:100});ui()}
 };`)});});
 const load=async()=>{await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:8769/tower-of-babel/');await page.waitForFunction(()=>window.storageTest,null,{polling:100,timeout:20000})};
 await load();await page.evaluate(()=>{const t=storageTest;t.fixture();for(const [type,x,y] of [['workshop',0,-128],['forge',192,-96],['blacksmith',320,-128]]){t.bag[type]=1;if(!t.place({type,x,y}))throw Error('Placement failed')}Object.assign(t.inv,{coal:100,ironIngot:100})});
 for(const [type,recipe,button] of [['workshop','storehouse','#craft-structure-storehouse'],['forge','ironIngot','#buildingProduce'],['blacksmith','nails','#buildingProduce']]){
  const before=await page.evaluate(({type,recipe})=>{const t=storageTest,b=t.buildings.find(b=>b.type===type);b.selected=recipe;b.stock={};t.open(b);return {inv:{...t.inv},recipe:t.jobs[type][recipe]}},{type,recipe});
  assert.equal(await page.locator(button).isEnabled(),true);await page.locator(button).click();
  for(const [k,n] of Object.entries(before.recipe.inputs))assert.equal(await page.evaluate(k=>storageTest.inv[k],k),before.inv[k]-n);
  assert.deepEqual(await page.evaluate(type=>storageTest.buildings.find(b=>b.type===type).stock,type),{});
  await page.evaluate(()=>storageTest.step(10000));
  assert.deepEqual(await page.evaluate(type=>storageTest.buildings.find(b=>b.type===type).stock,type),before.recipe.outputs);
  // A manual order must not use Worker supplies when the player cannot pay.
  await page.evaluate(({type,recipe})=>{const t=storageTest,b=t.buildings.find(b=>b.type===type);b.stock={...t.jobs[type][recipe].inputs};for(const k of Object.keys(b.stock))t.inv[k]=0;t.ui()},{type,recipe});
  assert.equal(await page.locator(button).isDisabled(),true);
  assert.equal(await page.evaluate(type=>storageTest.start(storageTest.buildings.find(b=>b.type===type)),type),false);
  // An assigned Worker can craft from those supplies with an empty player inventory.
  await page.evaluate(type=>{const t=storageTest,b=t.buildings.find(b=>b.type===type);t.employee(b);t.step(10000);b.auto=false;t.ui()},type);
  const stock=await page.evaluate(type=>storageTest.buildings.find(b=>b.type===type).stock,type);
  for(const [k,n] of Object.entries(before.recipe.outputs))assert.equal(stock[k],n);
  for(const k of Object.keys(before.recipe.inputs))assert.equal(await page.evaluate(k=>storageTest.inv[k],k),0);
  // Automatic crafting cannot fall back to the player's inventory.
  await page.evaluate(type=>{const t=storageTest,b=t.buildings.find(b=>b.type===type);b.stock={};for(const k of Object.keys(t.inv))t.inv[k]=1000},type);
  assert.equal(await page.evaluate(type=>{const t=storageTest,b=t.buildings.find(b=>b.type===type);return t.start(b,b.selected,true)},type),false);
 }
 // Packing an unfinished manual order refunds the charged player resources after reload.
 const balance=await page.evaluate(()=>{const t=storageTest,b=t.buildings[0];b.selected='storehouse';const before=t.inv.wood;t.start(b);t.step(500);t.save();return before});await load();
 await page.evaluate(()=>storageTest.pack(storageTest.buildings[0]));assert.equal(await page.evaluate(()=>storageTest.inv.wood),balance);
 assert.deepEqual(errors,[]);console.log('PASS manual Workshop/Forge/Blacksmith use player resources; Worker crafting uses only building inventory; affordability UI, output, save/reload and packing refunds');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
