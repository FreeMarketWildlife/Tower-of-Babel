// Actual production adapter + world/save helpers in a deterministic, DOM-free world.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const Network=require('../extraction-network.js');
function fixture(kind){
 const s={console,performance:{now:()=>0},window:{},ExtractionNetwork:Network,localStorage:{getItem:()=>null,setItem:()=>{}}};vm.createContext(s);
 vm.runInContext(read('tests/liquid-fixture.js'),s);
 vm.runInContext(read('game-v22-liquid-engine.txt'),s);
 vm.runInContext(`
 var structuresV46=[{id:1,type:'pumpjack',x:0,y:-96,paused:false},{id:2,type:'tank',x:128,y:-96,liquidAmount:0,liquidKind:null}];
 var STRUCTURES_V46={pumpjack:{w:4,h:3},tank:{w:3,h:3}};
 function stepStructuresV46(){} function saveStructuresV46(){return {buildings:structuresV46.map(b=>({...b}))}}
 function restoreDynamicState(s){structuresV46=s.structuresV46.buildings.map(b=>({id:b.id,type:b.type,x:b.x,y:b.y,paused:b.paused}));liquidSubV22.clear();for(const r of s.liquidSubV22)liquidSubV22.set(key(r.x,r.y),{...r})}
 function packStructureV46(){} function validStructureV46(){return ''}
 `,s);
 vm.runInContext(read('game-v70-extraction.txt').split('// Compact equipment controls')[0],s);
 s.liquidV22Init();vm.runInContext(`pipesV70.set('1,0',{x:1,y:0});pipesV70.set('1,1',{x:1,y:1});pipeBagV70=9;`,s);
 s.liquidSeedTileV22(1,1,kind,.25);
 return s;
}
const state=s=>JSON.parse(vm.runInContext('JSON.stringify({buildings:structuresV46,pipes:[...pipesV70],bag:pipeBagV70,result:extractionResultV70,world:[...liquidSubV22.values()]})',s));
for(const kind of Network.KINDS){
 const s=fixture(kind),before=state(s).world;
 for(let i=0;i<128;i++)s.stepStructuresV46(250);
 let current=state(s);assert.equal(current.buildings[1].liquidAmount,32);assert.equal(current.buildings[1].liquidKind,kind);assert.deepEqual(current.world,before);
 s.stepStructuresV46(250);assert.equal(state(s).result.pumps[0].status,'full');
 const saved=JSON.parse(vm.runInContext('JSON.stringify({structuresV46:saveStructuresV46(),liquidSubV22:[...liquidSubV22.values()]})',s));s.restoreDynamicState(saved);
 current=state(s);assert.equal(current.buildings[1].liquidAmount,32);assert.deepEqual(current.world,before);assert.equal(current.bag,9);assert.equal(current.pipes.length,2);
 vm.runInContext('structuresV46[1].liquidAmount=0;structuresV46[1].liquidKind=null',s);s.stepStructuresV46(1000);assert.equal(state(s).buildings[1].liquidAmount,1);assert.deepEqual(state(s).world,before);
 s.liquidSubV22.clear();s.stepStructuresV46(1000);assert.equal(state(s).result.pumps[0].status,'dry');assert.equal(state(s).buildings[1].liquidAmount,1);
 console.log('PASS production '+kind+' direct ports, repeated unlimited pumping, full storage, save/reload and destroyed source');
}
{
 const s=fixture('water');vm.runInContext('structuresV46[1].x+=32',s);s.stepStructuresV46(1000);assert.equal(state(s).result.pumps[0].status,'no-outlet');
 vm.runInContext("pipesV70.set('4,-1',{x:4,y:-1})",s);s.stepStructuresV46(1000);assert.equal(state(s).buildings[1].liquidAmount,1);
 vm.runInContext('structuresV46[1].y-=32',s);s.stepStructuresV46(1000);assert.equal(state(s).result.pumps[0].status,'no-tank');
 console.log('PASS production gap needs a pipe; misaligned ports do not connect');
}
{
 const s=fixture('water');s.liquidSubV22.clear();s.liquidSubPutV22(2,3,'water',1);s.liquidSubPutV22(2,4,'lava',1);
 const source=read('game-v28-resources-obsidian.txt'),start=source.indexOf('liquidReactV22=function(now)');
 vm.runInContext(source.slice(start,source.indexOf('window.__skyStackResourceDebug',start)),s);
 s.ctr=n=>(n+.5)*32;s.liquidClearWorldCellV28=(x,y)=>{for(let dx=0;dx<2;dx++)for(let dy=0;dy<2;dy++)s.liquidSubV22.delete(s.key(x*2+dx,y*2+dy))};
 s.createObsidian=(x,y)=>{s.grid.set(s.key(Math.floor(x/32),Math.floor(y/32)),{material:'obsidian'})};
 s.stepStructuresV46(500);assert.equal(state(s).buildings[1].liquidAmount,.5);
 s.liquidReactV22(1000);s.stepStructuresV46(500);assert.equal(state(s).result.pumps[0].status,'dry');assert.equal(state(s).buildings[1].liquidAmount,.5);assert.equal(state(s).world.length,0);
 console.log('PASS actual water/lava reaction still consumes water and stops the pump');
}
