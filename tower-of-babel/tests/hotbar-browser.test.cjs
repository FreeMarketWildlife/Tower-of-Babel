const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.SKY_TEST_URL||'http://127.0.0.1:8774/tower-of-babel/';
const engine=process.env.SKY_TEST_ENGINE==='webkit'?'webkit':'chromium';
const hook=`window.hotbarTest={
 inv,buckets:bucketBagV68,slots:hotbarItemsV68,seen:seenItemsV68,liquid:liquidSubV22,
 ui,harvest(type){harvest(mk(-256,-256,type,{placed:true}))},save:saveGame,craft:craftBucketV68,action:bucketActionV68,choose:chooseItemV68,open:openPickerV68,
 get state(){return {tool,slots:[...hotbarItemsV68],buckets:{...bucketBagV68},seen:[...seenItemsV68],tipSeen:hotbarTipSeenV68,gesture:!!gesture,z:cam.z,x:cam.x,y:cam.y}},
 screen:w2s,seed:liquidSubPutV22,react:liquidReactV22,step:liquidStepSubV22,bodyCount:()=>bs.size,render:()=>loop(performance.now()),
 fresh(){for(const k of Object.keys(inv))inv[k]=0;for(const k of Object.keys(bucketBagV68))delete bucketBagV68[k];hotbarItemsV68.fill(null);seenItemsV68.clear();tool='pick';hotbarIndexV68=0;best=0;restingMiners.length=0;ui()},
 grant(k,n=1){if(isBucketV68(k))bucketBagV68[k]=(bucketBagV68[k]||0)+n;else inv[k]+=n;ui()},
 clearWorld(){World.clear(eng.world,false);Engine.clear(eng);bs.clear();grid.clear();miners.clear();structureBodiesV47.clear();structuresV46.length=0;liquidSubV22.clear();liquidSubFlowV22.clear();liquidSubVisualV22.clear();liquidSubImpactV22.clear();generated.add(-1);generated.add(0);cam.x=0;cam.y=-128;cam.z=1;cam.anim=false;cameraSpringActiveV24=false;gridSnapV25=false;ui()},
 camera(z){cam.z=z;cam.x=-43;cam.y=-123;cam.anim=false},
 block(x,y){return mk(x,y,'dirt',{placed:true})},
 building(){const b={id:++structureIdV46,type:'workshop',x:0,y:-128};structuresV46.push(b);addStructureBodyV47(b)},
 worker(){best=20;restingMiners.push({id:++minerId,level:1,gold:0});ui()},
 volume(kind){return [...liquidSubV22.values()].filter(r=>!kind||r.kind===kind).reduce((sum,r)=>sum+r.a,0)},
 snapshot(){return JSON.stringify({liquid:[...liquidSubV22],buckets:bucketBagV68,iron:inv.ironIngot})}
};`;
(async()=>{
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1100,height:820},hasTouch:mobile,isMobile:mobile}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('restoreDynamicState(initialSave);','restoreDynamicState(initialSave);'+hook)})});
  const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.hotbarTest,null,{polling:100})};
  const state=()=>page.evaluate(()=>hotbarTest.state),slot=n=>page.locator('[data-hotbar-slot="'+n+'"]');
  const double=async n=>{if(mobile){await slot(n).tap();await slot(n).tap()}else await slot(n).dblclick()};
  await load();
  assert.equal(await page.locator('#bar .slot').count(),6);
  assert.equal(await page.evaluate(()=>{
   const A=ButtonwoodArt,colors=new Set(Object.values(A.palette).filter(v=>typeof v==='string'&&/^#[a-f0-9]{6}$/i.test(v)).map(v=>v.toLowerCase()));
   return [['bucket',''],['bucket','water'],['bucket','lava'],['leaves',0],['obsidian',0]].every(([kind,tier])=>{
    const canvas=A.uiIcon(kind,tier),pixels=canvas.getContext('2d').getImageData(0,0,32,32).data;
    if(canvas.width!==32||canvas.height!==32)return false;
    for(let i=0;i<pixels.length;i+=4){if(!pixels[i+3])continue;if(pixels[i+3]!==255)return false;
     const color='#'+[pixels[i],pixels[i+1],pixels[i+2]].map(n=>n.toString(16).padStart(2,'0')).join('');if(!colors.has(color))return false;
    }return true;
   });
  }),true);assert.equal(await page.locator('#bar .hotbarGroupV68').count(),2);
  assert.deepEqual((await state()).slots,[null,null,null]);
  assert.deepEqual(await page.locator('#bar .slot').evaluateAll(bs=>bs.map(b=>b.getAttribute('aria-keyshortcuts'))),['1','2','3','4','5','6']);
  for(const k of ['dirt','leaves','wood'])await page.evaluate(k=>{hotbarTest.harvest(k);hotbarTest.grant(k)},k);
  assert.deepEqual((await state()).slots,['dirt','leaves','wood']);
  await page.evaluate(()=>{hotbarTest.grant('dirt');hotbarTest.grant('stone',2)});
  assert.deepEqual((await state()).slots,['dirt','leaves','wood']);
  await page.waitForFunction(m=>document.getElementById('toast').textContent.startsWith(m?'Double tap':'Double click'),mobile,{polling:100});
  assert.equal(await page.locator('#toast').evaluate(e=>e.matches(':popover-open')),true);
  await double(5);assert.equal(await page.locator('#itemPickerV68').evaluate(e=>e.open),true);
  const before=await page.evaluate(()=>({...hotbarTest.inv}));
  await page.locator('#itemChoicesV68 [data-item=stone]').click();
  assert.deepEqual((await state()).slots,['dirt','stone','wood']);assert.deepEqual(await page.evaluate(()=>({...hotbarTest.inv})),before);
  await double(6);await page.locator('#itemChoicesV68 [data-item=stone]').click();assert.deepEqual((await state()).slots,['dirt','stone','stone']);
  await page.keyboard.down('Shift');await page.keyboard.up('Shift');assert.equal(await slot(6).getAttribute('aria-pressed'),'true');
  await page.evaluate(()=>{hotbarTest.inv.stone=0;hotbarTest.ui()});assert.deepEqual((await state()).slots,['dirt','stone','stone']);assert.equal(await slot(5).locator('.itemCountV68').innerText(),'0');
  await slot(4).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#itemPickerV68').evaluate(e=>e.open),true);
  await page.locator('#clearSlotV68').click();assert.deepEqual((await state()).slots,[null,'stone','stone']);
  await page.evaluate(()=>hotbarTest.grant('obsidian'));assert.deepEqual((await state()).slots,['obsidian','stone','stone']);assert.equal((await state()).tool,'obsidian');
  await double(5);assert.equal(await page.locator('[data-item=miner].itemChoiceV68').count(),0);await page.evaluate(()=>hotbarTest.worker());assert.equal(await page.locator('[data-item=miner].itemChoiceV68').count(),1);
  await page.locator('[data-item=miner].itemChoiceV68').click();assert.equal((await state()).slots[1],'miner');
  await page.evaluate(()=>hotbarTest.save());await load();assert.deepEqual((await state()).slots,['obsidian','miner','stone']);assert.equal((await state()).tipSeen,true);
  await page.waitForTimeout(1650);assert.equal((await page.locator('#toast').textContent()).includes('Double'),false);
  console.log('PASS '+engine+' '+(mobile?'touch':'desktop')+' acquisition order, overflow, duplicates, zero stock, picker, Workers, keyboard accessibility and persistence');

  // Crafting is a deliberate picker action, using exactly five iron ingots.
  await page.evaluate(()=>{hotbarTest.clearWorld();hotbarTest.fresh();hotbarTest.inv.ironIngot=4;hotbarTest.open(0)});
  assert.equal(await page.locator('#craftBucketV68').isDisabled(),true);
  assert.equal(await page.evaluate(()=>hotbarTest.craft()),false);assert.equal(await page.evaluate(()=>hotbarTest.inv.ironIngot),4);
  await page.evaluate(()=>{hotbarTest.inv.ironIngot=10;hotbarTest.ui()});await page.locator('#craftBucketV68').click();
  assert.equal(await page.evaluate(()=>hotbarTest.inv.ironIngot),5);assert.equal((await state()).buckets.bucket,1);assert.equal((await state()).slots[0],'bucket');
  await page.locator('#itemChoicesV68 [data-item=bucket]').click();
  assert.equal((await state()).tool,'bucket');
  const result=await page.evaluate(()=>{
   const t=hotbarTest,results=[],check=(ok,label)=>{if(!ok)throw Error(label);results.push(label)},unchanged=(item,p)=>{const before=t.snapshot();check(!t.action(item,p),'invalid action rejected');check(t.snapshot()===before,'invalid action leaves resources intact')};
   t.seed(0,-8,'water',1);t.seed(1,-8,'water',1);t.seed(0,-7,'water',1);
   unchanged('bucket',{x:8,y:-120});t.seed(1,-7,'water',1);
   check(t.action('bucket',{x:8,y:-120}),'collect full block');check(t.volume()===0&&t.buckets['bucket:water']===1&&t.buckets.bucket===0,'exact four subcells collected');
   unchanged('bucket:water',{x:24*32*4,y:-100});unchanged('bucket:water',{x:8,y:64*32+4});
   t.block(-32,-96);unchanged('bucket:water',{x:-30,y:-93});
   t.seed(2,-8,'lava',.2);unchanged('bucket:water',{x:39,y:-120});
   check(t.action('bucket:water',{x:9,y:-55}),'pour grid off');check(t.volume('water')===4&&t.buckets.bucket===1,'pour returns reusable bucket');
   const water=[...t.liquid.values()].filter(r=>r.kind==='water');check(water.length===4&&water.every(r=>[0,1].includes(r.x)&&[-4,-3].includes(r.y)&&r.a===1),'pour uses enclosing world grid square');
   t.liquid.clear();for(let x=0;x<8;x++)t.seed(x,-8,'lava',.5);
   check(t.action('bucket',{x:8,y:-120}),'connected partial cells fill a bucket');check(t.volume()===0&&t.buckets['bucket:lava']===1,'partial collection conserves volume and lava type');
   check(t.action('bucket:lava',{x:-99,y:-199}),'negative grid pour');check(t.volume('lava')===4,'lava volume restored');
   t.liquid.clear();t.seed(0,-8,'water',1);t.seed(1,-8,'lava',3);unchanged('bucket',{x:8,y:-120});
   t.liquid.clear();t.seed(0,-8,'water',1);t.seed(4,-8,'water',3);unchanged('bucket',{x:8,y:-120});
   t.liquid.clear();t.grant('bucket:lava');t.building();unchanged('bucket:lava',{x:32,y:-32});
   t.clearWorld();t.seed(0,-8,'water',.1);unchanged('bucket',{x:0,y:-127});
   t.clearWorld();t.grant('bucket:water');t.grant('bucket:lava');
   check(t.action('bucket:water',{x:1,y:-127})&&t.action('bucket:lava',{x:33,y:-127}),'adjacent buckets pour');
   t.react(performance.now());check(t.bodyCount()>0&&t.volume('lava')===0,'poured water and lava retain the obsidian reaction');
   t.clearWorld();for(let x=0;x<4;x++)t.seed(x,-8,'water',1);const mass=t.volume();
   for(let i=0;i<25;i++)t.step('water',i*1000/60);check(Math.abs(t.volume()-mass)<1e-8,'bucket liquid stays conservative through solver steps');
   t.clearWorld();t.buckets.bucket=1;for(let x=0;x<4;x++)t.seed(x,-8,'water',1);t.choose(0,'bucket');t.save();return results;
  });
  console.log('PASS bucket transactions: '+result.length+' volume, capacity, occupancy, partial/mixed/disconnected source and grid assertions');
  await load();assert.equal(await page.evaluate(()=>hotbarTest.volume('water')),4);assert.equal((await state()).buckets.bucket,1);
  await page.evaluate(()=>{hotbarTest.clearWorld();hotbarTest.choose(0,'bucket');for(let x=0;x<4;x++)hotbarTest.seed(x,-8,'water',1);hotbarTest.camera(1.35)});
  let p=await page.evaluate(()=>hotbarTest.screen(8,-120));
  if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
  assert.equal((await state()).tool,'bucket:water');assert.equal(await page.evaluate(()=>hotbarTest.volume('water')),0);
  p=await page.evaluate(()=>hotbarTest.screen(-75,-199));
  if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
  assert.equal((await state()).tool,'bucket');assert.equal(await page.evaluate(()=>hotbarTest.volume('water')),4);
  await page.evaluate(()=>hotbarTest.save());await load();assert.equal(await page.evaluate(()=>hotbarTest.volume('water')),4);assert.equal((await state()).buckets.bucket,1);
  console.log('PASS real '+(mobile?'touch':'mouse')+' bucket collection/pour at 1.35×, negative grid targeting, liquid and inventory reload');
  if(mobile&&engine==='chromium'){
   const cdp=await context.newCDPSession(page),touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
   await page.evaluate(()=>{hotbarTest.clearWorld();hotbarTest.choose(0,'bucket');for(let x=0;x<4;x++)hotbarTest.seed(x,-8,'water',1)});
   p=await page.evaluate(()=>hotbarTest.screen(8,-120));
   const start={x:p.x,y:p.y,id:1},before=await page.evaluate(()=>hotbarTest.snapshot());
   await touch('touchStart',[start]);await touch('touchMove',[{...start,x:p.x+40}]);await touch('touchEnd',[]);
   assert.equal(await page.evaluate(()=>hotbarTest.snapshot()),before);
   await touch('touchStart',[start]);await touch('touchCancel',[]);assert.equal(await page.evaluate(()=>hotbarTest.snapshot()),before);
   await touch('touchStart',[start]);await touch('touchStart',[start,{x:p.x+80,y:p.y,id:2}]);
   await touch('touchMove',[{...start,x:p.x-30},{x:p.x+110,y:p.y,id:2}]);await touch('touchEnd',[]);
   assert.equal(await page.evaluate(()=>hotbarTest.snapshot()),before);assert.ok((await state()).z>1);
   await page.evaluate(()=>hotbarTest.camera(1));p=await page.evaluate(()=>hotbarTest.screen(8,-120));
   await touch('touchStart',[{x:p.x,y:p.y,id:1}]);await page.waitForTimeout(950);
   assert.equal(await page.evaluate(()=>hotbarTest.snapshot()),before);await touch('touchEnd',[]);
   assert.equal((await state()).buckets['bucket:water'],1);assert.equal(await page.evaluate(()=>hotbarTest.volume('water')),0);
   assert.equal(await page.evaluate(()=>getSelection().rangeCount),0);
   const h=await page.locator('#height').boundingBox();await touch('touchStart',[{x:h.x+h.width/2,y:h.y+h.height/2,id:1}]);await page.waitForTimeout(900);await touch('touchEnd',[]);
   assert.equal(await page.evaluate(()=>getSelection().toString()),'');await cdp.detach();
   console.log('PASS real touch hold releases one bucket action; drag, cancel and pinch spend nothing; UI holds never select text');
  }


  // Visible controls and scrollable picker on narrow phones and after rotation.
  await page.evaluate(()=>{hotbarTest.clearWorld();for(const k of ['dirt','wood','leaves','stone','deepslate','obsidian','bucket','bucket:water','bucket:lava'])hotbarTest.grant(k,12);hotbarTest.worker()});
  for(const viewport of mobile?[{width:320,height:568},{width:390,height:844},{width:430,height:932},{width:844,height:390}]:[{width:1100,height:820}]){
   await page.setViewportSize(viewport);await page.evaluate(()=>hotbarTest.open(2));await page.waitForTimeout(100);
   const bounds=await page.evaluate(()=>{const bar=document.getElementById('bar').getBoundingClientRect(),p=document.getElementById('itemPickerV68'),r=p.getBoundingClientRect();return {bar:{left:bar.left,right:bar.right,top:bar.top},picker:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,scroll:p.scrollWidth,width:p.clientWidth},buttons:[...document.querySelectorAll('#bar .slot')].map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height}}),images:[...document.querySelectorAll('#itemPickerV68 img')].map(e=>({w:e.width,h:e.height}))}});
   assert.ok(bounds.bar.left>=0&&bounds.bar.right<=viewport.width);assert.ok(bounds.buttons.every(b=>b.w>=43.9&&b.h>=44));
   assert.ok(bounds.picker.left>=0&&bounds.picker.right<=viewport.width&&bounds.picker.top>=0&&bounds.picker.bottom<=bounds.bar.top-7);assert.ok(bounds.picker.scroll<=bounds.picker.width);
   assert.ok(bounds.images.every(i=>i.w===32&&i.h===32));
   if(process.env.HOTBAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.HOTBAR_SCREENSHOT_DIR,{recursive:true});await page.evaluate(()=>hotbarTest.render());await page.screenshot({path:process.env.HOTBAR_SCREENSHOT_DIR+'/'+engine+'-'+viewport.width+'.png'})}
  }
  if(mobile&&engine==='chromium'){
   const cdp=await context.newCDPSession(page),r=await page.locator('#itemPickerV68').boundingBox();
   await page.locator('#itemPickerV68').evaluate(e=>e.scrollTop=0);
   const x=r.x+r.width/2,y=r.y+r.height-22;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   for(let dy=10;dy<100;dy+=10)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-dy,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.ok(await page.locator('#itemPickerV68').evaluate(e=>e.scrollTop>0));await cdp.detach();
  }
  await page.keyboard.press('Escape');assert.equal(await page.locator('#itemPickerV68').evaluate(e=>e.open),false);assert.equal(await slot(6).evaluate(e=>e===document.activeElement),true);
  // Selection rooted in hidden text is cleared even when mobile reports a fine pointer.
  await page.evaluate(()=>{const hidden=document.getElementById('legacyInventoryV68'),range=document.createRange();range.selectNodeContents(hidden);getSelection().addRange(range)});
  await page.waitForTimeout(50);assert.equal(await page.evaluate(()=>getSelection().toString()),'');
  // WebKit does not emit selectionchange for wholly hidden ranges; exercise the guard explicitly too.
  await page.evaluate(()=>document.dispatchEvent(new Event('selectionchange')));assert.equal(await page.evaluate(()=>getSelection().rangeCount),0);
  assert.equal(await page.locator('html').evaluate(e=>(getComputedStyle(e).userSelect||getComputedStyle(e).webkitUserSelect)),'none');
  await page.keyboard.press('F2');await page.locator('#devGold').fill('123');assert.equal(await page.locator('#devGold').inputValue(),'123');assert.equal(await page.locator('#devGold').evaluate(e=>(getComputedStyle(e).userSelect||getComputedStyle(e).webkitUserSelect)),'text');await page.locator('#devClose').click();
  assert.deepEqual(errors,[]);console.log('PASS six native-size slots, bounded picker, portrait/landscape, hidden text selection guard and editable controls');
  await context.close();
 }
 const migrationContext=await browser.newContext(),migration=await migrationContext.newPage();
 await migration.addInitScript(()=>{
  window.requestAnimationFrame=()=>0;
  if(!sessionStorage.getItem('legacyFixture')){
   localStorage.setItem('skyStack.save.v1',JSON.stringify({v:1,best:30,inv:{wood:7,leaves:8,dirt:9,stone:10,gold:42},placed:[],miners:[],restingMiners:[]}));sessionStorage.setItem('legacyFixture','1');
  }
 });
 await migration.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('restoreDynamicState(initialSave);','restoreDynamicState(initialSave);'+hook)})});
 await migration.goto(url);await migration.waitForFunction(()=>window.hotbarTest,null,{polling:100});
 assert.deepEqual(await migration.evaluate(()=>hotbarTest.state.slots),['wood','leaves','dirt']);
 assert.deepEqual(await migration.evaluate(()=>[hotbarTest.inv.wood,hotbarTest.inv.leaves,hotbarTest.inv.dirt,hotbarTest.inv.stone,hotbarTest.inv.gold]),[7,8,9,10,42]);
 await migration.evaluate(()=>{hotbarTest.buckets['bucket:oil']=2;hotbarTest.choose(1,'bucket:oil');hotbarTest.save()});
 await migration.reload();await migration.waitForFunction(()=>window.hotbarTest,null,{polling:100});
 assert.equal(await migration.evaluate(()=>hotbarTest.state.slots[1]),'bucket:oil');
 assert.equal(await migration.evaluate(()=>hotbarTest.buckets['bucket:oil']),2);
 assert.equal(await migration.evaluate(()=>hotbarTest.action('bucket:oil',{x:0,y:-250})),false);
 assert.equal(await migration.evaluate(()=>hotbarTest.buckets['bucket:oil']),2);
 await migrationContext.close();console.log('PASS legacy inventory migration and safe persistence of future liquid bucket types');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
