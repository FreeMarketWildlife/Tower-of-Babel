const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../game-v24-camera-bounce.txt'),'utf8');
const start=source.includes('// Fixed-rate simulation')?source.indexOf('// Fixed-rate simulation'):source.indexOf('function loopV24(now)'),end=source.indexOf('\nloop=loopV24;',start),production=source.slice(start,end);
const legacy=`function loopV24(now){const t=now||performance.now();Engine.update(eng,16.67);updateMiners(t);cameraTickV24(t);ensureWorld();progress(t);ctx.setTransform(DPR,0,0,DPR,0,0);bg();for(const z of bs)draw(z);drawMappedLiquids(t);for(const q of miners)drawMiner(q,t);drawGoldBursts(t);preview();requestAnimationFrame(loop)}`;
function world(code=production){
 const events=[],trace=[],camera=[],physics=[],listeners=new Map(),s={wall:1000,console,gameClockV76:{paused:false,simulationTime:null},document:{hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn)},bs:new Set(),miners:new Set(),DPR:1,eng:{time:0},body:{x:0,y:0,vx:0,vy:0,force:0},renders:0,requests:0,loop(){},ctx:{setTransform(){}},bg(){s.renders++},draw(){},drawMappedLiquids(){},drawMiner(){},drawGoldBursts(){},preview(){},ensureWorld(){},progress(){},cameraTickV24:t=>camera.push(t),requestAnimationFrame(){s.requests++}};
 s.performance={now:()=>s.gameClockV76.simulationTime??s.wall};s.Engine={update:(eng,dt)=>{physics.push(dt);eng.time+=dt;s.body.vy+=.1;s.body.x+=s.body.vx+s.body.force;s.body.y+=s.body.vy;s.body.force=0}};
 s.updateMiners=t=>{trace.push({time:t,clock:s.performance.now()});s.body.vx=s.body.vx*.35+.65;for(const event of events)if(!event.done&&t+1e-7>=event.time){event.done=true;s.body.force+=event.force}};
 vm.createContext(s);vm.runInContext(code+'\nglobalThis.frame=loopV24;',s);
 return {s,trace,camera,physics,events,frame(t){s.wall=t;s.frame(t)},reset(){if(s.resetSimulationV24)s.resetSimulationV24()},visibility(hidden){s.document.hidden=hidden;listeners.get('visibilitychange')?.()}};
}
function run(fps,code=production){const w=world(code);w.events.push({time:1050,force:7});for(let i=0;i<=fps*2;i++)w.frame(1000+i*1000/fps);return w}
{
 const results=[30,60,120,144].map(fps=>({fps,w:run(fps)}));console.log('RATES',JSON.stringify(results.map(({fps,w})=>({fps,steps:w.physics.length,physicsMs:w.s.eng.time,body:w.s.body}))));
 for(const {fps,w}of results){assert.equal(w.physics.length,121,'two seconds plus initial step at '+fps+' Hz');assert(w.physics.every(dt=>dt===16.67));assert.equal(w.events.filter(e=>e.done).length,1);assert.equal(w.camera.length,fps*2+1,'camera/input stays on render callbacks');assert.equal(w.s.renders,fps*2+1);assert.equal(w.s.requests,fps*2+1);assert.deepEqual(w.s.body,results[1].w.s.body);for(let i=0;i<w.trace.length;i++){assert(Math.abs(w.trace[i].time-results[1].w.trace[i].time)<1e-7);assert.equal(w.trace[i].clock,w.trace[i].time)}}
 const a=run(60),b=run(60,legacy);assert.deepEqual(a.physics,b.physics);assert.deepEqual(a.trace,b.trace);assert.deepEqual(a.s.body,b.s.body);assert.deepEqual(a.camera,b.camera);console.log('PASS equal 30/60/120/144 Hz simulation and exact legacy 60 Hz trace/timestep/movement/input impulse');
}
{
 const w=world();w.frame(1000);const first=w.physics.length;w.frame(1000);assert.equal(w.physics.length,first);w.events.push({time:1190,force:9});w.frame(1200);assert.equal(w.physics.length-first,6);assert(w.events[0].done,'bounded catch-up keeps queued one-shot input');const after=w.physics.length;w.frame(1200);assert.equal(w.physics.length,after);w.frame(1216.6666666667);assert.equal(w.physics.length,after+1);assert(w.physics.every(dt=>dt===16.67));assert.equal(w.s.gameClockV76.simulationTime,null);console.log('PASS stalled catch-up capped at six steps, debt discarded, no duplicate callback step or lost queued impulse');
}
{
 const w=world();w.frame(1000);w.visibility(true);w.frame(5000);assert.equal(w.physics.length,1);w.visibility(false);w.frame(5010);assert.equal(w.physics.length,2,'resume primes one step without hidden-time replay');w.s.gameClockV76.paused=true;w.frame(6000);assert.equal(w.physics.length,2);w.s.gameClockV76.paused=false;w.frame(7000);assert.equal(w.physics.length,3);assert.equal(w.s.gameClockV76.simulationTime,null);console.log('PASS background/pause/resume resets simulation debt');
}
{
 const w=world();w.s.Engine.update=()=>{throw new Error('fixture')};assert.throws(()=>w.frame(1000),/fixture/);assert.equal(w.s.gameClockV76.simulationTime,null);console.log('PASS active clock restored after a simulation exception');
}
{
 const w=world();w.frame(0);w.frame(1000/60);assert.equal(w.physics.length,2);w.frame(5);assert.equal(w.physics.length,2,'backward clock cannot replay physics');w.frame(5+1000/60);assert.equal(w.physics.length,3);console.log('PASS zero timestamp and backward-clock recovery');
}
