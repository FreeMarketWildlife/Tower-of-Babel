// No-op physics/render benchmark isolates scheduling overhead; no timing pass/fail limit.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=path.join(__dirname,'../game-v24-camera-bounce.txt'),source=fs.readFileSync(file,'utf8');
const code=source.slice(source.indexOf('// Fixed-rate simulation'),source.indexOf('\nloop=loopV24;'));
const legacy=`function loopV24(now){const t=now||performance.now();Engine.update(eng,16.67);updateMiners(t);cameraTickV24(t);ensureWorld();progress(t);ctx.setTransform(DPR,0,0,DPR,0,0);bg();for(const z of bs)draw(z);drawMappedLiquids(t);for(const q of miners)drawMiner(q,t);drawGoldBursts(t);preview();requestAnimationFrame(loop)}`;
function fixture(code){
 const noop=()=>{},state={physics:0,workers:0},values={gameClockV76:{paused:false,simulationTime:null},document:{hidden:false,addEventListener:noop},performance:{now:()=>0},Engine:{update:()=>state.physics++},eng:{},updateMiners:()=>state.workers++,cameraTickV24:noop,ensureWorld:noop,progress:noop,ctx:{setTransform:noop},DPR:1,bg:noop,bs:[],draw:noop,drawMappedLiquids:noop,miners:[],drawMiner:noop,drawGoldBursts:noop,preview:noop,requestAnimationFrame:noop,loop:noop};
 return {frame:Function(...Object.keys(values),code+'\nreturn loopV24;')(...Object.values(values)),state};
}
const count=200000,output={scope:'No-op simulation/render; timings isolate the scheduler, excluding physics, AI, UI and input work.',callbacks:count,batches:7,rates:[]};
for(const fps of [60,144]){
 const times={previous:[],fixed:[]},steps={};
 for(let round=0;round<7;round++)for(const name of round%2?['fixed','previous']:['previous','fixed']){
  const f=fixture(name==='fixed'?code:legacy);for(let i=0;i<20000;i++)f.frame(1000+i*1000/fps);
  const initial=f.state.physics,start=performance.now();for(let i=20000;i<20000+count;i++)f.frame(1000+i*1000/fps);times[name].push(performance.now()-start);steps[name]=f.state.physics-initial;assert.equal(f.state.physics,f.state.workers);
 }
 const median=xs=>[...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)],previousMs=median(times.previous),fixedMs=median(times.fixed);
 output.rates.push({fps,steps,previousMs,fixedMs,addedNsPerCallback:(fixedMs-previousMs)*1e6/count,samples:times});
}
console.log(JSON.stringify(output,null,2));if(process.env.SKY_SCHEDULING_BENCH_OUTPUT)fs.writeFileSync(process.env.SKY_SCHEDULING_BENCH_OUTPUT,JSON.stringify(output,null,2));
