// Production Matter/Worker traces; RAF and wall time are controlled only in this fixture.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:18743/tower-of-babel/';
const hook=`window.schedulingTest={
 prepare(){
  SkyAudio.rhythm=()=>({ready:false});stopPointerV52();resetKeyboardV52();
  World.clear(eng.world,false);Engine.clear(eng);bs.clear();grid.clear();miners.clear();liquidSubV22.clear();liquidSubFlowV22.clear();liquidSubImpactV22.clear();
  removedTerrain.clear();terrainDamage.clear();restingMiners.length=0;minerGhostsV42.clear();familiesV55.clear();childrenV55=[];structuresV46=[];structureBodiesV47.clear();treeBlocksV41.clear();wildlifeV71=[];
  for(const k in inv)inv[k]=0;best=30;settlementV55={day:1,phase:'day',elapsed:0};
  liquidClockV29=treeLastTickV41=spiritLastTickV42=industryTickV44=structureLastV46=lastWorkerTickV55=settlementLastV56=null;liquidAccumulatorV29=liquidStepsV29=0;
  if(typeof resetSimulationV24==='function')resetSimulationV24();
  cam.x=0;cam.y=20;cam.z=1;cam.anim=false;ensureWorld=()=>{};cameraTickV24=()=>{};progress=()=>{};bg=draw=drawMiner=drawMappedLiquids=drawGoldBursts=preview=()=>{};terrainExposed=()=>true;
  for(let x=-304;x<=400;x+=32)mk(x,80,'bedrock',{static:true,w:32,h:32});
  mk(16,48,'dirt',{static:true,terrain:true,cx:0,cy:1});mk(48,48,'bedrock',{static:true,w:32,h:32});mk(112,48,'dirt',{static:true,terrain:true,cx:3,cy:1});mk(-112,48,'stone',{static:true,terrain:true,cx:-4,cy:1});
  this.worker=createMinerAt(16,19,{id:80001,level:2,gold:3,dir:1});this.falling=mk(240,-160,'wood',{placed:true});
  for(let x=14;x<18;x++)liquidSubPutV22(x,-4,'water',1);
  playerCraftV61={type:'home',remaining:1500};const egg={id:++critterNextEggV73,species:'wood-mouse',x:320,y:0,remaining:30000};critterEggsV73.push(egg);this.egg=egg;
  this.trace=[];this.deltas=[];const update=Engine.update;Engine.update=(e,dt)=>{this.deltas.push(dt);return update(e,dt)};
  const workers=updateMiners;updateMiners=now=>{workers(now);this.trace.push(this.snapshot())};
 },
 frame(raw){window.schedulingWall=raw;loop()},
 snapshot(){const q=this.worker,z=this.falling;return {physics:eng.timing.timestamp,worker:{x:q.position.x,y:q.position.y,vx:q.velocity.x,vy:q.velocity.y,state:q.game.aiState,water:q.game.waterMsV42,fire:q.game.fireMsV42,alive:miners.has(q)},falling:{x:z.position.x,y:z.position.y,vx:z.velocity.x,vy:z.velocity.y},clock:{...settlementV55},craft:playerCraftV61&&{...playerCraftV61},homes:structureBagV46.home,egg:this.egg.remaining,inventory:{dirt:inv.dirt,stone:inv.stone,bells:inv.gold},liquids:[...liquidSubV22.values()].map(r=>[r.x,r.y,r.kind,r.a]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2].localeCompare(b[2]))}},
 visibility(hidden){Object.defineProperty(document,'hidden',{configurable:true,value:hidden});document.dispatchEvent(new Event('visibilitychange'))},
 get schedule(){return typeof simulationFrameV24==='undefined'?null:{...simulationFrameV24}},
 clock(){return {active:performance.now(),override:gameClockV76.simulationTime??null}},
 save(){saveGame();return JSON.parse(localStorage.getItem(SAVE_KEY))},
 inputSetup(){
  for(const q of miners){World.remove(eng.world,q)}miners.clear();wildlifeV71=[];tool='pick';pickaxeTier=0;pickaxeOwnedTier=0;pickLastSlotV49=-Infinity;pickClockModeV49=null;pickPendingV49=null;this.slot=0;
  SkyAudio.rhythm=()=>({ready:true,epoch:101,beatIndex:Math.floor(this.slot/4),phase:(this.slot%4)/4,beatMs:60000/72});
  for(const x of [-240,-208])mk(x,-112,'dirt',{static:true,terrain:true,cx:cell(x),cy:cell(-128)});
  inv.dirt=0;ui();return [-240,-208].map(x=>w2s(x,-112));
 },
 inputSnapshot(){return {dirt:inv.dirt,pending:pickPendingV49?.length||0,gesture:!!gesture,pointers:pointers.size}}
};`;
function closeNumbers(actual,expected,label){
 if(typeof actual==='number'&&typeof expected==='number'){assert(Math.abs(actual-expected)<1e-7,label+': '+actual+' vs '+expected);return}
 if(Array.isArray(actual)){assert.equal(actual.length,expected.length,label);actual.forEach((v,i)=>closeNumbers(v,expected[i],label+'['+i+']'));return}
 if(actual&&typeof actual==='object'){assert.deepEqual(Object.keys(actual),Object.keys(expected),label);for(const k of Object.keys(actual))closeNumbers(actual[k],expected[k],label+'.'+k);return}
 assert.deepEqual(actual,expected,label);
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),output={};
 try{
  const load=async baseline=>{
   const page=await browser.newPage({viewport:{width:1000,height:760}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{requestAnimationFrame=()=>0;window.schedulingWall=1000;Object.defineProperty(window.performance,'now',{configurable:true,value:()=>window.schedulingWall});let seed=71829;Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);Date.now=()=>1700000000000});
   if(baseline)for(const file of ['game-v8-part0.txt','game-v24-camera-bounce.txt','game-v76-pause.txt'])await page.route('**/'+file+'*',r=>r.fulfill({body:fs.readFileSync(path.join(baseline,file+'.baseline'),'utf8')}));
   await page.route('**/game-v87-performance.txt*',async r=>{const response=await r.fetch();await r.fulfill({response,body:await response.text()+'\n'+hook})});
   await page.goto(base);await page.waitForFunction(()=>window.schedulingTest&&window.__buttonwood,null,{polling:100});await page.evaluate(()=>schedulingTest.prepare());
   return {page,errors};
  };
  const run=async(fps,baseline)=>{const {page,errors}=await load(baseline);try{return await page.evaluate(fps=>{const t=schedulingTest;for(let i=0;i<=fps*8;i++)t.frame(1000+i*1000/fps);return {fps,steps:t.deltas.length,deltas:t.deltas,trace:t.trace,state:t.snapshot(),schedule:t.schedule,clock:t.clock()}},fps)}finally{assert.deepEqual(errors,[]);await page.close()}};
  const runs=[];for(const fps of [30,60,120,144])runs.push(await run(fps));
  for(const r of runs){assert.equal(r.steps,481);assert(r.deltas.every(dt=>dt===16.67));closeNumbers(r.trace,runs[1].trace,'real '+r.fps+' Hz trace');assert.equal(r.clock.override,null);assert.equal(r.state.craft,null);assert.equal(r.state.homes,1);assert(r.state.worker.alive);assert(r.state.inventory.dirt+r.state.inventory.stone>0,'real Worker harvest');}
  output.rates=runs.map(({fps,steps,state,schedule})=>({fps,steps,state,schedule}));
  console.log('PASS 30/60/120/144 Hz: identical 481-step Matter/Worker/liquid/crafting/egg traces over eight seconds, fixed 16.67 ms delta');
  if(process.env.SKY_SCHEDULING_BASELINE_DIR){const previous=await run(60,process.env.SKY_SCHEDULING_BASELINE_DIR);closeNumbers(runs[1].trace,previous.trace,'previous exact-60 Hz trace');assert.deepEqual(runs[1].deltas,previous.deltas);output.legacy60={steps:previous.steps,state:previous.state};console.log('PASS previous 60 Hz real physics, harvesting, liquids and gameplay clocks (1e-7 ms/position tolerance)')}
  const {page,errors}=await load();try{
   output.interruptions=await page.evaluate(()=>{
    const t=schedulingTest;t.frame(1000);const first=t.deltas.length;t.frame(1200);if(t.deltas.length-first!==6)throw Error('unbounded stall');const after=t.snapshot(),steps=t.deltas.length;t.frame(1200);if(t.deltas.length!==steps)throw Error('duplicate callback step');
    t.visibility(true);t.frame(1250);const hidden=t.snapshot();t.visibility(false);t.frame(1300);const resumed=t.snapshot();if(t.deltas.length!==steps+1)throw Error('hidden catch-up');if(resumed.egg!==hidden.egg||resumed.clock.elapsed!==hidden.clock.elapsed)throw Error('background helper-clock aging');
    skyStackPause.pause();t.frame(3000);const paused=t.snapshot();skyStackPause.resume();t.frame(3010);const unpaused=t.snapshot();if(t.deltas.length!==steps+2)throw Error('pause catch-up');if(unpaused.egg!==paused.egg||unpaused.clock.elapsed!==paused.clock.elapsed)throw Error('pause helper-clock aging');
    const beforeLong=t.deltas.length;t.frame(15000);const long=t.deltas.length-beforeLong;t.frame(15000);if(long!==6||t.deltas.length-beforeLong!==6)throw Error('long stall debt replay');if(t.clock().override!==null)throw Error('clock leak');
    return {stallSteps:6,hiddenSteps:1,pauseSteps:1,longStallSteps:long,after,resumed,paused,unpaused,schedule:t.schedule,clock:t.clock()};
   });assert.deepEqual(errors,[]);console.log('PASS real capped stalls, duplicate callbacks, short background/resume, pause active-clock alignment and no debt replay');
  }finally{await page.close()}
  const input=await load();try{
   const points=await input.page.evaluate(()=>schedulingTest.inputSetup());for(const p of points)await input.page.mouse.click(p.x,p.y);
   assert.equal((await input.page.evaluate(()=>schedulingTest.inputSnapshot())).pending,2);
   await input.page.evaluate(()=>{schedulingTest.frame(1000);schedulingTest.frame(1400)});assert.equal((await input.page.evaluate(()=>schedulingTest.inputSnapshot())).pending,2,'capped simulation does not consume/drop taps');
   await input.page.evaluate(()=>schedulingTest.slot=1);await input.page.waitForFunction(()=>schedulingTest.inputSnapshot().dirt===1,null,{polling:100});
   await input.page.evaluate(()=>{schedulingTest.frame(1401);schedulingTest.slot=2});await input.page.waitForFunction(()=>schedulingTest.inputSnapshot().dirt===2,null,{polling:100});
   await input.page.evaluate(()=>schedulingTest.slot=20);await input.page.waitForTimeout(80);output.input=await input.page.evaluate(()=>schedulingTest.inputSnapshot());assert.deepEqual(output.input,{dirt:2,pending:0,gesture:false,pointers:0});assert.deepEqual(input.errors,[]);
   console.log('PASS two real mouse taps survive capped catch-up and strike once each on the independent 8 ms input timer, including a callback with no physics tick');
  }finally{await input.page.close()}
  const live=await browser.newPage({viewport:{width:1000,height:760}}),liveErrors=[];live.on('pageerror',e=>liveErrors.push(e.message));
  try{
   await live.route('**/game-v87-performance.txt*',async r=>{const response=await r.fetch();await r.fulfill({response,body:await response.text()+`\nwindow.schedulingLive={spawn(){createMinerAt(0,-50,{id:85001,level:2,gold:7})},state(){const q=[...miners].find(q=>q.game.id===85001);return {wall:window.performance.now(),physics:eng.timing.timestamp,steps:simulationFrameV24.steps,dropped:simulationFrameV24.dropped,clock:{...settlementV55},worker:q?{id:q.game.id,level:q.game.level,bells:q.game.gold,finite:[q.position.x,q.position.y,q.velocity.x,q.velocity.y].every(Number.isFinite)}:null}},save(){saveGame();return this.state()}};`})});
   await live.goto(base);await live.waitForFunction(()=>window.schedulingLive&&window.__buttonwood);await live.evaluate(()=>schedulingLive.spawn());const start=await live.evaluate(()=>schedulingLive.state());await live.waitForTimeout(2500);const end=await live.evaluate(()=>schedulingLive.state()),elapsed=end.wall-start.wall,steps=end.steps-start.steps;
   assert(Math.abs(steps-elapsed*60/1000)<4,'live real-time simulation stays at 60 Hz');assert.equal(end.dropped,start.dropped);assert(end.worker?.finite);
   await live.keyboard.press('Escape');const saved=await live.evaluate(()=>schedulingLive.save());await live.reload();await live.waitForFunction(()=>window.schedulingLive&&window.__buttonwood);const restored=await live.evaluate(()=>schedulingLive.state());assert.deepEqual(restored.worker,saved.worker);assert.equal(restored.clock.day,saved.clock.day);assert(restored.clock.elapsed>=saved.clock.elapsed&&restored.clock.elapsed-saved.clock.elapsed<1000);
   output.live={elapsedMs:elapsed,steps,physicsMs:end.physics-start.physics,droppedMs:end.dropped-start.dropped,saved,restored};assert.deepEqual(liveErrors,[]);console.log('PASS live real-time 60 Hz gameplay and actual Worker/Bell/settlement save/reload');
  }finally{await live.close()}
  if(process.env.SKY_SCHEDULING_OUTPUT)fs.writeFileSync(process.env.SKY_SCHEDULING_OUTPUT,JSON.stringify(output,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
