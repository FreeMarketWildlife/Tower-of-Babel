const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.SKY_TEST_BROWSER?{executablePath:process.env.SKY_TEST_BROWSER}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:760},hasTouch:true}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.route('**/game-v8-part3.txt*',async route=>{
   const response=await route.fetch(),source=await response.text();
   await route.fulfill({response,body:source.replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.buildingPickTest={
    setup(selected='pick',zoom=1){
     stopPointerV52();for(const panel of document.querySelectorAll('dialog[open]'))panel.close();
     pinchTouchesV26.clear();pinchConsumedV26.clear();pinchStateV26=null;if(typeof wildlifeV71!=='undefined')wildlifeV71=[];
     World.clear(eng.world,false);Engine.clear(eng);bs.clear();grid.clear();miners.clear();structuresV46=[];structureBodiesV47.clear();removedTerrain.clear();terrainDamage.clear();
     for(let x=-8;x<12;x++)mk(ctr(x),ctr(0),'dirt',{terrain:true,static:true,cx:x,cy:0});
     structureBagV46.workshop=1;if(!placeStructureV46({type:'workshop',x:0,y:-128}))throw Error('Workshop fixture failed');
     Object.assign(cam,{x:64,y:-90,z:zoom,anim:false});cameraSpringActiveV24=false;cameraDragRawYV24=NaN;tool=selected;pickaxeTier=0;ui();
     return w2s(64,-64);
    },
    get state(){return {x:cam.x,y:cam.y,z:cam.z,press:!!buildingPressV46,gesture:gesture?{t:gesture.t,moved:gesture.moved}:null,pinching:!!pinchStateV26,touches:pinchTouchesV26.size,open:$('buildingPanel').open,damage:[...bs].reduce((n,z)=>n+z.game.hits,0)}},
    releaseCapture(){const g=buildingPressV46||gesture;if(g)c.releasePointerCapture(g.id)}
   };`)});
  });
  await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:8775/tower-of-babel/');
  await page.waitForFunction(()=>window.buildingPickTest,null,{polling:100});
  const setup=async(tool='pick',zoom=1)=>page.evaluate(({tool,zoom})=>buildingPickTest.setup(tool,zoom),{tool,zoom});
  const state=()=>page.evaluate(()=>buildingPickTest.state);
  for(const tool of ['pick','move']){
   let p=await setup(tool);await page.mouse.click(p.x,p.y);assert.equal((await state()).open,true,tool+' building tap');
   p=await setup(tool,1.35);const before=await state();
   await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+4,p.y+2);assert.equal((await state()).press,true);
   await page.mouse.move(p.x+40,p.y+10);assert.deepEqual((await state()).gesture,{t:'move',moved:true});
   await page.mouse.move(p.x+120,p.y+20);await page.mouse.up();const after=await state();
   assert.ok(Math.abs(after.x-(before.x-120/1.35))<.001,'Drag retained entire initial displacement');
   assert.ok(Math.abs(after.y-(before.y-20/1.35))<.001,'Building drag respects zoom');
   assert.deepEqual([after.open,after.press,after.gesture,after.damage],[false,false,null,0]);
  }
  console.log('PASS pickaxe/Hand building taps and zoom-correct drags without mining or menus');

  const cdp=await page.context().newCDPSession(page),touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
  let p=await setup();await touch('touchStart',[{...p,id:1}]);await touch('touchEnd',[]);assert.equal((await state()).open,true);
  p=await setup();const before=await state();await touch('touchStart',[{...p,id:1}]);await touch('touchMove',[{x:p.x+80,y:p.y,id:1}]);await touch('touchEnd',[]);
  assert.equal((await state()).x,before.x-80);assert.equal((await state()).open,false);assert.equal((await state()).touches,0);
  for(const tool of ['pick','move']){
   p=await setup(tool);await touch('touchStart',[{...p,id:1}]);assert.equal((await state()).press,true);
   await touch('touchStart',[{...p,id:1},{x:p.x+40,y:p.y,id:2}]);assert.equal((await state()).pinching,true);assert.equal((await state()).press,false);
   await touch('touchMove',[{x:p.x-20,y:p.y,id:1},{x:p.x+60,y:p.y,id:2}]);assert.ok((await state()).z>1);
   await touch('touchEnd',[{x:p.x-20,y:p.y,id:1}]);await touch('touchMove',[{x:p.x+20,y:p.y,id:1}]);await touch('touchEnd',[]);
   const after=await state();assert.deepEqual([after.open,after.press,after.gesture,after.pinching,after.touches,after.damage],[false,false,null,false,0,0]);
  }
  console.log('PASS touch building tap/pan and two-finger zoom without a trailing tap');

  p=await setup();await touch('touchStart',[{...p,id:1}]);await touch('touchCancel',[]);assert.deepEqual([(await state()).press,(await state()).touches],[false,0]);
  p=await setup();await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+1,p.y);await page.evaluate(()=>buildingPickTest.releaseCapture());await page.mouse.move(p.x+2,p.y);await page.mouse.up();assert.deepEqual([(await state()).press,(await state()).open],[false,false]);
  p=await setup();await page.mouse.move(p.x,p.y);await page.mouse.down();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();assert.deepEqual([(await state()).press,(await state()).open],[false,false]);
  for(const loss of ['capture','blur']){
   p=await setup();await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+40,p.y);assert.ok((await state()).gesture);
   await page.evaluate(loss=>loss==='capture'?buildingPickTest.releaseCapture():window.dispatchEvent(new Event('blur')),loss);
   await page.mouse.move(p.x+42,p.y);const stopped=await state();assert.equal(stopped.gesture,null);
   await page.mouse.move(p.x+80,p.y);await page.mouse.up();assert.equal((await state()).x,stopped.x);assert.equal((await state()).open,false);
  }
  p=await setup();await touch('touchStart',[{...p,id:1}]);await touch('touchMove',[{x:p.x+40,y:p.y,id:1}]);await touch('touchCancel',[]);assert.deepEqual([(await state()).gesture,(await state()).touches],[null,0]);
  assert.deepEqual(errors,[]);console.log('PASS building press cancellation, lost capture, focus loss, and no runtime errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
