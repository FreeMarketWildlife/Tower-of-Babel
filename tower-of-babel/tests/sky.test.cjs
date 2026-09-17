const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../game-v62-sky.txt'),'utf8');
let calls=[],audioMix,earthCalls=0;
const ctx={globalAlpha:1,fillStyle:'',save(){},restore(){},beginPath(){},rect(){},clip(){},scale(){},
 fillRect(x,y,w,h){assert.ok([x,y,w,h,this.globalAlpha].every(Number.isFinite));assert.ok(w>=0&&h>=0);calls.push([x,y,w,h,this.fillStyle,this.globalAlpha])}};
const s={ctx,window:{SkyAudio:{setNightMix(n){audioMix=n}}},Math,Number,B:32,W:1100,HH:820,cam:{x:0,y:-180,z:1},
 DAY_V55:180000,NIGHT_V55:60000,settlementV55:{day:1,phase:'day',elapsed:0},
 clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),workerNightV55:()=>s.settlementV55.phase==='night',
 saveWorkersV55:()=>({clock:{...s.settlementV55},families:['preserved']}),
 restoreDynamicState(save){if(save?.workersV55?.clock)s.settlementV55={...save.workersV55.clock}},
 artBaseBgV32(){earthCalls++},w2s:()=>({y:s.HH/2-s.cam.y*s.cam.z})};
vm.createContext(s);vm.runInContext(source,s);
function at(seconds,day=1){s.settlementV55={day,phase:seconds>=180?'night':'day',elapsed:(seconds>=180?seconds-180:seconds)*1000};return s.skyStateV62()}
for(const boundary of [22,48,140,163,180,193,207,226,240]){
 const before=at(boundary-.0001),after=at(boundary===240?0:boundary+.0001,boundary===240?2:1);
 assert.ok(Math.abs(before.darkness-after.darkness)<.0001,'continuous music at '+boundary);
 for(let i=0;i<6;i++)for(let j=0;j<3;j++)assert.ok(Math.abs(before.colors[i][j]-after.colors[i][j])<.01,'continuous sky at '+boundary);
}
assert.equal(at(100).darkness,0);assert.equal(at(215).darkness,1);
s.skySeedV62=123456;let showers=0,showerDay;
for(let day=1;day<=120000;day++){if(at(210,day).shower){showers++;showerDay=day}}
assert.ok(Math.abs(showers/120000-1/12)<.003,'one-in-twelve nightly probability');
at(210,showerDay);const before=s.window.__skyStackSkyDebug(),save={workersV55:s.saveWorkersV55()};
s.skySeedV62=999;s.restoreDynamicState(save);assert.deepEqual(s.window.__skyStackSkyDebug(),before);
assert.equal(save.workersV55.families[0],'preserved');assert.equal(audioMix,1);
const same=s.skyStateV62();for(let i=0;i<100;i++)assert.deepEqual(s.skyStateV62(),same,'rendering never rerolls or advances time');
assert.equal(s.skyMeteorsV62(at(100,showerDay),1100,590),0,'day has no meteors');
assert.equal(s.skyMeteorsV62(at(180,showerDay),1100,590),0,'shower fades in after dusk');
assert.equal(s.skyMeteorsV62(at(239,showerDay),1100,590),0,'shower ends before dawn');
let maxMeteors=0;
for(let t=194;t<225;t+=.1)maxMeteors=Math.max(maxMeteors,s.skyMeteorsV62(at(t,showerDay),1100,590));
assert.ok(maxMeteors>=2&&maxMeteors<=4,'loose clusters have bounded simultaneous trails');
for(const [width,height,zoom,y] of [[1100,820,1,-180],[390,844,1,-180],[1100,820,.3,-180],[1100,820,2,-180],[1100,820,1,-4000]]){
 s.W=width;s.HH=height;s.cam.z=zoom;s.cam.y=y;
 for(const t of [0,90,175,210,238]){at(t,showerDay);calls=[];s.bg();assert.ok(calls.length>100);assert.ok(calls.every(a=>a.slice(0,4).every(Number.isInteger)),'all sky art uses integer world pixels')}
}
s.W=1100;s.HH=820;s.cam.z=1;s.cam.y=1000;calls=[];s.bg();assert.equal(calls.length,0,'no sky leaks underground');assert.ok(earthCalls>0);
// Optional renderer output for offline inspection, without a browser or game save.
if(process.env.SKY_RENDER_DIR){fs.mkdirSync(process.env.SKY_RENDER_DIR,{recursive:true});s.cam.y=-180;
 for(const [name,t] of [['sunrise',0],['day',90],['sunset',180],['meteors',210]]){calls=[];at(t,showerDay);s.bg();fs.writeFileSync(path.join(process.env.SKY_RENDER_DIR,name+'.json'),JSON.stringify(calls))}}
console.log('PASS continuous dawn/dusk palettes and music, 1/12 nightly weather, saved outcome, paused time, clustered meteors, native pixel scale and underground clipping');
