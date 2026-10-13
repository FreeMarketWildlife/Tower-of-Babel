const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),sandbox={window:{ButtonwoodArt:{palette:{}}}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'buttonwood/critters/wildlife-idles/sprites.js'),'utf8'),sandbox);
const source=fs.readFileSync(path.join(root,'game-v71-wildlife.txt'),'utf8').split('function cageAnimalsV71')[0];
vm.runInContext(`
const ButtonwoodArt=window.ButtonwoodArt,B=32,structuresV46=[],bucketBagV68={},generated=new Set(),cam={x:0};
let skySeedV62=7;
${fs.readFileSync(path.join(root,'game-v62-sky.txt'),'utf8').match(/function skyHashV62[^\n]+/)[0]}
${source}
wildlifeSeedReadyV71=true;
window.checkSpawns=seed=>{
 skySeedV62=seed;wildlifeV71=[];wildlifeHabitatsV71.clear();generated.clear();wildlifeNextIdV71=0;
 let baseline=0;
 for(let ch=-1500;ch<1500;ch++){
  baseline+=wildlifeHashV71(ch,901)<.35?2:1;
  generated.add(ch);cam.x=(ch+.5)*24*B;seedWildlifeV71();
 }
 const before=JSON.stringify(wildlifeV71);seedWildlifeV71();
 return {baseline,count:wildlifeV71.length,habitats:wildlifeHabitatsV71.size,
  kinds:Object.keys(WILDLIFE_SPECIES_V71),seen:[...new Set(wildlifeV71.map(a=>a.species))],
  stable:before===JSON.stringify(wildlifeV71),animals:wildlifeV71.map(a=>({...a}))};
};`,sandbox);
for(const seed of [7,42,123456]){
 const result=sandbox.window.checkSpawns(seed);
 assert.equal(result.kinds.length,31);
 assert.deepEqual([...result.seen].sort(),[...result.kinds].sort(),'every species spawns through the real natural seeder');
 assert.ok(result.count/result.baseline>.23&&result.count/result.baseline<.27,'density is about 25% of previous population');
 assert.equal(result.habitats,3000,'empty habitats are remembered');
 assert.ok(result.stable,'revisits never duplicate or reroll animals');
 assert.ok(result.animals.filter(a=>a.species==='firefly').every(a=>a.nocturnal),'natural fireflies are nocturnal');
 assert.equal(JSON.stringify(sandbox.window.checkSpawns(seed).animals),JSON.stringify(result.animals),'world seed reproduces the population');
 console.log(`PASS seed ${seed}: all 31 species naturally, ${result.count}/${result.baseline} former spawns, stable empty habitats`);
}
