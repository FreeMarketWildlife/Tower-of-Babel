const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),source=read('game-v28-resources-obsidian.txt');
const start=source.indexOf('function liquidClearWorldCellV28('),end=source.indexOf('\nwindow.__skyStackResourceDebug',start),optimized=source.slice(start,end);
assert(start>=0&&end>start);const reference=optimized.replace('if(!hasLava)return;','').replace('if(validBounds&&Number.isInteger(w.x)&&Number.isInteger(w.y)&&(w.x<minX||w.x>maxX||w.y<minY||w.y>maxY))continue;','');assert.notEqual(reference,optimized);
function world(code){
 const s={console,performance:{now:()=>0},localStorage:{getItem:()=>null},window:{},created:[]};vm.createContext(s);
 for(const file of ['tests/liquid-fixture.js','game-v22-liquid-engine.txt','game-v29-liquid-feel.txt'])vm.runInContext(read(file),s);
 s.liquidV22Init();s.ctr=i=>i*32+16;s.createObsidian=(x,y)=>{s.created.push([x,y]);return {x,y}};vm.runInContext(code,s);return s;
}
const snapshot=s=>JSON.parse(JSON.stringify({cells:[...s.liquidSubV22],created:s.created}));
{
 const a=world(reference),b=world(optimized);
 for(let n=0;n<40;n++){
  for(const s of [a,b]){
   const x=n*4;s.liquidSubV22.set(s.liquidSubKeyV22(x,2),{x,y:2,kind:n%2?'taintedWater':'water',a:.75});
   s.liquidSubV22.set(s.liquidSubKeyV22(x,3),{x,y:3,kind:'lava',a:n%3===0?.014:n%3===1?.015:.75});
   if(n%4===0)s.liquidSubV22.set(s.liquidSubKeyV22(x+1,3),{x:x+1,y:3,kind:'oil',a:.1});
   s.liquidReactV22(n*17);
  }
  assert.deepEqual(snapshot(b),snapshot(a),'identical reaction records/products at '+n);
 }
 assert(a.created.length>0);console.log('PASS exact mixed water/taint/lava threshold, third-liquid protection, new-contact and reaction-order parity');
}
{
 const probes=[];
 for(const code of [reference,optimized]){
  const s=world(code);for(let x=0;x<1000;x++)s.liquidSubV22.set(s.liquidSubKeyV22(x,2),{x,y:2,kind:x%2?'taintedWater':'water',a:.75});
  let count=0;const rec=s.liquidSubRecV22;s.liquidSubRecV22=(...args)=>{count++;return rec(...args)};s.liquidReactV22(0);probes.push(count);assert.equal(s.created.length,0);
 }
 assert.deepEqual(probes,[4000,0]);console.log('PASS water-only reaction neighbor probes:',probes.join(' -> '));
}
{
 const probes=[];
 for(const code of [reference,optimized]){
  const s=world(code);for(let x=0;x<1000;x++){s.liquidSubV22.set(s.liquidSubKeyV22(x,2),{x,y:2,kind:'water',a:.75});s.liquidSubV22.set(s.liquidSubKeyV22(x,80),{x,y:80,kind:'lava',a:.75})}
  let count=0;const rec=s.liquidSubRecV22;s.liquidSubRecV22=(...args)=>{count++;return rec(...args)};s.liquidReactV22(0);probes.push(count);assert.equal(s.created.length,0);
 }
 assert.deepEqual(probes,[4000,0]);console.log('PASS separated buried-lava/water reaction neighbor probes:',probes.join(' -> '));
}
{
 for(const [waterY,lavaY]of [[.1,1.1],[2,3],[0,NaN]]){
  const a=world(reference),b=world(optimized);for(const s of [a,b]){s.liquidSubV22.set(s.liquidSubKeyV22(0,waterY),{x:0,y:waterY,kind:'water',a:.75});s.liquidSubV22.set(s.liquidSubKeyV22(0,lavaY),{x:0,y:lavaY,kind:'lava',a:.75});s.liquidReactV22(0)}assert.deepEqual(snapshot(b),snapshot(a));
 }
 console.log('PASS fractional and invalid-coordinate fallback preserves original contact behavior');
}
