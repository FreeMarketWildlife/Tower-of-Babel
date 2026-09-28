// Review actual native scenery and sprites through the production loader.
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const url=process.env.SKY_TEST_URL||'http://127.0.0.1:8793/tower-of-babel/';
const hook=`window.biomeReview={
 set(x,seconds=90,z=1){Object.assign(cam,{x,y:-160,z,anim:false});cameraSpringActiveV24=false;Object.assign(settlementV55,{day:2,phase:seconds>=180?'night':'day',elapsed:(seconds>=180?seconds-180:seconds)*1000})},
 get seed(){return skySeedV62},screen:w2s,render(){ctx.setTransform(DPR,0,0,DPR,0,0);bg();for(const z of bs)draw(z);drawMappedLiquids(performance.now());for(const q of miners)drawMiner(q,performance.now());drawGoldBursts(performance.now())},
 save:saveGame,get world(){return JSON.stringify({inv,terrain:[...grid].map(([k,v])=>[k,v.game?.material]),clock:settlementV55,structures:structuresV46})}
};`;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('restoreDynamicState(initialSave);','restoreDynamicState(initialSave);'+hook)})});
  await page.goto(url);await page.waitForFunction(()=>window.biomeReview,null,{polling:100});
  const initial=await page.evaluate(()=>({seed:biomeReview.seed,region:ButtonwoodBiomes.regionAt(biomeReview.seed,0)}));
  assert.equal(initial.region.id,'mountains');
  const centers=await page.evaluate(()=>{
   const B=ButtonwoodBiomes,seed=biomeReview.seed,result={};
   for(let x=-15000;x<15000;x+=512){const r=B.regionAt(seed,x);result[r.id]=(r.start+r.end)/2}return result;
  });
  assert.deepEqual(Object.keys(centers).sort(),['jungle','mountains','ocean','plains']);
  for(const [id,x]of Object.entries(centers))for(const seconds of [90,165,210]){
   const result=await page.evaluate(({id,x,seconds})=>{
    biomeReview.set(x,seconds,1.15);const before=biomeReview.world;biomeReview.render();
    const A=ButtonwoodArt,canvas=document.createElement('canvas');canvas.width=640;canvas.height=320;
    const g=canvas.getContext('2d'),options={width:640,height:320,ground:286,camX:x,seconds,day:2,biomeSeed:biomeReview.seed,biomeWeights:{[id]:1}};
    A.paintSky(g,options);const first=canvas.toDataURL();A.paintSky(g,options);const repeat=canvas.toDataURL();A.paintSky(g,{...options,camX:x+200});
    return {pure:before===biomeReview.world,deterministic:first===repeat,parallax:first!==canvas.toDataURL(),image:first};
   },{id,x,seconds});
   assert.ok(result.pure&&result.deterministic&&result.parallax,id+' deterministic parallax without gameplay mutation');
   if(process.env.BIOME_SCREENSHOT_DIR){fs.mkdirSync(process.env.BIOME_SCREENSHOT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.BIOME_SCREENSHOT_DIR,id+'-'+seconds+'.png'),Buffer.from(result.image.split(',')[1],'base64'))}
  }
  await page.evaluate(()=>biomeReview.save());await page.reload();await page.waitForFunction(()=>window.biomeReview,null,{polling:100});
  assert.equal(await page.evaluate(()=>biomeReview.seed),initial.seed,'geography uses persistent world seed');
  assert.deepEqual(await page.evaluate(()=>ButtonwoodBiomes.regionAt(biomeReview.seed,0)),initial.region);
  await page.goto(url+'buttonwood/');await page.waitForFunction(()=>window.ButtonwoodArt?.wildlifeSprite,null,{polling:100});
  // Step the shared gallery loop once; all art stays at its authored size.
  for(const viewport of [{width:1100,height:820},{width:390,height:844},{width:320,height:568}]){
   await page.setViewportSize(viewport);
   await page.waitForTimeout(60);
   const sizes=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,icons:[...document.querySelectorAll('#wildlife-icons canvas')].map(c=>({w:c.width,h:c.height,cssW:c.getBoundingClientRect().width,cssH:c.getBoundingClientRect().height}))}));
   assert.equal(sizes.overflow,false,'gallery fits '+viewport.width);
   assert.equal(sizes.icons.length,9);assert.ok(sizes.icons.every(s=>s.w===32&&s.h===32&&s.cssW===32&&s.cssH===32));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS four seeded biome views, persistent spawn geography, moving parallax, render purity, day/twilight/night and native responsive gallery');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
