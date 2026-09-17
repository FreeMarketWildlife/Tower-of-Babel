const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.SKY_TEST_URL||'http://127.0.0.1:8765/tower-of-babel/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});page.on('console',m=>{if(m.type()==='error')console.error(m.text())});
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.mobileTest={ui,toast,inv,render:()=>loop(performance.now()),save:saveGame,open:openBuildingV46,clock:refreshWorkersV55,unlock(){best=40;stone=true;deepslate=true;inv.nails=20;restingMiners.push({id:++minerId,level:1,gold:0});ui();refreshWorkersV55()},building(type){const b={type,id:++structureIdV46,x:0,y:-128,selected:Object.keys(JOBS_V46[type]||{})[0],stock:{wood:30,stone:20},paused:false,job:null};structuresV46.push(b);openBuildingV46(b);return b.id}};`)});});
  await page.goto(url);await page.waitForFunction(()=>window.mobileTest,null,{polling:100});
  const shot=async name=>{if(process.env.MOBILE_SCREENSHOT_DIR){fs.mkdirSync(process.env.MOBILE_SCREENSHOT_DIR,{recursive:true});await page.evaluate(()=>mobileTest.render());await page.screenshot({path:process.env.MOBILE_SCREENSHOT_DIR+'/'+name+'.png'})}};
  const bounded=async selector=>{
   await page.waitForFunction(selector=>{const r=document.querySelector(selector).getBoundingClientRect(),h=document.getElementById('phoneHud').getBoundingClientRect(),b=document.getElementById('bar').getBoundingClientRect();return r.top>=h.bottom+6&&r.bottom<=b.top-6},selector,{polling:100,timeout:3000});
   const result=await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect(),h=document.getElementById('phoneHud').getBoundingClientRect(),b=document.getElementById('bar').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,header:h.bottom,bar:b.top,viewport:innerWidth,scroll:el.scrollWidth,width:el.clientWidth}});
   assert.ok(result.left>=0&&result.right<=result.viewport+1,selector+' fits horizontally '+JSON.stringify(result));
   assert.ok(result.top>=result.header+6&&result.bottom<=result.bar-6,selector+' clears header and toolbar '+JSON.stringify(result));
   assert.ok(result.scroll<=result.width+1,selector+' has no clipped horizontal content '+JSON.stringify(result));
  };
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:430,height:932},{width:844,height:390}]){
   await page.setViewportSize(viewport);
   await page.waitForFunction(()=>document.body.classList.contains('phone-ui'),null,{polling:100});
   assert.equal(await page.locator('#stoneSlot').isVisible(),false);
   assert.equal(await page.locator('#phoneVillage').isVisible(),false);
   await shot('fresh-'+viewport.width);
   await page.locator('#phoneGoal summary').click();await bounded('#phoneGoal .phoneContent');assert.ok(await page.locator('#questSub').isVisible());
   await page.locator('#phoneSettings summary').click();assert.equal(await page.locator('#quest').isVisible(),false);await bounded('#phoneSettings .phoneContent');assert.equal(await page.locator('#nailToggle').isVisible(),false);
   await page.locator('#phoneGuide').click();await bounded('#tips');assert.equal(await page.locator('#gridToggle').isVisible(),false);
   await page.locator('.tipsGroups summary').first().click();await bounded('#tips');await shot('guide-'+viewport.width);
   await page.locator('#structuresOpen').click();await bounded('#structuresPanel');assert.equal(await page.locator('#tips').isVisible(),false);
   await page.locator('.structureInfoV64').first().click();await bounded('#structuresPanel');await shot('structures-'+viewport.width);
   await page.locator('#structuresClose').click();await page.locator('[data-tool=pick]').click();await bounded('#pickaxeShop');assert.equal(await page.locator('#equip-pick-2').isVisible(),false);
   await page.locator('#pickaxeClose').click();
  }
  console.log('PASS fresh phone UI, collapsible panels, locked content, 320/390/430px and landscape bounds');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>mobileTest.unlock());
  assert.equal(await page.locator('#phoneVillage').isVisible(),true);assert.equal(await page.locator('#stoneSlot').isVisible(),true);
  await page.locator('#phoneVillage summary').click();assert.ok((await page.locator('#workerClock').innerText()).includes('need a home'));await bounded('#phoneVillage .phoneContent');await shot('village');
  for(const type of ['workshop','forge','blacksmith','storehouse','home']){
   await page.evaluate(type=>mobileTest.building(type),type);const panel=type==='home'?'#homePanel':'#buildingPanel';await bounded(panel);await shot(type);
   if(type!=='home'){
    if(type!=='storehouse')await page.locator('#phoneStock summary').click();
    await page.locator('#stockAmountV60').fill('1');await page.locator('#stockWithdrawV60').click();await bounded(panel);
    if(type!=='storehouse'){await page.locator('#phoneAutomation summary').click();await page.locator('#buildingSecondaryV56').scrollIntoViewIfNeeded();await bounded(panel)}
   }else{await page.locator('#phoneHomeInfo summary').click();await bounded(panel)}
   await page.setViewportSize({width:844,height:390});await bounded(panel);await shot(type+'-landscape');await page.setViewportSize({width:390,height:844});
   await page.locator(type==='home'?'#homeClose':'#buildingClose').click();
  }
  console.log('PASS unlocked Village, all building panels, inventory transfers, expandable automation and rotation');
  await page.evaluate(()=>{document.getElementById('devPanel').showModal();mobileTest.toast('A notification above the dialog',true)});
  assert.equal(await page.locator('#toast').evaluate(el=>el.matches(':popover-open')),true);await shot('toast-over-dialog');
  await page.evaluate(()=>document.getElementById('devPanel').close());
  await page.evaluate(()=>{mobileTest.toast('First notification',true);document.getElementById('devPanel').showModal()});
  assert.equal(await page.locator('#toast').evaluate(el=>el.matches(':popover-open')),true);await page.evaluate(()=>document.getElementById('devPanel').close());
  await page.waitForFunction(()=>document.getElementById('toast').classList.contains('hide'),null,{timeout:5000,polling:100});assert.equal(await page.locator('#toast').evaluate(el=>el.matches(':popover-open')),false);
  await page.locator('#phoneSettings summary').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#phoneSettings').getAttribute('open'),null);
  await page.setViewportSize({width:1100,height:820});await page.waitForFunction(()=>!document.body.classList.contains('phone-ui'),null,{polling:100});assert.equal(await page.locator('#phoneHud').isVisible(),false);assert.equal(await page.locator('#hud .hudLeft').count(),1);assert.equal(await page.locator('#hud .audioToggles').count(),1);assert.equal(await page.locator('#workerClock').isVisible(),true);
  await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.body.classList.contains('phone-ui'),null,{polling:100});assert.equal(await page.locator('#phoneHud').isVisible(),true);
  assert.deepEqual(errors,[]);console.log('PASS top-layer notifications, expiry, Escape, desktop restoration, no runtime errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
