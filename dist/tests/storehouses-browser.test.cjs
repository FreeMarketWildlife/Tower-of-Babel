const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
 const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
 await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.storageTest={
 inv,bag:structureBagV46,craft:craftWorkshopV46,place:placeStructureV46,open:openBuildingV46,transfer:transferStockV56,step:stepStructuresV46,save:saveGame,pack:packStructureV46,ui,art:structureSpriteV46,icon:uiPixelV48,
 get buildings(){return structuresV46},render(){loop(performance.now())},
 fixture(){for(const z of [...bs]){World.remove(eng.world,z);bs.delete(z)}grid.clear();for(const q of miners)World.remove(eng.world,q);miners.clear();for(const body of structureBodiesV47.values())World.remove(eng.world,body);structureBodiesV47.clear();structuresV46=[];
 for(let x=-20;x<30;x++)mk(ctr(x),ctr(0),'dirt',{terrain:true,static:true,cx:x,cy:0});Object.assign(cam,{x:160,y:-130,z:1,anim:false});Object.assign(inv,{wood:2000,stone:2000,dirt:100,ironOre:100});ui()}
 };`)});});
 const load=async()=>{await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:8769/tower-of-babel/');await page.waitForFunction(()=>window.storageTest,null,{polling:100,timeout:20000})};
 await load();await page.evaluate(()=>{const t=storageTest;t.fixture();t.craft();t.step(1500);if(!t.place({type:'workshop',x:0,y:-128}))throw Error('Workshop placement');const shop=t.buildings[0];t.open(shop)});
 assert.equal(await page.locator('#craft-structure-storehouse').isEnabled(),true);
 await page.locator('#craft-structure-storehouse').click();await page.evaluate(()=>{storageTest.step(2500);storageTest.save()});await load();
 assert.equal(await page.evaluate(()=>storageTest.buildings[0].job.remaining),2500);
 await page.evaluate(()=>{const t=storageTest,shop=t.buildings[0];t.step(2500);t.open(shop);t.ui()});
 assert.equal(await page.evaluate(()=>storageTest.buildings[0].stock.storehouse),1);
 await page.selectOption('#stockResourceV60','storehouse');await page.locator('#stockWithdrawV60').click();
 assert.equal(await page.evaluate(()=>storageTest.bag.storehouse),1);
 await page.locator('#buildingClose').click();
 await page.evaluate(()=>{const t=storageTest;if(!t.place({type:'storehouse',x:192,y:-128}))throw Error('Storehouse placement');const b=t.buildings[1];t.open(b)});
 assert.equal(await page.locator('#buildingPanel').evaluate(e=>e.matches(':modal')),false);
 assert.equal(await page.locator('#buildingRecipe').isVisible(),false);
 assert.equal(await page.locator('#stockCountV60').innerText(),'0 / 1000');
 await page.selectOption('#stockResourceV60','wood');await page.fill('#stockAmountV60','990');await page.locator('#stockDepositV60').click();
 await page.selectOption('#stockResourceV60','ironOre');await page.fill('#stockAmountV60','20');await page.locator('#stockDepositV60').click();
 assert.deepEqual(await page.evaluate(()=>[storageTest.buildings[1].stock.wood,storageTest.buildings[1].stock.ironOre,storageTest.inv.ironOre]),[990,10,90]);
 assert.equal(await page.locator('#stockCountV60').innerText(),'1000 / 1000');assert.equal(await page.locator('#stockDepositV60').isDisabled(),true);
 assert.equal(await page.evaluate(()=>storageTest.transfer(storageTest.buildings[1],'stone',1,true)),false);
 assert.equal(await page.evaluate(()=>storageTest.transfer(storageTest.buildings[1],'wood',-10,true)),false);
 await page.fill('#stockAmountV60','4');await page.locator('#stockWithdrawV60').click();
 assert.equal(await page.evaluate(()=>storageTest.inv.ironOre),94);
 await page.evaluate(()=>storageTest.save());await load();
 assert.deepEqual(await page.evaluate(()=>storageTest.buildings[1].stock),{wood:990,ironOre:6});
 await page.evaluate(()=>{const t=storageTest;t.open(t.buildings[1]);t.render()});await page.screenshot({path:'/tmp/storehouse-desktop.png'});
 const dimensions=await page.evaluate(async()=>{const t=storageTest,world=t.art('storehouse'),icon=new Image();icon.src=t.icon('storehouse');await icon.decode();return [world.width,world.height,icon.width,icon.height]});assert.deepEqual(dimensions,[160,128,32,32]);
 await page.locator('#buildingClose').click();await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{storageTest.open(storageTest.buildings[1]);storageTest.render()});
 const box=await page.locator('#buildingPanel').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390&&box.y>=0&&box.y+box.height<=844);
 await page.screenshot({path:'/tmp/storehouse-mobile.png'});
 const before=await page.evaluate(()=>[storageTest.inv.wood,storageTest.inv.ironOre]);await page.locator('#buildingPack').click();
 assert.deepEqual(await page.evaluate(()=>[storageTest.inv.wood,storageTest.inv.ironOre,storageTest.bag.storehouse]),[before[0]+990,before[1]+6,1]);
 await page.evaluate(()=>storageTest.save());await load();assert.equal(await page.evaluate(()=>storageTest.bag.storehouse),1);assert.equal(await page.evaluate(()=>storageTest.buildings.length),1);
 assert.deepEqual(errors,[]);console.log('PASS Workshop crafting and mid-job reload, output collection, placement, shared 1000 capacity, partial deposits, full rejection, withdrawal, saved contents, packing refunds, native art, desktop/mobile UI');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
