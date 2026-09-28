const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.SKY_TEST_BROWSER?{executablePath:process.env.SKY_TEST_BROWSER}:{})});
 try{
 const page=await browser.newPage({viewport:{width:1000,height:760},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;const interval=window.setInterval;window.setInterval=(fn,ms,...args)=>ms===8?0:interval(fn,ms,...args)});
 await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.pickTest={
 get tier(){return pickaxeTier},get owned(){return pickaxeOwnedTier},get gold(){return inv.gold},get counts(){return {...inv}},get camera(){return {...cam}},get g(){return gesture},
 goldTo(n){inv.gold=n;ui()},screen:w2s,save:saveGame,equip:equipPickV49,pulse:pulsePickV49,begin:beginPickV49,strike:strikePickV49,finish:finishPickV49,brush:pickaxeBrushV39,render:()=>loop(performance.now()),
 clock(slot,epoch=0){SkyAudio.rhythm=()=>({ready:true,epoch,beatIndex:Math.floor(slot/4),phase:(slot%4)/4,beatMs:60000/72})},
 down(p){gesture={t:'pick',a:p,b:p,moved:false};beginPickV49(gesture)},
 hold(){pulsePickV49(gesture.pickStartedAt+PICK_HOLD_MS_V49)},beforeHold(){pulsePickV49(gesture.pickStartedAt+PICK_HOLD_MS_V49-1)},
 move(p){gesture.b=p;gesture.moved=true},cancel(){gesture=null;pickPendingV49=null},zoom(n){cam.z=n},
 wildlifeStart(){if(typeof wildlifeV71==='undefined')return false;wildlifeClockV71=0;wildlifeV71.push(wildlifeNewV71('bird',{x:16,y:-64}));return true},
 wildlifeNoticed(){return wildlifeV71.some(a=>a.noticeUntilV71!=null)},
 interrupt(type){if(type==='blur')window.dispatchEvent(new Event('blur'));else c.dispatchEvent(new PointerEvent(type,{pointerId:gesture.id,bubbles:true}))},
 reset(n=8,material='dirt',hits=1){if(typeof wildlifeV71!=='undefined')wildlifeV71.length=0;gesture=null;pickPendingV49=null;pickLastSlotV49=-Infinity;pickClockModeV49=null;World.clear(eng.world,false);Engine.clear(eng);bs.clear();grid.clear();miners.clear();structuresV46=[];structureBodiesV47.clear();removedTerrain.clear();terrainDamage.clear();inv.dirt=0;inv.stone=0;stone=true;cam.x=112;cam.y=80;cam.z=1;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const z=mk(ctr(x),ctr(y),material,{static:true,terrain:true,cx:x,cy:y});z.game.max=hits;z.game.hits=0}ui()},
 remaining(){return [...bs].filter(z=>z.game.terrain).map(z=>({x:z.game.cx,y:z.game.cy,hits:z.game.hits}))}
 };`)});});
 const load=async()=>{await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:8767/tower-of-babel/');await page.waitForFunction(()=>window.pickTest,null,{polling:100})};await load();
 await page.locator('[data-tool=pick]').click();assert.equal(await page.locator('#pickaxeShop').evaluate(e=>e.open&&!e.matches(':modal')),true);assert.equal(await page.locator('#pickaxeUpgrade').isVisible(),false);
 await page.evaluate(()=>pickTest.goldTo(4));assert.ok(await page.locator('#pickaxeBuy').isDisabled());await page.locator('#pickaxeClose').click();
 for(const [tier,cost] of [[1,5],[2,20],[3,50]]){await page.evaluate(n=>pickTest.goldTo(n),cost);await page.locator('[data-tool=pick]').click();await page.locator('#pickaxeBuy').click();assert.deepEqual(await page.evaluate(()=>[pickTest.tier,pickTest.owned,pickTest.gold]),[tier,tier,0])}
 await page.locator('[data-tool=pick]').click();await page.locator('#equip-pick-0').click();assert.equal(await page.evaluate(()=>pickTest.tier),0);await load();assert.deepEqual(await page.evaluate(()=>[pickTest.tier,pickTest.owned]),[0,3]);await page.locator('[data-tool=pick]').click();await page.locator('#equip-pick-2').click();assert.deepEqual(await page.evaluate(()=>[pickTest.tier,pickTest.owned]),[2,3]);
 console.log('PASS toolbar pick inventory, sequential purchases, free swapping and independent saved ownership');
 // One square per music subdivision, with no interpolated swath or pointer-event acceleration.
 for(const [tier,size] of [[0,1],[1,2],[2,3],[3,4]])await page.evaluate(({tier,size})=>{const t=pickTest;t.equip(tier);t.reset();t.clock(0);const p={x:(Math.floor((size-1)/2)+.5)*32,y:(Math.floor((size-1)/2)+.5)*32};t.down(p);t.hold();t.pulse();if(t.counts.dirt)throw Error('Mined before boundary');t.clock(1);t.pulse();if(t.counts.dirt!==size*size)throw Error('Wrong area '+tier);t.move({x:p.x+4*32,y:p.y});for(let i=0;i<20;i++)t.pulse();if(t.counts.dirt!==size*size)throw Error('Pointer speed adds swings');t.clock(2);t.pulse();if(t.counts.dirt!==2*size*size)throw Error('Stroke interpolated outside square');t.clock(20);t.pulse();if(t.counts.dirt!==2*size*size)throw Error('Replayed skipped ticks');t.cancel()},{tier,size});
 console.log('PASS 1x1/2x2/3x3/4x4 exact squares, clock boundaries and no fast-drag widening');
 await page.evaluate(()=>{const t=pickTest;t.equip(2);t.reset(8,'stone',3);t.clock(0);t.down({x:48,y:48});t.hold();for(let slot=1;slot<=2;slot++){t.clock(slot);t.pulse();const hits=t.remaining().filter(z=>z.hits);if(hits.length!==9||hits.some(z=>z.hits!==slot)||t.counts.stone)throw Error('Uneven square hardness')}t.clock(3);t.pulse();if(t.counts.stone!==9)throw Error('Stone hardness/output');t.cancel();t.reset(8,'bedrock',1);t.clock(0);t.down({x:48,y:48});t.hold();t.clock(1);t.pulse();if(t.remaining().length!==64)throw Error('Bedrock broken');t.cancel();t.reset();t.clock(0);t.down({x:144,y:144});t.hold();t.clock(1);t.pulse();if(t.counts.dirt)throw Error('Buried square mined through wall');t.cancel()});
 console.log('PASS all nine stone cells damage together, material hardness and buried/bedrock protection');
 // Crossing musical boundaries cannot turn a short press into auto-mining.
 await page.evaluate(()=>{
  const t=pickTest;t.equip(0);t.reset();t.clock(0);t.down({x:16,y:16});
  t.clock(1);t.beforeHold();
  if(t.counts.dirt)throw Error('Mined before the stationary hold delay');
  t.clock(2);t.hold();
  if(t.counts.dirt)throw Error('Hold activation must wait for the next music slot');
  t.clock(3);t.pulse();
  if(t.counts.dirt!==1)throw Error('Stationary hold failed to activate');
  t.cancel();
 });
 console.log('PASS stationary hold delay and first strike on the following subdivision');

 const cameraXY=()=>page.evaluate(()=>[pickTest.camera.x,pickTest.camera.y]);
 const countDirt=()=>page.evaluate(()=>pickTest.counts.dirt);
 const tick=slot=>page.evaluate(n=>{pickTest.clock(n);pickTest.pulse()},slot);
 const reset=async(tier=0)=>page.evaluate(n=>{pickTest.equip(n);pickTest.reset();pickTest.clock(0)},tier);
 const point=(x=16,y=16)=>page.evaluate(p=>pickTest.screen(p.x,p.y),{x,y});
 const mouseDown=async p=>{await page.mouse.move(p.x,p.y);await page.mouse.down()};

 // Fast swipes pan at every tier and remain pans after the hold delay expires.
 for(const tier of [0,1,2,3]){
  await reset(tier);const camera=await cameraXY();const p=await point();
  await mouseDown(p);await page.mouse.move(p.x+64,p.y);
  await page.evaluate(()=>pickTest.hold());await tick(1);await page.mouse.move(p.x+96,p.y);
  await tick(2);await page.mouse.up();await tick(3);
  assert.equal(await countDirt(),0,'A quick swipe must never mine');
  assert.equal((await cameraXY())[0],camera[0]-96,'Pickaxe swipe should follow the hand camera');
 }
 console.log('PASS fast mouse swipes pan without mining at every pickaxe tier');

 // Empty starts immediately select panning, even when held and dragged onto blocks.
 await reset();let camera=await cameraXY(),p=await point(16,-16);
 await mouseDown(p);await page.evaluate(()=>pickTest.hold());await tick(1);
 await page.mouse.move(p.x,p.y+32);await tick(2);await page.mouse.up();await tick(3);
 assert.equal(await countDirt(),0,'Dragging from empty space onto a resource must not mine');
 assert.notDeepEqual(await cameraXY(),camera,'Empty-space dragging should pan');
 await reset();p=await point(16,-16);await page.mouse.click(p.x,p.y);await tick(1);
 assert.equal(await countDirt(),0,'Empty taps must not queue mining');
 console.log('PASS empty-space holds and drags remain camera gestures when crossing blocks');

 // Upgraded brushes must respect empty space at the press itself, even beside terrain.
 for(const tier of [1,2,3]){
  await reset(tier);camera=await cameraXY();p=await point(-16,16);
  await mouseDown(p);await page.evaluate(()=>pickTest.hold());await tick(1);
  await page.mouse.move(p.x+32,p.y);await tick(2);await page.mouse.up();await tick(3);
  assert.equal(await countDirt(),0,'An upgraded brush must not mine neighbors of an empty press');
  assert.equal((await cameraXY())[0],camera[0]-32);
 }
 console.log('PASS upgraded picks pan from empty brush centers beside resource blocks');

 // Wildlife intercepts taps before the canvas; its drag path must still pan with a pick.
 await reset();
 if(await page.evaluate(()=>pickTest.wildlifeStart())){
  camera=await cameraXY();p=await point(16,-64);
  await mouseDown(p);await page.mouse.move(p.x+64,p.y);await page.mouse.up();await tick(1);
  assert.equal((await cameraXY())[0],camera[0]-64,'Dragging from an animal should pan');
  assert.equal(await countDirt(),0);
  assert.equal(await page.evaluate(()=>pickTest.wildlifeNoticed()),false,'Animal drag must not play its tap sound');
  console.log('PASS pickaxe drag starting over wildlife pans without mining or animal tap sound');
 }

 // Terrain art fills its cells even at subpixel gaps between physical bodies.
 await reset();p=await point(32,16);await page.mouse.click(p.x,p.y);await tick(1);
 assert.equal(await countDirt(),1,'Clicking a terrain seam should mine the occupied cell');
 assert.equal(await page.evaluate(()=>pickTest.remaining().some(z=>z.x===1&&z.y===0)),false);
 console.log('PASS terrain seam taps use occupied grid cells');

 for(const button of ['right','middle']){
  await reset();p=await point();await page.mouse.click(p.x,p.y,{button});await tick(1);
  assert.equal(await countDirt(),0,button+' click must not mine');
  assert.equal(await page.evaluate(()=>pickTest.g),null);
 }
 console.log('PASS secondary and middle mouse buttons do not mine');

 // A tap queues exactly one strike; minor hand jitter still counts as a tap.
 await reset();p=await point();await page.mouse.click(p.x,p.y);
 assert.equal(await countDirt(),0);await tick(1);assert.equal(await countDirt(),1);
 await tick(2);assert.equal(await countDirt(),1,'A tap must queue only one strike');
 await reset();camera=await cameraXY();p=await point();
 await mouseDown(p);await page.mouse.move(p.x+5,p.y+2);await page.mouse.up();await tick(1);
 assert.equal(await countDirt(),1,'Small pointer jitter should retain tap mining');
 assert.deepEqual(await cameraXY(),camera,'Tap jitter must not pan');
 console.log('PASS short taps mine once on the music clock and tolerate small pointer jitter');

 await reset();p=await point();await page.mouse.click(p.x,p.y);
 const secondTap=await point(48,16);await page.mouse.click(secondTap.x,secondTap.y);
 assert.equal(await countDirt(),0);await tick(1);assert.equal(await countDirt(),1);
 await tick(2);assert.equal(await countDirt(),2,'Rapid taps must each retain a queued strike');
 await tick(3);assert.equal(await countDirt(),2);
 console.log('PASS rapid taps retain one queued strike per tap');

 // Holding activates mining. Thereafter pointer motion chooses blocks without panning.
 await reset();camera=await cameraXY();p=await point();
 await mouseDown(p);await page.mouse.move(p.x+5,p.y+2);
 await page.evaluate(()=>pickTest.hold());await tick(1);assert.equal(await countDirt(),1);
 await page.mouse.move(p.x+64,p.y);await tick(2);assert.equal(await countDirt(),2);
 await page.mouse.move(p.x+96,p.y);await tick(3);await page.mouse.up();await tick(4);
 assert.equal(await countDirt(),3,'Releasing auto-mining must not add a tap');
 assert.deepEqual(await cameraXY(),camera,'Active auto-mining must not pan');
 console.log('PASS stationary auto-mining tolerates jitter and keeps mining after dragging');

 // The gesture threshold is in screen pixels, independent of world zoom.
 for(const zoom of [.75,1.5]){
  await reset();await page.evaluate(n=>pickTest.zoom(n),zoom);camera=await cameraXY();p=await point();
  await mouseDown(p);await page.mouse.move(p.x+7,p.y);await page.mouse.up();await tick(1);
  assert.equal(await countDirt(),1,'Seven CSS pixels should remain a tap at every zoom');
  assert.deepEqual(await cameraXY(),camera);
  await reset();await page.evaluate(n=>pickTest.zoom(n),zoom);camera=await cameraXY();p=await point();
  await mouseDown(p);await page.mouse.move(p.x+9,p.y);await page.mouse.up();await tick(1);
  assert.equal(await countDirt(),0,'Nine CSS pixels should select pan at every zoom');
  assert.ok(Math.abs((await cameraXY())[0]-(camera[0]-9/zoom))<1e-6);
 }
 console.log('PASS gesture movement threshold stays consistent at different camera zooms');

 // Interrupted gestures cannot later become held mining or release-tap mining.
 for(const type of ['pointercancel','lostpointercapture','blur']){
  for(const active of [false,true]){
   await reset();p=await point();await mouseDown(p);
   if(active){await page.evaluate(()=>pickTest.hold());await tick(1)}
   const before=await countDirt();await page.evaluate(type=>pickTest.interrupt(type),type);
   await tick(2);await page.mouse.up();await tick(3);
   assert.equal(await countDirt(),before,type+' must cancel pending and active mining');
   assert.equal(await page.evaluate(()=>pickTest.g),null,type+' must clear the gesture');
  }
 }
 console.log('PASS pointer cancellation, lost capture and blur safely end pickaxe gestures');
 // A resumed audio timeline must not wait for the previous timeline's high beat count.
 await page.evaluate(()=>{const t=pickTest;t.reset();t.clock(1000,1);t.down({x:16,y:16});t.hold();t.clock(1001,1);t.pulse();t.cancel();t.clock(0,2);t.down({x:48,y:16});t.hold();t.clock(1,2);t.pulse();if(t.counts.dirt!==2)throw Error('Mining blocked by old audio timeline');t.move({x:80,y:16});t.clock(0,3);t.pulse();if(t.counts.dirt!==2)throw Error('Unquantized restart strike');t.clock(1,3);t.pulse();if(t.counts.dirt!==3)throw Error('Held mining failed after timeline restart');t.cancel();document.dispatchEvent(new Event('visibilitychange'));t.clock(0,3);t.down({x:112,y:16});t.hold();t.clock(1,3);t.pulse();if(t.counts.dirt!==4)throw Error('Visibility reset retained old mining slot');t.cancel()});
 console.log('PASS mining resumes after audio restarts and visibility changes');

 await page.setViewportSize({width:390,height:844});await page.locator('[data-tool=pick]').click();await page.evaluate(()=>pickTest.render());await page.screenshot({path:'/tmp/sky-pickaxes-mobile.png'});const box=await page.locator('#pickaxeShop').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390);await page.locator('#equip-pick-1').click();
 const cdp=await page.context().newCDPSession(page);
 const touch=async(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 const touchPoint=(p,id=1)=>({x:p.x,y:p.y,id});
 const touchStart=p=>touch('touchStart',[touchPoint(p)]);
 const touchMove=p=>touch('touchMove',[touchPoint(p)]);
 const touchEnd=()=>touch('touchEnd',[]);
 await reset(1);camera=await cameraXY();p=await point();
 await touchStart(p);await touchMove({x:p.x+64,y:p.y});
 await page.evaluate(()=>pickTest.hold());await tick(1);await touchEnd();await tick(2);
 assert.equal(await countDirt(),0,'Quick touch swipe must pan without mining');
 assert.equal((await cameraXY())[0],camera[0]-64);

 await reset(1);camera=await cameraXY();p=await point(16,-16);
 await touchStart(p);await page.evaluate(()=>pickTest.hold());await tick(1);
 await touchMove({x:p.x,y:p.y+32});await tick(2);await touchEnd();await tick(3);
 assert.equal(await countDirt(),0,'Touch pan from empty space must not mine later blocks');
 assert.notDeepEqual(await cameraXY(),camera);

 await reset(1);p=await point();await touchStart(p);await touchEnd();await tick(1);
 assert.equal(await countDirt(),4,'Touch tap should mine one pickaxe square');
 await reset(1);camera=await cameraXY();p=await point();
 await touchStart(p);await page.evaluate(()=>pickTest.hold());await tick(1);
 assert.equal(await countDirt(),4);
 await touchMove({x:p.x+64,y:p.y});await tick(2);
 assert.equal(await countDirt(),8,'Held touch dragging should continue mining');
 assert.deepEqual(await cameraXY(),camera);
 await touch('touchCancel',[]);await tick(3);assert.equal(await countDirt(),8);

 // A second finger cancels both a pending press and an active mining hold.
 for(const active of [false,true]){
  await reset(1);p=await point();await touchStart(p);
  if(active){await page.evaluate(()=>pickTest.hold());await tick(1)}
  const before=await countDirt();
  await touch('touchStart',[touchPoint(p),touchPoint({x:p.x+60,y:p.y},2)]);
  await tick(2);await touchEnd();await tick(3);
  assert.equal(await countDirt(),before,'Pinch must cancel pending and active mining');
 }
 await reset(1);p=await point();await touchStart(p);await touch('touchCancel',[]);await tick(1);
 assert.equal(await countDirt(),0,'Cancelled touch press must not become a tap');
 console.log('PASS phone taps, panning, auto-mining, touch cancellation, pinch safety and mobile inventory');

 // Real Web Audio clock: sustained mining stays on sixteenth boundaries.
 await load();await page.evaluate(async()=>{await SkyAudio.ensure();window.pickEvents=[];const end=SkyAudio.endPickStroke;SkyAudio.endPickStroke=()=>{pickEvents.push({at:performance.now(),...SkyAudio.rhythm()});end()};pickTest.equip(2);pickTest.reset(8,'stone',100);pickTest.down({x:48,y:48});pickTest.hold();window.pickLiveTimer=setInterval(()=>pickTest.pulse(),4)});await page.waitForTimeout(1250);
 const events=await page.evaluate(()=>{clearInterval(pickLiveTimer);pickTest.cancel();return pickEvents});assert.ok(events.length>=4&&events.length<=7);for(let i=1;i<events.length;i++)assert.ok(Math.abs(events[i].at-events[i-1].at-60000/72/4)<40);for(const e of events)assert.ok((e.phase*4)%1<.25,'Late musical subdivision');
 // Inspect actual created filters, and ensure one square produces one dirt hat.
 const hats=await page.evaluate(()=>{const proto=AudioContext.prototype,original=proto.createBiquadFilter,filters=[];proto.createBiquadFilter=function(){const node=original.call(this);filters.push(node);return node};try{SkyAudio.beginPickStroke();for(let i=0;i<9;i++)SkyAudio.hit('dirt',true);SkyAudio.endPickStroke();return filters.map(f=>({type:f.type,hz:f.frequency.value}))}finally{proto.createBiquadFilter=original}});assert.deepEqual(hats,[{type:'highpass',hz:6500},{type:'lowpass',hz:12500}]);
 console.log('PASS live 72 BPM sixteenth timing and one high-frequency hi-hat per dirt square');
 assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
