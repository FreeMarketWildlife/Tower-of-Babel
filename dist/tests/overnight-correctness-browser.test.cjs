const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:18743/tower-of-babel/';
const hook=`window.overnightCorrectness={
 repeatedDeparture(){const q=createMinerAt(16,-60,{level:1,gold:7}),before=departuresV88.length;const first=fairyDefeatV75(q,'stab'),stale=fairyDefeatV75(q,'stab'),missing=fairyDefeatV75(undefined,'stab');return {first,stale,missing,departures:departuresV88.length-before}},
 collisionWake(){
  const q=createMinerAt(16,-12,{level:1});Body.setStatic(q,true);q.collisionFilter.mask=0;
  Matter.Detector.setBodies(eng.detector,Matter.Composite.allBodies(eng.world));Matter.Detector.collisions(eng.detector);
  Body.setStatic(q,false);q.collisionFilter.mask=0xFFFFFFFF;Body.setPosition(q,{x:16,y:-8});
  const ids=cs=>cs.map(c=>[c.bodyA.id,c.bodyB.id].sort((a,b)=>a-b).join(':')).sort();
  const actual=ids(Matter.Detector.collisions(eng.detector)),expected=ids(detectorBeforeV87(eng.detector));
  miners.delete(q);World.remove(eng.world,q);return{actual,expected};
 },
 actorTeleport(){
  const q=createMinerAt(16,-300,{level:1});Matter.Detector.setBodies(eng.detector,Matter.Composite.allBodies(eng.world));Matter.Detector.collisions(eng.detector);
  Body.setPosition(q,{x:16,y:-8});
  const ids=cs=>cs.map(c=>[c.bodyA.id,c.bodyB.id].sort((a,b)=>a-b).join(':')).sort();
  const actual=ids(Matter.Detector.collisions(eng.detector)),expected=ids(detectorBeforeV87(eng.detector));
  miners.delete(q);World.remove(eng.world,q);return{actual,expected};
 },
 get input(){return {gesture:!!gesture,pointers:pointers.size,touches:pinchTouchesV26.size,consumed:pinchConsumedV26.size,pinch:!!pinchStateV26,pending:!!pickPendingV49}},
 get camera(){return {...cam}},
 move(){stopPointerV52();tool='move'},
 point(){return {x:W/2,y:HH/2}},
 lostCapture(){c.dispatchEvent(new PointerEvent('lostpointercapture',{pointerId:71,pointerType:'touch',bubbles:true}))}
};`;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.route('**/game-v87-performance.txt*',async r=>{const response=await r.fetch();await r.fulfill({response,body:await response.text()+'\n'+hook})});
  await page.goto(base);await page.waitForFunction(()=>window.overnightCorrectness&&window.__buttonwood,null,{polling:100});
  const failures=[];
  assert.deepEqual(await page.evaluate(()=>overnightCorrectness.repeatedDeparture()),{first:true,stale:false,missing:false,departures:1});
  console.log('PASS departure idempotence and missing Worker rejection');
  for(const test of ['collisionWake','actorTeleport']){
   const result=await page.evaluate(test=>overnightCorrectness[test](),test);
   try{assert(result.expected.length>0,'fixture must overlap real terrain');assert.deepEqual(result.actual,result.expected);console.log('PASS',test)}catch(e){failures.push(test+': '+e.message)}
  }
  const empty={gesture:false,pointers:0,touches:0,consumed:0,pinch:false,pending:false};
  const touch=async(type,id,x,y)=>page.locator('#game').dispatchEvent(type,{pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,bubbles:true,cancelable:true});
  for(const interruption of ['blur','hidden','lostCapture']){
   await page.evaluate(()=>overnightCorrectness.move());const p=await page.evaluate(()=>overnightCorrectness.point());
   await touch('pointerdown',71,p.x-40,p.y);await touch('pointerdown',72,p.x+40,p.y);assert.equal((await page.evaluate(()=>overnightCorrectness.input)).pinch,true);
   await page.evaluate(kind=>{if(kind==='blur')window.dispatchEvent(new Event('blur'));else if(kind==='hidden'){Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))}else overnightCorrectness.lostCapture()},interruption);
   try{assert.deepEqual(await page.evaluate(()=>overnightCorrectness.input),empty);console.log('PASS pinch cancellation on',interruption)}catch(e){failures.push(interruption+': '+e.message)}
   // A fresh finger must start one gesture, rather than joining an interrupted pinch.
   await page.evaluate(()=>overnightCorrectness.move());await touch('pointerdown',73,p.x,p.y);
   try{assert.equal((await page.evaluate(()=>overnightCorrectness.input)).pinch,false)}catch(e){failures.push(interruption+' fresh touch: '+e.message)}
   await touch('pointerup',73,p.x,p.y);await touch('pointerup',71,p.x-40,p.y);await touch('pointerup',72,p.x+40,p.y);
  }
  await page.evaluate(()=>overnightCorrectness.move());await page.mouse.move(600,350);await page.mouse.down();assert.equal((await page.evaluate(()=>overnightCorrectness.input)).gesture,true);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  try{assert.deepEqual(await page.evaluate(()=>overnightCorrectness.input),empty);console.log('PASS Move cancellation on blur')}catch(e){failures.push('Move blur: '+e.message)}await page.mouse.up();
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
