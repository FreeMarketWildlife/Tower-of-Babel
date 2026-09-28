'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.SKY_TEST_URL||'http://127.0.0.1:8793/tower-of-babel/';
const hook=`window.wildlifeTest={
 inv,screen:w2s,ui,save:saveGame,choose:chooseItemV68,defs:CAGES_V71,
 get state(){return {...skyStackWildlife.state,tool,bag:{...structureBagV46},job:playerCraftV61,terrain:[...grid.keys()] }},
 fresh(){for(const d of document.querySelectorAll('dialog[open]'))d.close();stopPointerV52();World.clear(eng.world,false);Engine.clear(eng);bs.clear();grid.clear();miners.clear();structureBodiesV47.clear();structuresV46.length=0;liquidSubV22.clear();wildlifeV71=[];wildlifeHabitatsV71=new Set([...generated]);wildlifeClockV71=0;wildlifeNextIdV71=0;for(const k of Object.keys(bucketBagV68))delete bucketBagV68[k];for(const k of Object.keys(structureBagV46))structureBagV46[k]=0;for(const k of Object.keys(inv))inv[k]=0;hotbarItemsV68.fill(null);seenItemsV68.clear();playerCraftV61=null;tool='pick';hotbarIndexV68=0;Object.assign(cam,{x:64,y:-130,z:1,anim:false});cameraSpringActiveV24=false;for(let x=-20;x<31;x++)mk(ctr(x),ctr(0),'dirt',{terrain:true,static:true,cx:x,cy:0});Object.assign(settlementV55,{day:1,phase:'day',elapsed:90000});ui()},
 spawn(species,x=-100,y=-80){const a=wildlifeNewV71(species,{x,y});wildlifeV71.push(a);return a.id},
 grant(item,n=1){if(isBucketV68(item))bucketBagV68[item]=(bucketBagV68[item]||0)+n;else inv[item]=(inv[item]||0)+n;ui()},
 select(item){if(item==='pick'||item==='move'){tool=item;ui()}else chooseItemV68(0,item)},
 render(){ctx.setTransform(DPR,0,0,DPR,0,0);bg();for(const z of bs)draw(z);drawMappedLiquids(performance.now());drawGoldBursts(performance.now())},
 cage(type,x=0){structureBagV46[type]++;return placeStructureV46({type,x,y:-CAGES_V71[type].h*B})},
 openStructures:openStructuresV48,
 setNight(night){settlementV55.phase=night?'night':'day';settlementV55.elapsed=night?15000:90000},
 seedPlains(){wildlifeV71=[];let x=0;for(let i=1;i<80;i++){const r=ButtonwoodBiomes.regionAt(skySeedV62,i*1024);if(r.id==='plains'){x=(r.start+r.end)/2;break}}cam.x=x;const ch=Math.floor(x/(24*B));generated.add(ch);wildlifeHabitatsV71.delete(ch);seedWildlifeV71();return ButtonwoodBiomes.biomeAt(skySeedV62,x)},
 get sounds(){return wildlifeSoundCalls},get counts(){return {world:wildlifeV71.length,captive:structuresV46.reduce((n,b)=>n+cageAnimalsV71(b).length,0),buckets:Object.entries(bucketBagV68).filter(([k])=>animalKindV71(k)).reduce((n,[,v])=>n+v,0),empty:bucketBagV68.bucket||0}}
};
const wildlifeSoundCalls=[];const animalSoundReal=SkyAudio.animalSound;SkyAudio.animalSound=function(...args){wildlifeSoundCalls.push(args);return animalSoundReal.apply(this,args)};
`;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1100,height:820},hasTouch:mobile,isMobile:mobile}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('restoreDynamicState(initialSave);','restoreDynamicState(initialSave);'+hook)})});
  const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.wildlifeTest,null,{polling:100})};
  await load();assert.ok(await page.evaluate(()=>skyStackWildlife.state.animals.length>0),'legacy/new worlds gain wildlife');
  if(!mobile){
   assert.equal(await page.evaluate(()=>wildlifeTest.seedPlains()),'plains');
   const nocturnal=await page.evaluate(()=>{wildlifeTest.setNight(false);return skyStackWildlife.state.animals.filter(a=>a.species==='firefly')});
   assert.ok(nocturnal.length>=3&&nocturnal.every(a=>a.nocturnal&&!a.visible),'plains fireflies rest by day');
   await page.evaluate(()=>wildlifeTest.setNight(true));assert.ok(await page.evaluate(()=>skyStackWildlife.state.animals.filter(a=>a.species==='firefly').every(a=>a.visible)),'plains fireflies emerge at night');
   await page.evaluate(()=>{const a=skyStackWildlife.state.animals.find(a=>a.species==='firefly');wildlifeTest.grant('bucket');if(!skyStackWildlife.bucket('bucket',{x:a.x,y:a.y-2}))throw Error('night firefly capture');if(!skyStackWildlife.bucket('bucket:firefly',{x:a.x,y:-100}))throw Error('firefly release');wildlifeTest.setNight(false);if(!skyStackWildlife.state.animals.find(a=>a.species==='firefly'&&!a.nocturnal)?.visible)throw Error('collected firefly hidden by day')});
   const count=await page.evaluate(()=>{skyStackWildlife.seed();return skyStackWildlife.state.animals.length});await page.evaluate(()=>skyStackWildlife.seed());assert.equal(await page.evaluate(()=>skyStackWildlife.state.animals.length),count,'revisiting habitats never duplicates animals');
   await page.evaluate(()=>wildlifeTest.save());await load();
   const restoredNightIds=await page.evaluate(()=>skyStackWildlife.state.animals.filter(a=>a.nocturnal).map(a=>a.id));
   assert.ok(!restoredNightIds.includes(nocturnal[0].id)&&nocturnal.slice(1).every(a=>restoredNightIds.filter(id=>id===a.id).length===1),'nighttime identity survives save without replacing captured fireflies');
   const largeSaveIds=await page.evaluate(()=>{wildlifeTest.fresh();const ids=[];for(let i=0;i<700;i++)ids.push(wildlifeTest.spawn('worm',i*5,40));wildlifeTest.save();return ids});await load();
   const restoredLargeIds=await page.evaluate(()=>skyStackWildlife.state.animals.filter(a=>a.species==='worm').map(a=>a.id));
   assert.ok(largeSaveIds.every(id=>restoredLargeIds.filter(actual=>actual===id).length===1),'large legitimate animal saves are never truncated');
   console.log('PASS nocturnal plains fireflies, daylight visibility after release, finite habitats and 700-animal save roundtrip');
  }
  await page.evaluate(()=>wildlifeTest.fresh());
  const tap=async p=>mobile?page.touchscreen.tap(p.x,p.y):page.mouse.click(p.x,p.y);
  for(const species of ['bird','butterfly','worm','mole','rabbit','firefly']){
   await page.evaluate(species=>{wildlifeTest.spawn(species);wildlifeTest.select('pick')},species);
   let p=await page.evaluate(()=>wildlifeTest.screen(-100,-85));await tap(p);
   assert.equal(await page.evaluate(()=>wildlifeTest.sounds.at(-1)?.[0]),species,'tap sound '+species);
   const terrain=await page.evaluate(()=>wildlifeTest.state.terrain);
   await page.evaluate(()=>{wildlifeTest.grant('bucket');wildlifeTest.select('bucket')});await tap(p);
   assert.equal(await page.evaluate(()=>wildlifeTest.state.tool),'bucket:'+species);
   assert.equal(await page.evaluate(()=>wildlifeTest.counts.world),0);
   p=await page.evaluate(()=>wildlifeTest.screen(-40,-90));await tap(p);
   assert.equal(await page.evaluate(()=>wildlifeTest.state.tool),'bucket');
   assert.equal(await page.evaluate(()=>wildlifeTest.counts.world),1);
   assert.deepEqual(await page.evaluate(()=>wildlifeTest.state.terrain),terrain,'animal interactions never dig terrain');
   // Put this animal back in a bucket for the cage tests.
   assert.equal(await page.evaluate(()=>{const a=skyStackWildlife.state.animals[0];return skyStackWildlife.bucket('bucket',{x:a.x,y:a.y-4})}),true);
  }
  assert.equal(await page.evaluate(()=>wildlifeTest.counts.buckets),6);
  console.log('PASS '+(mobile?'touch':'mouse')+' six species tap/capture/release and soil preservation');
  const recipes=await page.evaluate(()=>{
   const out=[];for(const [type,d]of Object.entries(wildlifeTest.defs)){
    for(const k of Object.keys(d.cost))wildlifeTest.inv[k]=0;
    const before=JSON.stringify(wildlifeTest.inv);if(skyStackWildlife.craft(type)||JSON.stringify(wildlifeTest.inv)!==before)throw Error('unaffordable cage spent resources');
    for(const [k,n]of Object.entries(d.cost))wildlifeTest.inv[k]=n;
    if(!skyStackWildlife.craft(type))throw Error('craft '+type);
    if(Object.keys(d.cost).some(k=>wildlifeTest.inv[k]!==0))throw Error('wrong cost');
    skyStackWildlife.step(750);if(wildlifeTest.state.bag[type])throw Error('instant cage');
    skyStackWildlife.step(750);if(wildlifeTest.state.bag[type]!==1)throw Error('missing cage');out.push(type);
   }return out;
  });assert.equal(recipes.length,3);
  await page.evaluate(()=>{wildlifeTest.cage('cageSmall',0);wildlifeTest.cage('cageMedium',96);wildlifeTest.cage('cageLarge',256)});
  const cageChecks=await page.evaluate(()=>{
   const cages=skyStackWildlife.state.cages,small=cages[0],p={x:small.x+32,y:small.y+32},before=wildlifeTest.counts;
   if(!skyStackWildlife.bucket('bucket:bird',p))throw Error('bird into cage');
   const snap=JSON.stringify(wildlifeTest.state);if(skyStackWildlife.bucket('bucket:mole',p)||JSON.stringify(wildlifeTest.state)!==snap)throw Error('full cage not pure');
   if(skyStackWildlife.pack(small.id))throw Error('packed occupied cage');
   if(!skyStackWildlife.bucket('bucket',p))throw Error('take from cage');
   if(!skyStackWildlife.bucket('bucket:bird',p))throw Error('return to cage');
   for(const species of ['butterfly','worm','mole'])if(!skyStackWildlife.bucket('bucket:'+species,{x:cages[1].x+40,y:cages[1].y+32}))throw Error('medium '+species);
   for(const species of ['rabbit','firefly'])if(!skyStackWildlife.bucket('bucket:'+species,{x:cages[2].x+50,y:cages[2].y+32}))throw Error('large '+species);
   const after=wildlifeTest.counts;if(before.world+before.captive+before.buckets!==after.world+after.captive+after.buckets)throw Error('animals not conserved');
   wildlifeTest.save();return skyStackWildlife.state.cages.map(c=>({type:c.type,capacity:c.capacity,species:c.animals.map(a=>a.species)}));
  });
  await load();assert.deepEqual(await page.evaluate(()=>skyStackWildlife.state.cages.map(c=>({type:c.type,capacity:c.capacity,species:c.animals.map(a=>a.species)}))),cageChecks);
  // Crafting progress and real balances survive reload separately from wildlife.
  await page.evaluate(()=>{wildlifeTest.grant('wood',5);wildlifeTest.grant('ironIngot',2);skyStackWildlife.craft('cageSmall');skyStackWildlife.step(500);wildlifeTest.save()});await load();
  assert.equal(await page.evaluate(()=>wildlifeTest.state.job.remaining),1000);
  await page.evaluate(()=>{skyStackWildlife.step(1000);wildlifeTest.ui()});
  console.log('PASS all cage recipes, full-cage rejection, animal conservation, occupied packing guard, cage/bucket reload and partial craft save');
  const large=await page.evaluate(()=>skyStackWildlife.state.cages.find(c=>c.type==='cageLarge').id);
  for(const viewport of mobile?[{width:320,height:568},{width:390,height:844},{width:430,height:932},{width:844,height:390}]:[{width:1100,height:820}]){
   await page.setViewportSize(viewport);await page.evaluate(id=>skyStackWildlife.open(id),large);
   const bounds=await page.locator('#cagePanelV71').evaluate(p=>{const r=p.getBoundingClientRect(),bar=document.getElementById('bar').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,bar:bar.top,overflow:p.scrollWidth>p.clientWidth,modal:p.matches(':modal'),native:[...p.querySelectorAll('img')].every(i=>i.width===32&&i.height===32)}});
   assert.ok(bounds.left>=0&&bounds.right<=viewport.width&&bounds.top>=0&&bounds.bottom<=bounds.bar&& !bounds.overflow&&!bounds.modal&&bounds.native,'attached cage fits '+JSON.stringify({viewport,bounds}));
   if(process.env.WILDLIFE_SCREENSHOT_DIR){fs.mkdirSync(process.env.WILDLIFE_SCREENSHOT_DIR,{recursive:true});await page.evaluate(()=>wildlifeTest.render());await page.screenshot({path:process.env.WILDLIFE_SCREENSHOT_DIR+'/cage-'+viewport.width+'.png'})}
   await page.keyboard.press('Escape');assert.equal(await page.locator('#structuresOpen').evaluate(e=>e===document.activeElement),true);
  }
  if(mobile){
   await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{wildlifeTest.fresh();wildlifeTest.spawn('mole');wildlifeTest.grant('bucket');wildlifeTest.select('bucket')});
   const p=await page.evaluate(()=>wildlifeTest.screen(-100,-85)),cdp=await context.newCDPSession(page),before=await page.evaluate(()=>JSON.stringify(wildlifeTest.state));
   const touch=(type,points=[])=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
   await touch('touchStart',[{x:p.x,y:p.y,id:1}]);await touch('touchMove',[{x:p.x+40,y:p.y,id:1}]);await touch('touchEnd');
   assert.equal(await page.evaluate(()=>JSON.stringify(wildlifeTest.state)),before,'drag does not catch animal');
   await touch('touchStart',[{x:p.x,y:p.y,id:1}]);await touch('touchCancel');assert.equal(await page.evaluate(()=>JSON.stringify(wildlifeTest.state)),before,'cancel does not catch animal');
   await touch('touchStart',[{x:p.x,y:p.y,id:1}]);await touch('touchStart',[{x:p.x,y:p.y,id:1},{x:p.x+80,y:p.y,id:2}]);await touch('touchMove',[{x:p.x-20,y:p.y,id:1},{x:p.x+100,y:p.y,id:2}]);await touch('touchEnd');
   assert.equal(await page.evaluate(()=>wildlifeTest.counts.world),1,'pinch does not catch animal');assert.equal(await page.evaluate(()=>wildlifeTest.state.buckets.bucket),1);await cdp.detach();
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS cage desktop/phone bounds, native icons, keyboard focus, touch drag/cancel/pinch and no runtime errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
