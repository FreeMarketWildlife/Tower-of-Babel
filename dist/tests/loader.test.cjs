const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),loader=fs.readFileSync(path.join(root,'game-v28.js'),'utf8');
async function load(search=''){
 const fetches=[],evaluations=[],errors=[];
 const scope={URLSearchParams,Map,Promise,location:{search},console:{error:(...args)=>errors.push(args.join(' '))},document:{createElement:()=>({}),head:{append(){}},getElementById:()=>null},fetch:async url=>{
  fetches.push({url,evaluations:evaluations.length});const file=path.join(root,url.split('?')[0]);
  return{ok:fs.existsSync(file),status:fs.existsSync(file)?200:404,text:async()=>fs.readFileSync(file,'utf8')};
 },eval:source=>{new vm.Script(source);evaluations.push(source)}};
 vm.runInNewContext(loader,scope);
 for(let n=0;n<300&&!evaluations.some(s=>s.includes('const SAVE_KEY='))&&!errors.length;n++)await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(errors,[]);assert(evaluations.length>20,'all native modules and final gameplay source compile');
 assert.equal(new Set(fetches.map(f=>f.url)).size,fetches.length,'each module fetched once');
 assert.deepEqual(fetches.filter(f=>f.evaluations>0),[],'all independent module reads start before evaluation');
 return evaluations.at(-1);
}
(async()=>{
 const normal=await load();assert(normal.includes("const SAVE_KEY='skyStack.save.v1';"));
 for(const [query,key]of [['?sample=buttonwood','tower.buttonwood.sample.v1'],['?demo=moonfire','tower.moonfire.survival-demo.v2'],['?demo=sound','tower.sound.demo.v1']]){
  const source=await load(query);assert(source.includes("const SAVE_KEY='"+key+"';"));assert(!source.includes("const SAVE_KEY='skyStack.save.v1';"));
 }
 console.log('PASS complete parallel module prefetch, one read per module, production compilation and four isolated save keys');
})().catch(e=>{console.error(e);process.exitCode=1});
