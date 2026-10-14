// Optional paired benchmark; SKY_BASELINE_DIR contains relative files suffixed
// with .baseline. Keep its server, browser contexts and output separate from play.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:18743/tower-of-babel/';
const baseline=process.env.SKY_BASELINE_DIR,delay=Number(process.env.SKY_BENCH_LATENCY||0);
const afterSource=process.env.SKY_AFTER_DIR;
const scenes=(process.env.SKY_BENCH_SCENES||'normal,workers,storm').split(','),rounds=Number(process.env.SKY_BENCH_ROUNDS||1);
const mutations=Number(process.env.SKY_BENCH_MUTATIONS||0);
const hook=`window.runtimeBench={
 scene(kind){if(kind==='workers')for(let i=0;i<30;i++)createMinerAt((i%10)*26,-50-Math.floor(i/10)*35,{level:3});if(kind==='storm')skyStackPause.resume();if(kind==='explored')for(let ch=-12;ch<=12;ch++)gen(ch);for(const z of bs)z.game.flash=0;settlementV55.elapsed=0},
 workload(){return {blocks:bs.size,workers:miners.size,structures:structuresV46.length,seed:skySeedV62,camera:{...cam},liquids:liquidSubV22.size}},
 visits(){let count=0;const original=draw;draw=function(z){count++;return original(z)};try{__buttonwood.render(12000)}finally{draw=original}return count},
 render(){__buttonwood.render(12000);let hash=2166136261;for(const v of ctx.getImageData(0,0,c.width,c.height).data)hash=Math.imul(hash^v,16777619);return hash>>>0},
 physics(){Engine.update(eng,16.67)},
 mutations(count){const samples=[],removed=[];for(let i=0;i<count;i++){const z=grid.get(key(i-15,1));if(z){removed.push([z.game.cx,z.game.cy]);grid.delete(key(z.game.cx,z.game.cy));bs.delete(z);World.remove(eng.world,z)}const t=window.performance.now();__buttonwood.render(12000);samples.push(window.performance.now()-t)}const sorted=samples.slice().sort((a,b)=>a-b);return {samplesMs:samples,p50:sorted[Math.floor(count*.5)],p95:sorted[Math.min(count-1,Math.floor(count*.95))],removed,hash:this.render()}},
 bench(){const measure=fn=>{for(let i=0;i<30;i++)fn();const samples=[];for(let n=0;n<5;n++){const t=window.performance.now();for(let i=0;i<100;i++)fn();samples.push(window.performance.now()-t)}const sorted=samples.slice().sort((a,b)=>a-b);return {medianMs:sorted[2],samplesMs:samples,warmups:30,batchIterations:100}};
  const terrain=[...grid.values()].slice(0,200);let index=0;
  const neighbors=measure(()=>{for(let i=0;i<200;i++)bwTerrainNeighbors(terrain[index++%terrain.length])});
  const render=measure(()=>__buttonwood.render(12000));
  return {neighbors20kMs:neighbors.medianMs,render100Ms:render.medianMs,measurements:{neighbors,render},heap:window.performance.memory?.usedJSHeapSize,blocks:bs.size,workers:miners.size};
 }
};`;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[];
 try{
  for(let round=0;round<rounds;round++)for(const scene of scenes)for(const variant of baseline?(round%2?['after','before']:['before','after']):['after']){
   const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{requestAnimationFrame=()=>0;let seed=123456789;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};Date.now=()=>1791936000000});
   await page.route('**/*',async r=>{
    const url=new URL(r.request().url()),relative=url.pathname.replace(/^.*\/(tower-of-babel|dist)\//,'');
    if(!url.pathname.startsWith(new URL(base).pathname)||!relative.match(/\.(txt|js)$/)){await r.continue();return}
    requests.push({file:relative,at:performance.now()});if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    const response=await r.fetch(),sourceDir=variant==='before'?baseline:afterSource,file=sourceDir&&path.join(sourceDir,relative+'.baseline');
    let body=file&&fs.existsSync(file)?fs.readFileSync(file,'utf8'):await response.text();
    if(relative==='game-v87-performance.txt')body+='\n'+hook;await r.fulfill({response,body});
   });
   const start=performance.now();await page.goto(base+(scene==='storm'?'?demo=moonfire':''));await page.waitForFunction(()=>window.runtimeBench&&window.__buttonwood,null,{polling:100});
   const loadMs=performance.now()-start,moduleRequests=requests.filter(r=>r.file!=='audio.js'&&r.file!=='game-v28.js');
   await page.evaluate(kind=>runtimeBench.scene(kind),scene);const hash=await page.evaluate(()=>runtimeBench.render());
   const result={scene,variant,round,viewport:{width:1280,height:900},latencyMs:delay,loadMs,moduleStartSpreadMs:moduleRequests.at(-1).at-moduleRequests[0].at,hash,workload:await page.evaluate(()=>runtimeBench.workload()),drawVisits:await page.evaluate(()=>runtimeBench.visits()),...await page.evaluate(()=>runtimeBench.bench()),errors};
   if(mutations)result.excavation=await page.evaluate(count=>runtimeBench.mutations(count),mutations);
   await page.evaluate(()=>runtimeBench.physics());const cdp=await page.context().newCDPSession(page);await cdp.send('HeapProfiler.collectGarbage');result.retainedHeapBytes=(await cdp.send('Runtime.getHeapUsage')).usedSize;
   assert.deepEqual(errors,[]);results.push(result);console.log(JSON.stringify(result));await page.close();
  }
  if(baseline)for(let round=0;round<rounds;round++)for(const scene of scenes){const before=results.find(r=>r.scene===scene&&r.round===round&&r.variant==='before'),after=results.find(r=>r.scene===scene&&r.round===round&&r.variant==='after');assert.deepEqual(after.workload,before.workload,scene+' has identical workload');assert.equal(before.hash,after.hash,scene+' has identical native pixels');if(mutations){assert.deepEqual(after.excavation.removed,before.excavation.removed);assert.equal(after.excavation.hash,before.excavation.hash,scene+' has identical excavated pixels')}}
  if(process.env.SKY_BENCH_OUTPUT)fs.writeFileSync(process.env.SKY_BENCH_OUTPUT,JSON.stringify(results,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
