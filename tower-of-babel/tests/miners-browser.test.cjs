// Run against a local server with NODE_PATH pointing to Playwright if needed.
// SKY_TEST_BROWSER can select an existing Chromium executable.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.SKY_TEST_BROWSER?{executablePath:process.env.SKY_TEST_BROWSER}:{})});
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.requestAnimationFrame=()=>0;
  const AC=window.AudioContext;window.AudioContext=class extends AC{constructor(...args){super(...args);window.minerTestAudioContext=this}};
 });
 if(process.env.SKY_TEST_SETTLEMENT_SOURCE)await page.route('**/game-v56-settlement.txt*',route=>route.fulfill({contentType:'text/plain',body:fs.readFileSync(process.env.SKY_TEST_SETTLEMENT_SOURCE,'utf8')}));
 await page.route('**/game-v8-part3.txt*',async route=>{
  const response=await route.fetch(),source=await response.text();
  const hook=`window.minerTest={B,bs,miners,grid,inv,eng,createMinerAt,minerAcquireTargetV27,minerCanHitV27,minerNavigateV27,
    updateMiners,openMinerMenu,closeMinerMenu,Engine,Body,Bodies,World,minerGroundedV27,minerWallAheadV27,moveWorkerV56,putLadderV56,getExposure:()=>terrainExposed,setExposure:f=>terrainExposed=f,
    reset(){World.clear(eng.world,false);Engine.clear(eng);bs.clear();miners.clear();grid.clear();removedTerrain.clear();terrainDamage.clear();laddersV56.clear();familiesV55.clear();for(const k in inv)inv[k]=0},
    block(x,y,material='stone',terrain=true){const z=Bodies.rectangle(x,y,B,B,{isStatic:true});z.game={material,terrain,cx:Math.floor(x/B),cy:Math.floor(y/B),w:B,h:B,hits:0,max:material==='dirt'?1:material==='stone'?3:6};bs.add(z);grid.set(key(z.game.cx,z.game.cy),z);World.add(eng.world,z);return z}
  };`;
  await route.fulfill({response,body:source.replace('restoreDynamicState(initialSave);','restoreDynamicState(initialSave);'+hook)});
 });
 await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:8767/tower-of-babel/');await page.waitForFunction(()=>window.minerTest,null,{polling:100});
 const results=await page.evaluate(()=>{
  const t=minerTest,out=[],check=(ok,label)=>{if(!ok)throw Error(label);out.push(label)};
  let now=0;
  const step=n=>{for(let i=0;i<n;i++){now+=1000/60;t.Engine.update(t.eng,1000/60);t.updateMiners(now)}};
  // Actual generated terrain, production exposure/harvest, silent beat clock.
  for(let level=1;level<=3;level++)t.createMinerAt((level-2)*100,-50,{level});
  step(600);check(t.inv.dirt>=9,'fresh-world miners mine dirt at all three levels');
  const exposed=t.getExposure();
  function reset(){t.reset();now=0;t.setExposure(z=>z.exposed!==false)}
  function floor(y=80){for(let x=-304;x<=400;x+=32)t.block(x,y,'bedrock',false)}
  // Reproduce distant damaged-target starvation: adjacent work must win.
  reset();floor();const dirt=t.block(16,48,'dirt'),remote=t.block(112,16,'stone');remote.game.hits=2;
  let q=t.createMinerAt(16,19,{level:2});q.game.workTarget=remote;
  check(t.minerAcquireTargetV27(q,0)===dirt,'reachable dirt replaces a distant damaged stone target');
  step(180);check(!t.bs.has(dirt),'miner actually harvests reachable dirt');
  // A stone miner stays put through multiple beats instead of jumping off the work.
  reset();floor();const stone=t.block(16,48);q=t.createMinerAt(16,19,{level:2});
  step(480);check(!t.bs.has(stone)&&t.inv.stone>0,'miner waits and finishes a multi-hit stone block');
  reset();floor();const deep=t.block(16,48,'deepslate');q=t.createMinerAt(16,19,{level:3});
  step(720);check(!t.bs.has(deep)&&t.inv.deepslate>0,'level 3 completes deepslate on offbeats');
  // Upgrade through the real menu while another material is already targeted.
  for(const level of [2,3]){
    reset();floor();const dirt=t.block(16,48,'dirt'),hard=t.block(48,16,level===2?'stone':'deepslate');
    q=t.createMinerAt(16,19,{level:level-1});t.inv.gold=100;t.openMinerMenu(q);
    document.getElementById('minerUpgrade').click();t.closeMinerMenu();
    check(q.game.level===level,'menu upgrade reaches level '+level);
    q.game.workTarget=hard;
    step(5);check(!t.bs.has(dirt),'upgraded level '+level+' mines dirt on its next beat while harder work is nearby');
  }
  // Wall between pick and target: do not mine through it.
  reset();const hidden=t.block(40,0,'dirt');t.block(8,0,'bedrock',false);q=t.createMinerAt(-20,0,{level:1});
  check(!t.minerCanHitV27(q,hidden),'pick cannot hit through solid geometry');
  // Jump over a one-cell unmineable obstacle and reach dirt beyond it.
  reset();floor();t.block(48,48,'bedrock',false);const beyond=t.block(112,48,'dirt');q=t.createMinerAt(0,50,{level:1,dir:1});
  let minY=q.position.y,sawJump=false;
  for(let i=0;i<720&&t.bs.has(beyond);i++){step(1);minY=Math.min(minY,q.position.y);sawJump ||= q.game.aiState==='jumping'}
  check(sawJump&&minY<25,'level 1 jumps high enough to clear a one-block ledge');
  check(!t.bs.has(beyond),'level 1 gets over an obstacle and resumes digging');
  // Settlement v56 deliberately reserves sheer-wall grip for children.
  for(const level of [1,2,3]){
    reset();floor();for(const y of [48,16,-16])t.block(48,y,'bedrock',false);
    const high=t.block(80,-16,'deepslate');q=t.createMinerAt(21,12,{level,dir:1});q.game.nearbySolids=[...t.bs];q.game.climbStartY=50;q.game.climbUntil=2000;q.game.nextJump=2000;
    check(t.minerWallAheadV27(q,1)&&!t.minerGroundedV27(q),'adult level '+level+' is airborne beside the actual wall');
    t.Body.setVelocity(q,{x:0,y:1.2});t.minerNavigateV27(q,high,100);
    check(q.game.aiState!=='climbing'&&Math.abs(q.velocity.y-1.2)<1e-7,'adult level '+level+' does not grip a sheer wall');
  }
  // Installed ladders provide the supported adult route up that tall ledge.
  reset();floor();for(const y of [48,16,-16])t.block(48,y,'bedrock',false);
  const high=t.block(80,-16,'deepslate');q=t.createMinerAt(16,50,{level:3,dir:1});for(const cy of [1,0,-1,-2])check(t.putLadderV56(0,cy),'ladder fits clear cell '+cy);
  let usedLadder=false,reached=false,ladderSteps=0;const goal={x:80,y:-45.3};
  for(let i=0;i<360&&!reached;i++){ladderSteps++;now+=1000/60;t.Engine.update(t.eng,1000/60);t.moveWorkerV56(q,goal,now);usedLadder ||= q.game.aiState==='ladder';reached=Math.hypot(q.position.x-goal.x,q.position.y-goal.y)<12}
  check(usedLadder&&reached,'adult follows installed ladders and walks onto the tall ledge: '+JSON.stringify({steps:ladderSteps,usedLadder,reached,x:q.position.x,y:q.position.y,velocity:q.velocity,route:q.game.travelRouteV56,state:q.game.aiState}));
  step(720);check(!t.bs.has(high)&&t.inv.deepslate>0,'adult resumes deepslate mining after the ladder ascent');
  // Restored tilted miners and groups must fit through a one-cell tunnel.
  reset();floor();for(let x=-16;x<=144;x+=32)t.block(x,16,'bedrock',false);
  const tunnelDirt=t.block(112,48,'dirt'),workers=[];
  for(let i=0;i<6;i++)workers.push(t.createMinerAt(16,50,{level:3,angle:Math.PI/2,angularVelocity:1,dir:1}));
  check(workers.every(w=>w.angle===0&&w.inverseInertia===0),'restored miners stay upright in tight spaces');
  check(workers[0].collisionFilter.group<0&&workers.every(w=>w.collisionFilter.group===workers[0].collisionFilter.group),'miners can pass each other without blocking tunnels');
  step(600);check(workers.every(w=>Math.abs(w.angle)<.01),'miners remain upright after moving through the tunnel');check(!t.bs.has(tunnelDirt),'a group of upgraded miners gets through a low tunnel and mines dirt');
  // A two-cell overhang needs the installed ladder route, beyond an adult jump.
  reset();floor();for(const x of [16,48,80,112])t.block(x,16,'bedrock',false);
  const roofDirt=t.block(80,-16,'dirt');q=t.createMinerAt(80,50,{level:2,dir:1});for(const cy of [1,0,-1])check(t.putLadderV56(-1,cy),'overhang ladder fits clear cell '+cy);
  let detoured=false,overhangLadder=false,above=false;const roofGoal={x:48,y:-13.3};
  for(let i=0;i<600&&!above;i++){now+=1000/60;t.Engine.update(t.eng,1000/60);t.moveWorkerV56(q,roofGoal,now);detoured ||= Math.abs(q.position.x-80)>48;overhangLadder ||= q.game.aiState==='ladder';above=Math.hypot(q.position.x-roofGoal.x,q.position.y-roofGoal.y)<12}
  step(240);check(detoured&&overhangLadder&&above&&!t.bs.has(roofDirt),'adult detours through an installed ladder and mines above the overhang');
  // A sealed unreachable target must eventually be released, without teleporting.
  reset();floor();for(let y=48;y>=-112;y-=32)t.block(48,y,'bedrock',false);
  const trapped=t.block(80,48,'dirt');q=t.createMinerAt(0,50,{level:1,dir:1});let released=false;
  for(let i=0;i<1200;i++){step(1);released ||= q.game.avoidedTargets?.has(trapped)||false}
  check(released,'unreachable targets are put on cooldown instead of held forever');
  check(t.bs.has(trapped),'unreachable target is not mined through a wall');
  t.setExposure(exposed);return out;
 });
 for(const result of results)console.log('PASS '+result);
 // Exercise the actual Web Audio clock as well as the deterministic silent clock.
 await page.evaluate(async()=>{
  const t=minerTest;t.reset();t.setExposure(()=>true);
  for(let x=-48;x<=80;x+=32)t.block(x,80,'bedrock',false);
  t.block(16,48,'stone');t.createMinerAt(16,19,{level:2});
  await SkyAudio.ensure();if(!SkyAudio.rhythm().ready)throw Error('Audio clock failed to start');
  for(let i=0;i<390;i++){t.Engine.update(t.eng,1000/60);t.updateMiners(performance.now());await new Promise(r=>setTimeout(r,16))}
  if(t.inv.stone<1)throw Error('Mining stalled with live music');
  await minerTestAudioContext.suspend();if(SkyAudio.rhythm().ready)throw Error('Suspended audio advertised a running beat clock');
  t.block(16,48,'stone');t.createMinerAt(16,19,{level:2});const start=performance.now();
  for(let i=0;i<390;i++){t.Engine.update(t.eng,1000/60);t.updateMiners(start+i*1000/60)}
  if(t.inv.stone<2)throw Error('Mining stalled after audio suspension');
 });
 console.log('PASS mining with live music and after audio suspension');
 assert.deepEqual(errors,[],'no runtime errors in the assembled game');
 console.log('PASS production loader and Matter.js browser integration');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
