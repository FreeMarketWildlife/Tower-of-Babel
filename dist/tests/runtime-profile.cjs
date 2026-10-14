const {chromium}=require('playwright');
const fs=require('node:fs');
const outputDir=process.env.SKY_PROFILE_DIR||'/tmp/block-stacker-profile';fs.mkdirSync(outputDir,{recursive:true});
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:18743/tower-of-babel/';
const hook=`window.overnight={frame(){loop()},step(n){for(let i=0;i<n;i++){Engine.update(eng,16.67);updateMiners(performance.now())}},bodies(){return {blocks:bs.size,workers:miners.size,structures:structureBodiesV47.size}},spawn(n){for(let i=0;i<n;i++)createMinerAt((i%10)*26,-50-Math.floor(i/10)*35,{level:3})}};`;
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const output={};for(const scene of ['normal','workers','storm']){
  const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/game-v87-performance.txt*',async r=>{const response=await r.fetch();await r.fulfill({response,body:await response.text()+'\n'+hook})});
  const start=performance.now();await page.goto(base+(scene==='storm'?'?demo=moonfire':''));await page.waitForFunction(()=>window.overnight&&window.__buttonwood,null,{polling:100});const loadMs=performance.now()-start;
  await page.evaluate(scene=>{if(scene==='workers')overnight.spawn(30);if(scene==='storm')skyStackPause.resume()},scene);await page.waitForTimeout(scene==='storm'?10500:1500);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  const timing=await page.evaluate(()=>new Promise(resolve=>{const ds=[],start=performance.now();let prev=start;function frame(now){ds.push(now-prev);prev=now;if(performance.now()-start<5000)requestAnimationFrame(frame);else {ds.sort((a,b)=>a-b);resolve({frames:ds.length,p50:ds[Math.floor(ds.length*.5)],p95:ds[Math.floor(ds.length*.95)],p99:ds[Math.floor(ds.length*.99)],max:ds.at(-1),bodies:overnight.bodies(),heap:performance.memory?.usedJSHeapSize,perf:skyStackPerf.state})}}requestAnimationFrame(frame)}));
  const {profile}=await cdp.send('Profiler.stop');fs.writeFileSync(outputDir+'/'+(process.env.TAG||'current')+'-'+scene+'-profile.json',JSON.stringify(profile));
  const nodes=new Map(profile.nodes.map(node=>[node.id,node])),counts=new Map();for(let i=0;i<profile.samples.length;i++){const node=nodes.get(profile.samples[i]);const key=node.callFrame.functionName+' '+node.callFrame.url.split('/').at(-1)+':'+node.callFrame.lineNumber;counts.set(key,(counts.get(key)||0)+(profile.timeDeltas[i]||0))}
  output[scene]={loadMs,...timing,errors,top:[...counts].sort((a,b)=>b[1]-a[1]).slice(0,18)};console.log(scene,JSON.stringify(output[scene]));await page.close();
 }fs.writeFileSync(outputDir+'/'+(process.env.TAG||'current')+'-summary.json',JSON.stringify(output,null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
