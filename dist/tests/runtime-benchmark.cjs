// Optional paired benchmark; SKY_BASELINE_DIR contains relative files suffixed
// with .baseline. Keep its server, browser contexts and output separate from play.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:18743/tower-of-babel/';
const baseline=process.env.SKY_BASELINE_DIR,delay=Number(process.env.SKY_BENCH_LATENCY||0);
const hook=`window.runtimeBench={
 scene(kind){if(kind==='workers')for(let i=0;i<30;i++)createMinerAt((i%10)*26,-50-Math.floor(i/10)*35,{level:3});if(kind==='storm')skyStackPause.resume();for(const z of bs)z.game.flash=0;settlementV55.elapsed=0},
 render(){__buttonwood.render(12000);let hash=2166136261;for(const v of ctx.getImageData(0,0,c.width,c.height).data)hash=Math.imul(hash^v,16777619);return hash>>>0},
 physics(){Engine.update(eng,16.67)},
 bench(){const measure=fn=>{for(let i=0;i<30;i++)fn();const samples=[];for(let n=0;n<5;n++){const t=window.performance.now();for(let i=0;i<100;i++)fn();samples.push(window.performance.now()-t)}samples.sort((a,b)=>a-b);return samples[2]};
  const terrain=[...grid.values()].slice(0,200);let index=0;
  const neighbors=measure(()=>{for(let i=0;i<200;i++)bwTerrainNeighbors(terrain[index++%terrain.length])});
  const render=measure(()=>__buttonwood.render(12000));
  return {neighbors20kMs:neighbors,render100Ms:render,heap:window.performance.memory?.usedJSHeapSize,blocks:bs.size,workers:miners.size};
 }
};`;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[];
 try{
  for(const scene of ['normal','workers','storm'])for(const variant of baseline?['before','after']:['after']){
   const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{requestAnimationFrame=()=>0;let seed=123456789;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};Date.now=()=>1791936000000});
   await page.route('**/*',async r=>{
    const url=new URL(r.request().url()),relative=url.pathname.replace(/^.*\/(tower-of-babel|dist)\//,'');
    if(!url.pathname.startsWith(new URL(base).pathname)||!relative.match(/\.(txt|js)$/)){await r.continue();return}
    requests.push({file:relative,at:performance.now()});if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    const response=await r.fetch(),file=baseline&&path.join(baseline,relative+'.baseline');
    let body=variant==='before'&&file&&fs.existsSync(file)?fs.readFileSync(file,'utf8'):await response.text();
    if(relative==='game-v87-performance.txt')body+='\n'+hook;await r.fulfill({response,body});
   });
   const start=performance.now();await page.goto(base+(scene==='storm'?'?demo=moonfire':''));await page.waitForFunction(()=>window.runtimeBench&&window.__buttonwood,null,{polling:100});
   const loadMs=performance.now()-start,moduleRequests=requests.filter(r=>r.file!=='audio.js'&&r.file!=='game-v28.js');
   await page.evaluate(kind=>runtimeBench.scene(kind),scene);const hash=await page.evaluate(()=>runtimeBench.render());
   const result={scene,variant,latencyMs:delay,loadMs,moduleStartSpreadMs:moduleRequests.at(-1).at-moduleRequests[0].at,hash,...await page.evaluate(()=>runtimeBench.bench()),errors};
   await page.evaluate(()=>runtimeBench.physics());const cdp=await page.context().newCDPSession(page);await cdp.send('HeapProfiler.collectGarbage');result.retainedHeapBytes=(await cdp.send('Runtime.getHeapUsage')).usedSize;
   assert.deepEqual(errors,[]);results.push(result);console.log(JSON.stringify(result));await page.close();
  }
  if(baseline)for(const scene of ['normal','workers','storm'])assert.equal(results.find(r=>r.scene===scene&&r.variant==='before').hash,results.find(r=>r.scene===scene&&r.variant==='after').hash,scene+' has identical native pixels');
  if(process.env.SKY_BENCH_OUTPUT)fs.writeFileSync(process.env.SKY_BENCH_OUTPUT,JSON.stringify(results,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
