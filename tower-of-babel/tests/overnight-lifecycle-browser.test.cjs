const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:18743/tower-of-babel/';
const hook=`window.lifecycleTest={
 input(){return {gesture:!!gesture,pointers:pointers.size,touches:pinchTouchesV26.size,consumed:pinchConsumedV26.size,pinch:!!pinchStateV26,pending:!!pickPendingV49}},
 move(){stopPointerV52();tool='move'},
 wakeCycles(cycles=300){
  const workers=[],homes=[];for(let i=0;i<6;i++){const h={id:++structureIdV46,type:'home',x:640+i*160,y:-124,stock:{},job:null,auto:false,paused:false};structuresV46.push(h);addStructureBodyV47(h);homes.push(h);for(let n=0;n<2;n++){const q=createMinerAt(h.x-16,-12,{id:70000+i*2+n,level:1,gold:n+2});workers.push(q);familyV55(q.game.id).home=h.id}}
  const masses=workers.map(q=>q.mass),ids=cs=>cs.map(c=>[c.bodyA.id,c.bodyB.id].sort((a,b)=>a-b).join(':')).sort().join(','),check=()=>{const actual=ids(Matter.Detector.collisions(eng.detector)),expected=ids(detectorBeforeV87(eng.detector));if(actual!==expected)throw new Error('collision parity');return expected?expected.split(',').length:0};let contacts=0;
  for(let i=0;i<cycles;i++){
   settlementV55.phase='night';for(let n=0;n<workers.length;n++){sleepWorkerV56(workers[n],homes[n>>1]);sleepWorkerV56(workers[n],homes[n>>1])}Engine.update(eng,16.67);check();
   settlementV55.phase='day';for(const q of workers){wakeWorkerV55(q);wakeWorkerV55(q)}contacts+=check();Engine.update(eng,16.67);check();
   for(let n=0;n<workers.length;n++){const q=workers[n];if(q.isStatic||q.game.sleepingV55||q.mass!==masses[n]||![q.position.x,q.position.y,q.velocity.x,q.velocity.y].every(Number.isFinite))throw new Error('Worker mass/state at cycle '+i)}
  }
  return {cycles,workers:workers.length,contacts,worldBodies:Matter.Composite.allBodies(eng.world).length};
 },
 cancelCycles(cycles=300){const initial=JSON.stringify(inv);for(let i=0;i<cycles;i++){tool='move';for(const [id,x]of [[71,450],[72,550]])c.dispatchEvent(new PointerEvent('pointerdown',{pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:350,bubbles:true,cancelable:true}));pickPendingV49=[{}];if(i%3===0)window.dispatchEvent(new Event('blur'));else if(i%3===1)c.dispatchEvent(new PointerEvent('lostpointercapture',{pointerId:71,pointerType:'touch',bubbles:true}));else interruptInputV52();const s=this.input();if(s.gesture||s.pointers||s.touches||s.consumed||s.pinch||s.pending)throw new Error('input leak '+i);for(const id of [71,72])c.dispatchEvent(new PointerEvent('pointerup',{pointerId:id,pointerType:'touch',button:0,clientX:500,clientY:350,bubbles:true,cancelable:true}))}if(JSON.stringify(inv)!==initial)throw new Error('cancelled input changed inventory');return {cycles,state:this.input()}},
 seed(){for(const q of [...miners]){miners.delete(q);World.remove(eng.world,q)}restingMiners.length=0;familiesV55.clear();childrenV55=[];best=47;Object.assign(inv,{dirt:77,wood:39,gold:23});const h={id:++structureIdV46,type:'home',x:1120,y:-128,stock:{},job:null,auto:false,paused:false};structuresV46.push(h);addStructureBodyV47(h);const q=createMinerAt(h.x-16,-12,{id:79001,level:2,gold:9});familyV55(q.game.id).home=h.id;settlementV55.phase='night';settlementV55.elapsed=30000;sleepWorkerV56(q,h);playerCraftV61={type:'home',remaining:731};for(const [x,kind]of [[4,'water'],[6,'oil'],[8,'lava']])liquidSubV22.set(liquidSubKeyV22(x,-10),{x,y:-10,kind,a:.75});ui();saveGame();return this.snapshot()},
 snapshot(){const q=[...miners].find(q=>q.game.id===79001);return {key:SAVE_KEY,best,inventory:{dirt:inv.dirt,wood:inv.wood,bells:inv.gold},worker:q?{id:q.game.id,level:q.game.level,bells:q.game.gold,sleeping:q.game.sleepingV55,static:q.isStatic,mass:Number.isFinite(q.mass)?q.mass:'static',returnTo:q.game.sleepReturnV55}:null,craft:playerCraftV61,clock:{...settlementV55},liquids:[4,6,8].map(x=>{const r=liquidSubRecV22(x,-10);return r&&{x:r.x,y:r.y,kind:r.kind,amount:r.a}})}},
 wake(){settlementV55.phase='day';const q=[...miners].find(q=>q.game.id===79001);wakeWorkerV55(q);Engine.update(eng,16.67);return {mass:q.mass,finite:[q.position.x,q.position.y,q.velocity.x,q.velocity.y].every(Number.isFinite)}},
 get key(){return SAVE_KEY},hasFixture(){return [...miners].some(q=>q.game.id===79001)}
};`;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results={};
 try{
  const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.route('**/game-v87-performance.txt*',async r=>{const response=await r.fetch();await r.fulfill({response,body:await response.text()+'\n'+hook})});
  const load=async query=>{await page.goto(base+query);await page.waitForFunction(()=>window.lifecycleTest&&window.__buttonwood,null,{polling:100})};await load('');
  results.wake=await page.evaluate(()=>lifecycleTest.wakeCycles());assert(results.wake.contacts>0);results.input=await page.evaluate(()=>lifecycleTest.cancelCycles());
  for(let i=0;i<40;i++){await page.evaluate(()=>lifecycleTest.move());await page.mouse.move(520,350);await page.mouse.down();await page.mouse.move(521,350);assert.equal((await page.evaluate(()=>lifecycleTest.input())).gesture,true);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.deepEqual(await page.evaluate(()=>lifecycleTest.input()),{gesture:false,pointers:0,touches:0,consumed:0,pinch:false,pending:false});await page.mouse.up()}
  console.log('PASS 3,600 Worker sleep/wake pairs with duplicate calls, exact Matter collision parity, finite mass; 300 pinch cancellations and 40 real mouse captures');
  const keys=['skyStack.save.v1','tower.buttonwood.sample.v1','tower.sound.demo.v1','tower.moonfire.survival-demo.v2'];results.saves=[];
  for(const query of ['', '?sample=buttonwood','?demo=sound','?demo=moonfire']){
   await load(query);const before=await page.evaluate(()=>lifecycleTest.seed());
   for(let n=0;n<3;n++){await page.reload();await page.waitForFunction(()=>window.lifecycleTest&&window.__buttonwood,null,{polling:100});assert.deepEqual(await page.evaluate(()=>lifecycleTest.snapshot()),before)}
   const wake=await page.evaluate(()=>lifecycleTest.wake());assert(wake.mass>0&&Number.isFinite(wake.mass)&&wake.finite);
   await page.evaluate(({keys,own})=>{for(const key of keys)if(key!==own)localStorage.setItem(key,'untouched:'+key)},{keys,own:before.key});
   await page.keyboard.press('Escape');if(!await page.evaluate(()=>skyStackPause.state.paused))await page.keyboard.press('Escape');await page.locator('#pauseOptionsV76').click();await page.locator('#restartWorld').click();await page.locator('#restartAgree').check();
   await Promise.all([page.waitForNavigation(),page.locator('#restartConfirm').click()]);await page.waitForFunction(()=>window.lifecycleTest&&window.__buttonwood,null,{polling:100});assert.equal(await page.evaluate(()=>lifecycleTest.hasFixture()),false);
   for(const key of keys.filter(k=>k!==before.key))assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),'untouched:'+key);
   results.saves.push({query,key:before.key,reloads:3,restart:true});
  }
  assert.deepEqual(errors,[]);results.errors=errors;console.log('PASS twelve sleeping-Worker/crafting/liquid/inventory reloads, finite dawn release and four real restarts with save-slot isolation');
  if(process.env.SKY_LIFECYCLE_OUTPUT)fs.writeFileSync(process.env.SKY_LIFECYCLE_OUTPUT,JSON.stringify(results,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
