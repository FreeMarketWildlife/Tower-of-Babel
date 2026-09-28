'use strict';
// Ground animals keep their exact release point, then settle without mining.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const url=process.env.SKY_TEST_URL||'http://127.0.0.1:8793/tower-of-babel/';
const hook=`window.groundTest={
 reset(){wildlifeV71=[];wildlifeHabitatsV71=new Set([...generated]);wildlifeClockV71=0;cam.x=0;cam.y=-180;cam.anim=false;cameraSpringActiveV24=false},
 spawn(species,x,y){const a=wildlifeNewV71(species,{x,y},0);wildlifeV71.push(a);return a.id},
 step(n=40){for(let i=0;i<n;i++)stepStructuresV46(50)},
 dig(){for(let cx=-8;cx<9;cx++)for(let cy=0;cy<3;cy++){const k=key(cx,cy),b=grid.get(k);if(b){World.remove(eng.world,b);bs.delete(b);grid.delete(k);removedTerrain.add(k)}}},
 floorBlock(){return mk(0,-64,'stone',{placed:true,static:true,w:600,h:31})},
 get terrain(){return [...grid.keys()].join('|')},save:saveGame,
 get animals(){return wildlifeV71.map(a=>({...a}))},get snapshot(){return saveStructuresV46().wildlife}
};`;
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});await page.route('**/game-v8-part3.txt*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace('restoreDynamicState(initialSave);','restoreDynamicState(initialSave);'+hook)})});const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.groundTest,null,{polling:100})};await load();
 const result=await page.evaluate(()=>{
  groundTest.reset();const terrain=groundTest.terrain;for(const [i,s]of ['rabbit','worm','mole'].entries())groundTest.spawn(s,i*32,-120);groundTest.spawn('bird',128,-120);const before=groundTest.animals;
  groundTest.step(4);const falling=groundTest.animals;groundTest.step(36);const landed=groundTest.animals;return {before,falling,landed,terrainStable:groundTest.terrain===terrain};
 });for(const a of result.before)assert.equal(a.y,-120);for(const a of result.falling.filter(a=>a.species!=='bird'))assert.ok(a.y>-120&&a.y<0);assert.equal(result.landed[0].homeY,0);assert.ok(result.landed[0].grounded);for(const a of result.landed.slice(1,3))assert.ok(a.y>=0&&a.y<16);assert.equal(result.terrainStable,true);assert.equal(result.landed[3].fallSpeed,undefined);
 const dig=await page.evaluate(()=>{groundTest.dig();const terrain=groundTest.terrain;groundTest.step(40);return {animals:groundTest.animals,terrainStable:groundTest.terrain===terrain}});assert.equal(dig.animals[0].homeY,96);assert.equal(dig.terrainStable,true);
 await page.evaluate(()=>groundTest.save());const snapshot=await page.evaluate(()=>groundTest.snapshot.animals);await load();assert.deepEqual(await page.evaluate(()=>groundTest.snapshot.animals),snapshot);
 const fallingSaved=await page.evaluate(()=>{groundTest.reset();groundTest.spawn('rabbit',0,-180);groundTest.step(3);groundTest.save();return groundTest.snapshot.animals});assert.ok(fallingSaved[0].fallSpeed>0);await load();assert.deepEqual(await page.evaluate(()=>groundTest.snapshot.animals),fallingSaved,'in-flight velocity and height survive reload');await page.evaluate(()=>groundTest.step());assert.equal(await page.evaluate(()=>groundTest.animals[0].homeY),96);
 const blocked=await page.evaluate(()=>{groundTest.reset();groundTest.floorBlock();groundTest.spawn('rabbit',0,-160);groundTest.step();return groundTest.animals[0]});assert.equal(blocked.homeY,-79.5);assert.equal(blocked.grounded,true);assert.deepEqual(errors,[]);console.log('PASS ground species immediate release, gradual drop, terrain and placed-block support, excavated floor, no terrain edits, unchanged flyer motion and save roundtrip');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
