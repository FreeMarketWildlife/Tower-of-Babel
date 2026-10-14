const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const optimized=read('game-v29-liquid-feel.txt');
// Use the previous full-Map snapshots as a reference for the changed collection
// step. The transfer, parity, viscosity and pressure code is shared production code.
const reference=optimized.replace(/const active=\(\)=>\{[^\n]+\};/,"const active=()=>[...liquidSubV22.values()].filter(r=>r.kind===kind&&Math.abs(r.x-center)<=range&&liquidSubOpenV22(r.x,r.y));").replace('const falling=active();if(!falling.length)return;','const falling=active();');
assert.notEqual(reference,optimized);
function world(source){
 const s={console,performance:{now:()=>0},localStorage:{getItem:()=>null},window:{}};vm.createContext(s);
 for(const p of ['tests/liquid-fixture.js','game-v22-liquid-engine.txt'])vm.runInContext(read(p),s);
 vm.runInContext(source,s);s.liquidV22Init();s.liquidReactV22=()=>{};
 for(let x=-15;x<=15;x++)s.grid.set(s.key(x,12),true);
 for(let y=-2;y<12;y++){s.grid.set(s.key(-15,y),true);s.grid.set(s.key(15,y),true)}
 return s;
}
const snapshot=s=>JSON.parse(JSON.stringify([...s.liquidSubV22].map(([k,r])=>[k,r.x,r.y,r.kind,r.a])));
{
 const a=world(reference),b=world(optimized);
 for(const s of [a,b])for(const [i,kind]of ['water','oil','lava','taintedWater'].entries()){
  s.liquidSubPutV22(i*10-16,2,kind,2.75);s.liquidSubPutV22(i*10-16,8,kind,.6);s.liquidSubPutV22(900+i,5,kind,1);
 }
 for(let i=0;i<180;i++){
  for(const s of [a,b]){s.liquidStepsV29++;s.cam.x=(i%45<20?-64:64);for(const kind of ['water','oil','lava','taintedWater'])s.liquidStepSubV22(kind,i*1000/60)}
  assert.deepEqual(snapshot(b),snapshot(a),'exact records, insertion order and amounts after tick '+i);
 }
 console.log('PASS identical per-tick mixed-liquid records, pressure, transfers and activity range');
}
{
 const visits=[];
 for(const source of [reference,optimized]){
  const s=world(source);for(let i=0;i<2000;i++)s.liquidSubPutV22(1000+i,3,'water',1);
  let scanned=0;const values=s.liquidSubV22.values;s.liquidSubV22.values=function*(){for(const r of values.call(this)){scanned++;yield r}};
  s.liquidStepSubV22('oil',0);visits.push(scanned);
 }
 assert.deepEqual(visits,[8000,2000]);console.log('PASS empty-kind passes examine one snapshot instead of four:',visits.join(' -> '));
}
