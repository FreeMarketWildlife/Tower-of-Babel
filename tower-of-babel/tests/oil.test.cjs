const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function world(saved=null){
 let stored=JSON.stringify(saved||{inv:{wood:7}});
 const s={console,performance:{now:()=>0},localStorage:{getItem:()=>stored,setItem:(k,v)=>{stored=v}},window:{},initialSave:saved};vm.createContext(s);
 vm.runInContext(read('tests/liquid-fixture.js'),s);
 const events={};s.setInterval=callback=>{s.autosaveCallback=callback};s.addEventListener=(name,callback)=>{events[name]=callback};s.document={hidden:false,addEventListener:(name,callback)=>{events[name]=callback}};s.events=events;
 // Register the actual startup callbacks before later save wrappers are installed.
 vm.runInContext(read('game-v8-part1.txt').split('\n').find(line=>line.startsWith('setInterval(')),s);
 s.cell=n=>Math.floor(n/32);
 for(const p of ['game-v18-terraria-liquid.txt','game-v22-liquid-engine.txt','game-v29-liquid-feel.txt'])vm.runInContext(read(p),s,{filename:p});
 vm.runInContext(`
 var removedTerrain=new Set(initialSave?.removed||[]),terrainDamage=new Map(initialSave?.damage||[]),naturalOpen=new Set(),pocketCache=new Map(),revealedPockets=new Set();
 var structureBodiesV47=new Map(),miners=new Set(),eng={world:{}},World={remove:()=>{}};
 var bucketLiquidsV68={water:'Water',lava:'Lava'},itemImagesV68=new Map(),itemImageV68=()=>'',ButtonwoodArt={};
 function ellipseCells(cx,cy,rx,ry){const out=[];for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)if(((x-cx)/(rx+.15))**2+((y-cy)/(ry+.15))**2<=1)out.push([x,y]);return out}
 function gen(ch){if(generated.has(ch))return;generated.add(ch);for(let y=0;y<DEPTH;y++)for(let x=ch*24;x<(ch+1)*24;x++){
  if(removedTerrain.has(key(x,y))||pocketDefs(ch).some(d=>d.cells.some(p=>p[0]===x&&p[1]===y)))continue;
  const z={game:{terrain:true,material:'stone',hits:terrainDamage.get(key(x,y))||0}};grid.set(key(x,y),z);bs.add(z);
 }}
 function liquidPointV42(x,y){const r=liquidSubRecV22(Math.floor(x/16),Math.floor(y/16));return r&&r.a>.01&&y>=(r.y+1-clamp(r.a,0,1))*16?r.kind:null}
 function minerExposureV42(q){return{underwater:false,lava:liquidPointV42(q.position.x,q.bounds.max.y)==='lava'}}
 generated.clear();
 `,s);
 vm.runInContext(read('game-v8-part0.txt').split('\n').find(line=>line.startsWith('function hash01(')),s);
 vm.runInContext(read('game-v17-seedfix.txt'),s);
 const life=read('game-v42-miner-ghosts.txt');vm.runInContext(life.slice(life.indexOf('function liquidPointV42('),life.indexOf('function spiritSpatialV42(')),s);
 vm.runInContext(read('game-v69-oil.txt'),s,{filename:'game-v69-oil.txt'});s.liquidV22Init();
 return s;
}
const mass=(s,kind)=>[...s.liquidSubV22.values()].filter(r=>!kind||r.kind===kind).reduce((n,r)=>n+r.a,0);
const step=(s,n,kind='oil')=>{for(let i=0;i<n;i++){s.liquidStepsV29++;s.liquidStepSubV22(kind,i*1000/60)}};
function tank(s){s.generated.add(0);s.generated.add(-1);for(let x=-2;x<=12;x++)s.grid.set(s.key(x,10),true);for(let y=-2;y<10;y++){s.grid.set(s.key(-2,y),true);s.grid.set(s.key(12,y),true)}}
{
 const s=world();tank(s);for(let x=0;x<8;x++)for(let y=4;y<9;y++)s.liquidSubPutV22(x,y,'oil',1);
 const initial=mass(s);step(s,900);
 assert.ok(Math.abs(mass(s)-initial)<1e-8,'finite oil conserves its volume');
 assert.ok([...s.liquidSubV22.values()].every(r=>r.a>=0&&s.liquidSubOpenV22(r.x,r.y)),'oil never leaks through terrain');
 const row=Array.from({length:26},(_,i)=>s.liquidSubRecV22(i-2,19)?.a||0);
 assert.ok(Math.max(...row)-Math.min(...row)<.02,'oil reaches a level pool');
 const w=world(),o=world();w.generated.add(0);o.generated.add(0);w.liquidSubPutV22(4,1,'water',1);o.liquidSubPutV22(4,1,'oil',1);step(w,5,'water');step(o,5);
 const depth=s=>[...s.liquidSubV22.values()].reduce((n,r)=>n+r.y*r.a,0);
 assert.ok(depth(w)>depth(o),'oil falls more slowly than water');
 console.log('PASS oil conservation, walls, leveling and viscosity');
}
{
 function run(fps){const s=world();tank(s);s.liquidSubPutV22(4,4,'oil',12);s.updateLiquids(0);for(let i=1;i<=fps*2;i++)s.updateLiquids(i*1000/fps);return s}
 const a=run(30),b=run(60),c=run(144);assert.equal(a.liquidStepsV29,120);assert.equal(c.liquidStepsV29,120);
 for(const [k,r] of b.liquidSubV22){assert.ok(Math.abs((a.liquidSubV22.get(k)?.a||0)-r.a)<1e-10);assert.ok(Math.abs((c.liquidSubV22.get(k)?.a||0)-r.a)<1e-10)}
 c.updateLiquids(10000);assert.equal(c.liquidStepsV29,120);assert.ok(Math.abs(mass(c)-12)<1e-9);
 console.log('PASS oil fixed-step behavior at 30/60/144 Hz and hidden-tab pause');
}
{
 const s=world(),amounts=[.752398231,1.012398754,1e-8,8.24681935],types=['water','lava','oil'];
 for(const [code,kind] of types.entries())for(const [index,a] of amounts.entries())s.liquidSubV22.set(`${code},${index}`,{x:code,y:index,kind,a});
 const expected=Object.fromEntries(types.map(kind=>[kind,mass(s,kind)]));
 for(let i=0;i<20;i++){s.saveGame();s.restoreDynamicState(JSON.parse(s.localStorage.getItem()))}
 const data=JSON.parse(s.localStorage.getItem());
 for(const [code,kind] of types.entries()){
  assert.ok(data.liquidSubV22.filter(r=>r[2]===code).length===amounts.length,'each liquid retains its persistent type');
  assert.ok(Math.abs(mass(s,kind)-expected[kind])<1e-12,'repeated saves preserve fractional, compressed and shallow liquid volumes');
 }
 data.liquidSubV22.push([99,99,3,10000],[98,98,'oil',10000]);s.restoreDynamicState(data);
 assert.equal(s.liquidSubRecV22(99,99),null);assert.equal(s.liquidSubRecV22(98,98),null);assert.equal(data.inv.wood,7);
 s.restoreDynamicState({liquidSubV22:[[3,6,0,7523],[7,8,1,10123],[9,12,2,9143]]});
 assert.equal(s.liquidSubRecV22(3,6).a,.7523);assert.equal(s.liquidSubRecV22(7,8).a,1.0123);assert.equal(s.liquidSubRecV22(9,12).a,.9143);
 assert.equal(s.liquidSubRecV22(3,6).kind,'water');assert.equal(s.liquidSubRecV22(7,8).kind,'lava');assert.equal(s.liquidSubRecV22(9,12).kind,'oil');
 console.log('PASS all-liquid precision across repeated saves, legacy integer rows, type whitelist and inventory');
}
{
 const cells=world();cells.restoreDynamicState({liquidCellsV18:[[2,3,'oil',.6],[3,3,'water',.5],[4,3,'lava',.4],[5,3,'unknown',1]]});
 assert.ok(Math.abs(mass(cells,'oil')-2.4)<1e-10);assert.equal(mass(cells,'water'),2);assert.ok(Math.abs(mass(cells,'lava')-1.6)<1e-10);assert.equal(mass(cells,'unknown'),0);
 const particles=world();particles.restoreDynamicState({fluids:[{x:64,y:96,kind:'oil'},{x:96,y:96,kind:'unknown'}]});
 assert.ok(Math.abs(mass(particles,'oil')-.88)<1e-10);assert.equal(mass(particles,'unknown'),0);
 console.log('PASS legacy liquid-cell and particle migration preserves recognized types only');
}
function useProductionReaction(s){
 const source=read('game-v28-resources-obsidian.txt'),start=source.indexOf('liquidReactV22=function(now)');
 vm.runInContext(source.slice(start,source.indexOf('window.__skyStackResourceDebug',start)),s);
 s.ctr=n=>(n+.5)*32;
 s.liquidClearWorldCellV28=(x,y)=>{for(let dx=0;dx<2;dx++)for(let dy=0;dy<2;dy++)s.liquidSubV22.delete(s.key(x*2+dx,y*2+dy))};
 s.createObsidian=(x,y)=>{const r={material:'obsidian'};s.grid.set(s.key(Math.floor(x/32),Math.floor(y/32)),r);return r};
}
{
 for(const other of ['water','lava']){
  const s=world();s.generated.add(0);useProductionReaction(s);s.liquidSubPutV22(4,5,'oil',1);s.liquidSubPutV22(4,6,other,1);s.liquidReactV22(1000);
  assert.equal(s.grid.size,0);assert.equal(mass(s,'oil'),1);assert.equal(mass(s,other),1);
 }
 const s=world();s.generated.add(0);useProductionReaction(s);s.liquidSubPutV22(4,5,'water',1);s.liquidSubPutV22(4,6,'lava',1);s.liquidSubPutV22(5,6,'oil',1);s.liquidReactV22(1000);
 assert.equal(s.grid.size,0);assert.equal(mass(s,'oil'),1,'oil sharing the lava world cell is not destroyed');
 s.liquidSubV22.delete('5,6');s.liquidReactV22(2000);assert.equal(s.grid.get('2,3').material,'obsidian');
 const separate=world();tank(separate);separate.liquidSubPutV22(2,19,'oil',1);separate.liquidSubPutV22(3,19,'water',1);step(separate,10);assert.equal(separate.liquidSubRecV22(3,19).kind,'water');assert.ok(Math.abs(mass(separate,'oil')-1)<1e-10);
 console.log('PASS oil has no water/lava reaction or overwrites, normal obsidian still works');
}
{
 function boot(s){s.gen(0);s.restoreDynamicState(s.initialSave);return s}
 const a=boot(world()),b=boot(world());assert.ok(mass(a,'oil')>0,'fresh starting chunk has natural oil');
 assert.equal(JSON.stringify([...a.liquidSubV22]),JSON.stringify([...b.liquidSubV22]),'generation is deterministic');
 const d=a.oilPocketDefV69(0);assert.ok(d.cells.every(([x,y])=>!a.grid.has(a.key(x,y))),'oil occupies real excavatable cavities');
 assert.ok(a.pocketDefs(0).some(p=>p.kind==='oil'),'normal pocket discovery finds oil');
 a.liquidSubV22.clear();a.saveGame();const data=JSON.parse(a.localStorage.getItem());
 const reloaded=boot(world(data));assert.equal(mass(reloaded,'oil'),0,'drained oil never replenishes on reload');
 assert.ok(d.cells.every(([x,y])=>!reloaded.grid.has(reloaded.key(x,y))),'empty saved cavities remain empty');
 assert.equal(reloaded.saveOilV69().pockets.length,1);
 console.log('PASS deterministic natural generation, saved cavities and depletion across reload');
}
{
 const probe=world(),d=probe.oilPocketDefV69(0),[x,y]=d.cells[0],bounds=probe.oilPocketBoundsV69(d,1);
 for(const scenario of ['removed','damage','placed','product','worker','structure','liquid','ring']){
  const data=scenario==='removed'?{removed:[x+','+y]}:scenario==='damage'?{damage:[[x+','+y,1]]}:null;
  const s=world(data);s.gen(0);
  const occupied={bounds:{min:{x:x*32,y:y*32},max:{x:(x+1)*32,y:(y+1)*32}},game:{placed:true}};
  if(scenario==='placed')s.bs.add(occupied);
  if(scenario==='worker')s.miners.add(occupied);
  if(scenario==='structure')s.structureBodiesV47.set(1,occupied);
  if(scenario==='product')s.grid.get(s.key(x,y)).game.worldProduct=true;
  if(scenario==='liquid')s.liquidSubPutV22(x*2,y*2,'water',1);
  if(scenario==='ring')s.removedTerrain.add(s.key(bounds.min.x,bounds.min.y));
  // Test migration after old dynamic state has already restored in this fixture.
  const before=s.grid.size;assert.equal(s.oilEnsureChunkV69(0),false,scenario+' blocks unsafe generation');
  assert.equal(s.grid.size,before,scenario+' never changes old terrain');assert.equal(mass(s,'oil'),0);
  assert.ok(s.saveOilV69().checked.includes(0));assert.equal(s.oilEnsureChunkV69(0),false,'candidate is never repeatedly reseeded');
 }
 const old=world({inv:{wood:7}});old.gen(0);old.restoreDynamicState(old.initialSave);assert.ok(mass(old,'oil')>0,'unmodified old underground may gain a deposit safely');
 console.log('PASS safe old-save migration preserves excavations, damage, bodies, liquids and boundaries');
}
{
 const s=world();s.generated.add(0);s.liquidSubPutV22(0,0,'oil',1);
 const q={position:{x:8,y:8},bounds:{min:{x:1,y:0},max:{x:15,y:15}}};
 assert.equal(s.minerExposureV42(q).underwater,true);assert.equal(s.minerExposureV42(q).lava,false);
 s.liquidSubV22.clear();s.liquidSubPutV22(0,0,'oil',.1);assert.equal(s.minerExposureV42(q).underwater,false,'wading does not consume air');
 assert.equal(s.bucketLiquidsV68.oil,'Oil');
 console.log('PASS Worker oil immersion uses air and never fire; bucket type registered');
}
{
 const s=world();s.liquidSubPutV22(0,0,'oil',.9);s.autosaveCallback();
 let data=JSON.parse(s.localStorage.getItem());assert.equal(data.liquidSubV22[0][2],2);assert.ok(data.oilV69,'autosave uses the later oil wrapper');
 s.liquidSubRecV22(0,0).a=.4;s.events.pagehide();data=JSON.parse(s.localStorage.getItem());assert.equal(data.liquidSubV22[0][3],4000,'pagehide saves current oil state');
 s.liquidSubRecV22(0,0).a=.2;s.document.hidden=true;s.events.visibilitychange();data=JSON.parse(s.localStorage.getItem());assert.equal(data.liquidSubV22[0][3],2000);
 console.log('PASS captured startup timer, pagehide and hidden-tab callbacks retain full liquid saves');
}
{
 const s=world();s.generated.add(0);
 vm.runInContext(`
 var bucketBagV68={bucket:1},hotbarItemsV68=['bucket',null,null],hotbarIndexV68=3,seenItemsV68=new Set(),tool='bucket';
 var isBucketV68=item=>item==='bucket'||item.startsWith('bucket:'),countItemV68=item=>bucketBagV68[item]||0,toast=()=>{},ui=()=>{},Query={point:()=>[],region:()=>[]};
 `,s);
 const source=read('game-v68-hotbar.txt');vm.runInContext(source.slice(source.indexOf('function bucketActionV68(')),s);
 for(let y=0;y<2;y++)for(let x=0;x<2;x++)s.liquidSubPutV22(x,y,'oil',1);
 assert.equal(s.bucketActionV68('bucket',{x:8,y:8}),true);assert.equal(mass(s,'oil'),0);assert.equal(s.bucketBagV68['bucket:oil'],1);assert.equal(s.hotbarItemsV68[0],'bucket:oil');
 assert.equal(s.bucketActionV68('bucket:oil',{x:72,y:8}),true);assert.equal(mass(s,'oil'),4);assert.equal(s.bucketBagV68.bucket,1);assert.equal(s.hotbarItemsV68[0],'bucket');
 s.liquidSubPutV22(0,0,'oil',.5);const before=JSON.stringify([...s.liquidSubV22]);assert.equal(s.bucketActionV68('bucket',{x:8,y:15}),false,'insufficient disconnected oil is rejected atomically');assert.equal(JSON.stringify([...s.liquidSubV22]),before);assert.equal(s.bucketBagV68.bucket,1);
 let icon=null;s.ButtonwoodArt.extractionIcon=item=>{icon=item;return{toDataURL:()=>item}};assert.equal(s.itemImageV68('bucket:oil'),'bucket:oil');assert.equal(icon,'bucket:oil');
 console.log('PASS real oil bucket fill/pour conservation, atomic failure, slot updates and native icon dispatch');
}
