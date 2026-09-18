const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.SKY_TEST_URL||'http://127.0.0.1:8765/tower-of-babel/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const errors=[];
  for(const mobile of [false,true]){
   const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1100,height:820},isMobile:mobile,hasTouch:mobile});
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
   await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.disclosureTest={inv,ui,render:()=>loop(performance.now()),get dragging(){return !!structureDragV46},get gesture(){return !!gesture},finish(){stepPlayerCraftV61(2000);ui()},picks(){pickaxeOwnedTier=3;refreshPickaxeV39()},building(){best=40;stone=true;restingMiners.push({id:++minerId,level:1,gold:0});ui();const b={type:'workshop',id:++structureIdV46,x:0,y:-128,selected:'home',stock:{wood:30,stone:20},paused:false,job:null};structuresV46.push(b);openBuildingV46(b)}};`)});});
   await page.goto(url);await page.waitForFunction(()=>window.disclosureTest,null,{polling:100});
   const shot=async name=>{if(process.env.UI_SCREENSHOT_DIR){fs.mkdirSync(process.env.UI_SCREENSHOT_DIR,{recursive:true});await page.evaluate(()=>disclosureTest.render());await page.screenshot({path:process.env.UI_SCREENSHOT_DIR+'/'+(mobile?'phone-':'desktop-')+name+'.png'})}};
   const settled=()=>page.waitForFunction(()=>!document.getAnimations().some(a=>a.effect?.target.matches('.structureDetailsV64,.disclosureBodyV67')),null,{polling:20});
   const button='[aria-controls="structure-details-storehouse"]',body='#structure-details-storehouse';
   await page.locator('#structuresOpen').click();
   await page.locator(button).click();
   assert.equal(await page.locator(button).getAttribute('aria-expanded'),'true');
   await settled();
   assert.equal(await page.locator(body).evaluate(el=>el.inert),false);
   const full=await page.locator(body).evaluate(el=>el.getBoundingClientRect().height);
   assert.ok(full>100);
   // Hold an actual closing animation midway: visible content shrinks without
   // becoming keyboard reachable, and reversing resumes at the visible height.
   const middle=await page.locator(button).evaluate(el=>{
    el.click();const section=document.getElementById(el.getAttribute('aria-controls')),animation=section.getAnimations()[0];
    animation.pause();animation.currentTime=95;
    return {height:section.getBoundingClientRect().height,inert:section.inert,hidden:section.hidden,expanded:el.getAttribute('aria-expanded')};
   });
   assert.ok(middle.height>0&&middle.height<full);assert.equal(middle.inert,true);assert.equal(middle.hidden,false);assert.equal(middle.expanded,'false');
   const reversed=await page.locator(button).evaluate(el=>{el.click();return document.getElementById(el.getAttribute('aria-controls')).getBoundingClientRect().height});
   assert.ok(Math.abs(reversed-middle.height)<2,'Reversal starts at the current height');await settled();
   await page.locator(button).evaluate(el=>{for(let n=0;n<7;n++)el.click()});await settled();
   assert.equal(await page.locator(body).evaluate(el=>el.hidden),true);
   await page.locator(button).click();await settled();
   await page.locator('[aria-controls="structure-details-home"]').click();await settled();
   assert.equal(await page.locator('.structureInfoV64[aria-expanded=true]').count(),1);
   assert.equal(await page.locator(body).evaluate(el=>el.hidden),true);
   assert.equal(await page.evaluate(()=>disclosureTest.dragging||disclosureTest.gesture),false);
   // Growing content during a transition and after completion must not be clipped.
   await page.locator(button).evaluate(el=>{el.click();const section=document.getElementById(el.getAttribute('aria-controls'));const p=document.createElement('p');p.id='extra-disclosure-text';p.textContent='Extra changing content. '.repeat(20);section.firstElementChild.append(p)});
   await settled();
   assert.ok(await page.locator(body).evaluate(el=>el.scrollHeight<=el.clientHeight+1));
   await page.locator('#extra-disclosure-text').evaluate(el=>el.remove());
   await page.locator(button).click();await settled();
   // Source icons use only named colors and full-opacity integer pixels.
   const art=await page.evaluate(()=>{
    const A=ButtonwoodArt,colors=new Set(Object.values(A.palette).map(s=>s.toLowerCase()));
    return ['move','craft','info','wood','dirt','stone','deepslate','pick'].flatMap(kind=>(kind==='pick'?[0,1,2,3]:[0]).map(tier=>{
     const c=A.uiIcon(kind,tier),pixels=c.getContext('2d').getImageData(0,0,32,32).data;let opaque=0,valid=true,square=true;
     for(let i=0;i<pixels.length;i+=4){if(!pixels[i+3])continue;opaque++;const hex='#'+[...pixels.slice(i,i+3)].map(v=>v.toString(16).padStart(2,'0')).join('');valid&&=pixels[i+3]===255&&colors.has(hex)}
     if(['wood','dirt','stone','deepslate'].includes(kind))for(let y=0;y<32;y++)for(let x=0;x<32;x++)square&&=(pixels[(y*32+x)*4+3]===255)===(x>=4&&x<28&&y>=4&&y<28);
     return {kind,tier,width:c.width,height:c.height,valid,square,opaque,url:c.toDataURL()};
    }));
   });
   for(const icon of art){assert.equal(icon.width,32);assert.equal(icon.height,32);assert.ok(icon.valid&&icon.square&&icon.opaque>30,icon.kind)}
   assert.equal(new Set(art.filter(i=>i.kind==='pick').map(i=>i.url)).size,4);
   const rows=await page.locator('.playerCostsV61 [data-material]').evaluateAll(els=>els.map(el=>({kind:el.dataset.material,src:el.querySelector('img').src,w:el.querySelector('img').width,h:el.querySelector('img').height})));
   for(const row of rows){assert.equal(row.w,32);assert.equal(row.h,32);if(art.some(i=>i.kind===row.kind))assert.equal(row.src,art.find(i=>i.kind===row.kind).url)}
   assert.equal(await page.locator('#player-craft-home').isDisabled(),true);await shot('unaffordable');
   await page.evaluate(()=>{Object.assign(disclosureTest.inv,{wood:200,stone:200,dirt:200,ironIngot:200});disclosureTest.ui()});
   assert.equal(await page.locator('#player-craft-home').isEnabled(),true);await shot('affordable');
   await page.locator('#player-craft-home').click();
   assert.equal(await page.locator('#player-craft-home').getAttribute('aria-busy'),'true');assert.equal(await page.locator('#player-craft-home').evaluate(el=>getComputedStyle(el).filter),'none');await shot('crafting');
   await page.evaluate(()=>disclosureTest.finish());assert.equal(await page.locator('#player-craft-home').getAttribute('aria-busy'),'false');
   await page.locator('#structuresClose').click();
   for(const tool of ['move','pick']){
    const rect=await page.locator('[data-tool='+tool+']').boundingBox();
    if(mobile){
     const session=await page.context().newCDPSession(page);
     await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width/2,y:rect.y+rect.height/2,id:1}]});
     await shot(tool+'-pressed');await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await session.detach();
    }else{
     await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await shot(tool+'-pressed');await page.mouse.up();
    }
   }
   if(await page.locator('#pickaxeShop').evaluate(el=>el.open))await page.locator('#pickaxeClose').click();
   await page.locator('[data-tool=move]').click();await shot('move-selected');
   await page.locator('[data-tool=pick]').click();await page.evaluate(()=>disclosureTest.picks());await page.locator('[data-tool=pick]').click();
   for(let tier=0;tier<4;tier++){
    await page.locator('#equip-pick-'+tier).click();
    const background=await page.locator('[data-tool=pick] .icon').evaluate(el=>el.style.backgroundImage);
    assert.ok(background.includes(art.find(i=>i.kind==='pick'&&i.tier===tier).url));
    await page.locator('[data-tool=pick]').click();
   }
   await shot('pick-tiers');await page.locator('#pickaxeClose').click();
   await page.locator(mobile?'#phoneGuide':'#tipBtn').click();
   const guides=page.locator('.tipsGroups summary');
   // Start from an explicitly collapsed state and exercise native keyboard activation.
   if(await guides.nth(0).getAttribute('aria-expanded')==='true'){await guides.nth(0).click();await settled()}
   await guides.nth(0).focus();await page.keyboard.press('Enter');await settled();
   assert.equal(await guides.nth(0).getAttribute('aria-expanded'),'true');
   await guides.nth(1).click();await settled();
   assert.equal(await guides.nth(0).getAttribute('aria-expanded'),'false');
   assert.equal(await guides.nth(1).getAttribute('aria-expanded'),'true');await shot('guide');
   await page.locator(mobile?'#phoneGuide':'#tipBtn').click();
   if(mobile){
    await page.evaluate(()=>disclosureTest.building());
    const stock=page.locator('#phoneStock summary');await stock.click();await settled();
    await page.locator('#stockAmountV60').focus();await stock.evaluate(el=>el.click());
    assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#phoneStock summary')),true);
    assert.equal(await page.locator('#phoneStock .disclosureBodyV67').evaluate(el=>el.inert),true);await settled();
    assert.equal(await page.locator('#phoneStock').getAttribute('open'),null);
    await stock.click();await page.setViewportSize({width:1100,height:820});await settled();
    for(const id of ['phoneStock','phoneAutomation','phoneHomeInfo'])assert.equal(await page.locator('#'+id).evaluate(el=>el.open&&!el.lastElementChild.inert&&!el.lastElementChild.hidden),true);
    await page.setViewportSize({width:320,height:568});await page.locator('#buildingClose').click();
    for(const viewport of [{width:320,height:568},{width:390,height:844},{width:430,height:932},{width:844,height:390}]){
     await page.setViewportSize(viewport);await page.locator('#structuresOpen').click();
     await page.locator(button).click();await settled();
     const bounds=await page.locator('#structuresPanel').evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,header:document.getElementById('phoneHud').getBoundingClientRect().bottom,bar:document.getElementById('bar').getBoundingClientRect().top,wide:el.scrollWidth>el.clientWidth+1}});
     assert.ok(bounds.top>=bounds.header+6&&bounds.bottom<=bounds.bar-6&&!bounds.wide,JSON.stringify(bounds));
     await page.locator(body+' p').last().scrollIntoViewIfNeeded();await shot('expanded-'+viewport.width);
     await page.locator(button).evaluate(el=>el.click());await settled();await page.locator('#structuresClose').click();
    }
   }
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('#structuresOpen').click();
   const reduced=await page.locator(button).evaluate(el=>{el.click();const section=document.getElementById(el.getAttribute('aria-controls'));return {animations:section.getAnimations().length,hidden:section.hidden,inert:section.inert}});
   assert.deepEqual(reduced,{animations:0,hidden:false,inert:false});
   await page.locator(button).click();assert.equal(await page.locator(body).evaluate(el=>el.hidden),true);
   await page.locator('#structuresClose').click();await page.close();
   console.log('PASS '+(mobile?'phone':'desktop')+' disclosure motion, reversal, exclusivity, dynamic height, keyboard, reduced motion, native art, tiers and crafting states');
  }
  const gallery=await browser.newPage({viewport:{width:1100,height:1100}});
  gallery.on('pageerror',e=>errors.push(e.message));
  await gallery.goto(new URL('buttonwood/',url).href);
  await gallery.waitForSelector('#ui-icons canvas');
  assert.equal(await gallery.locator('#ui-icons canvas').count(),11);
  if(process.env.UI_SCREENSHOT_DIR)await gallery.locator('section[aria-labelledby="tools-heading"]').screenshot({path:process.env.UI_SCREENSHOT_DIR+'/native-ui-gallery.png'});
  await gallery.goto(new URL('tests/art.html',url).href);await gallery.waitForTimeout(500);
  assert.ok(!(await gallery.locator('main>p').first().innerText()).includes('undefined'));
  await gallery.close();
  assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
