'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:8775/tower-of-babel/';
// Inject only a test seam into the real loader: exposure, excavation, sprites,
// wildlife drawing and the final scene composition all remain production code.
const hook = `window.fogTest = {
 fresh(){
  for(const d of document.querySelectorAll('dialog[open]'))d.close();
  stopPointerV52();World.clear(eng.world,false);Engine.clear(eng);
  bs.clear();grid.clear();miners.clear();structureBodiesV47.clear();structuresV46.length=0;
  removedTerrain.clear();terrainDamage.clear();naturalOpen.clear();revealedPockets.clear();
  liquidSubV22.clear();fluids.clear();goldBursts.length=0;wildlifeV71=[];wildlifeClockV71=0;
  pipesV70.clear();pipeHoverV70=null;tool='pick';gesture=null;
  pocketCache.clear();oilPocketChunksV69.clear();
  for(let ch=-8;ch<=8;ch++)pocketCache.set(ch,[]);
  for(let x=-40;x<=40;x++)for(let y=0;y<=26;y++)mk(ctr(x),ctr(y),'dirt',{terrain:true,static:true,cx:x,cy:y});
  Object.assign(cam,{x:0,y:190,z:1,anim:false});cameraSpringActiveV24=false;
  Object.assign(settlementV55,{day:1,phase:'day',elapsed:90000});
 },
 prepare:fogPrepareV72,layer:fogLayerV72,
 exposed(x,y){return terrainExposed(grid.get(key(x,y)))},
 mine(x,y){const z=grid.get(key(x,y));if(!z||!terrainExposed(z))throw Error('fixture mining needs exposure');harvest(z);goldBursts.length=0},
 remove(x,y){const k=key(x,y),z=grid.get(k);if(z){grid.delete(k);bs.delete(z);World.remove(eng.world,z)}},
 open(x,y){this.remove(x,y);removedTerrain.add(key(x,y))},
 refill(x,y){return createObsidian(ctr(x),ctr(y))?.game.material},
 get counts(){return {grid:grid.size,bodies:bs.size,removed:removedTerrain.size}},
 pocket(x,y){const d={id:'fog-test-pocket',kind:'water',surface:false,cells:[[x,y]]};pocketCache.set(Math.floor(x/24),[d]);this.remove(x,y);naturalOpen.add(key(x,y));return d.id},
 reveal(x,y){revealPocket(pocketForCell(x,y))},
 place(x,y){mk(ctr(x),ctr(y),'wood',{placed:true,static:true})},
 mineral(type,x,y){const g=grid.get(key(x,y)).game;g.material='stone';g.resourceType=type;g.resourceAmount=1},
 animal(species,x,y){const a=wildlifeNewV71(species,{x:ctr(x),y:(y+1)*B-2});wildlifeV71.push(a);return a.id},
 clearAnimals(){wildlifeV71=[]},
 night(value){Object.assign(settlementV55,{phase:value?'night':'day',elapsed:value?30000:90000});return bwSkyState().phase},
 camera(x,y,z){Object.assign(cam,{x,y,z,anim:false});cameraSpringActiveV24=false},
 render(withFog=true){
  const paint=fogPaintV72;if(!withFog)fogPaintV72=()=>{};
  try{ctx.setTransform(DPR,0,0,DPR,0,0);bg();for(const z of bs)draw(z);drawMappedLiquids(0);for(const q of miners)drawMiner(q,0);drawGoldBursts(0)}finally{fogPaintV72=paint}
 },
 pixels(x,y){const s=w2s(x*B,y*B);return Array.from(ctx.getImageData(Math.round(s.x*DPR),Math.round(s.y*DPR),Math.round(B*cam.z*DPR),Math.round(B*cam.z*DPR)).data)},
 comparison(x,y){this.render(false);const before=this.pixels(x,y);this.render();return {before,after:this.pixels(x,y),layer:fogLayerV72(x,y)}},
 pipeGuide(x,y){
  pipeBagV70=20;generated.add(Math.floor(x/24));tool='pipeV70';pipeHoverV70={x:ctr(x),y:ctr(y)};
  this.render();const before=this.pixels(x,y);preview();const after=this.pixels(x,y);
  tool='pick';pipeHoverV70=null;return {before,after,layer:fogLayerV72(x,y)};
 },
 benchmark(){
  this.camera(0,190,.72);for(let i=0;i<30;i++)fogPrepareV72();
  const field=fogFieldV72,times=[];
  for(let i=0;i<100;i++){const start=performance.now();fogPrepareV72();times.push(performance.now()-start)}
  times.sort((a,b)=>a-b);return {meanMs:times.reduce((a,b)=>a+b,0)/times.length,p95Ms:times[94],cells:field.layers.length,width:field.width,height:field.height,reused:field===fogFieldV72};
 },
 seam(z){
  this.camera(-6.25,190.5,z);ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#bda083';ctx.fillRect(0,0,W,HH);fogPrepareV72();fogPaintV72();
  const s=w2s(0,ctr(5));return Array.from(ctx.getImageData(20,Math.round(s.y*DPR),Math.round((W-40)*DPR),1).data);
 },
 get world(){return JSON.stringify({inv,grid:[...grid].map(([k,z])=>[k,z.game.material,z.game.hits,z.position.x,z.position.y]),removed:[...removedTerrain],damage:[...terrainDamage],natural:[...naturalOpen],revealed:[...revealedPockets],liquid:[...liquidSubV22],animals:skyStackWildlife.state,structures:structuresV46,workers:[...miners].map(q=>q.game)})}
};`;
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
function assertAttenuation(result, shade, opacity, label) {
  let changed = 0;
  for (let i = 0; i < result.before.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const expected = result.before[i + c] * (1 - opacity) + shade[c] * opacity;
      assert.ok(Math.abs(result.after[i + c] - expected) <= 2, label + ' shares one world-layer attenuation');
      if (result.before[i + c] !== result.after[i + c]) changed++;
    }
    assert.equal(result.after[i + 3], 255, 'scene remains opaque');
  }
  if (opacity) assert.ok(changed > result.before.length / 2, label + ' is visibly darkened');
  else assert.deepEqual(result.after, result.before, label + ' exposed pixels remain unchanged');
}
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.SKY_TEST_BROWSER || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    const page = await browser.newPage({viewport: {width: 1100, height: 820}, deviceScaleFactor: 1});
    const errors = [];
    const setViewport = async viewport => {
      await page.setViewportSize(viewport);
      await page.waitForFunction(({width,height}) => {
        const game=document.getElementById('game'),dpr=Math.min(devicePixelRatio||1,2);
        return innerWidth===width&&innerHeight===height&&game.width===width*dpr&&game.height===height*dpr;
      },viewport,{polling:25});
      // resize clears the canvas; let all viewport listeners settle before the
      // explicit frame, since this fixture disables the ordinary animation loop.
      await page.waitForTimeout(60);
    };
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {window.requestAnimationFrame = () => 0});
    await page.route('**/game-v8-part3.txt*', async route => {
      const response = await route.fetch();
      await route.fulfill({response, body: (await response.text()).replace('restoreDynamicState(initialSave);', 'restoreDynamicState(initialSave);' + hook)});
    });
    await page.goto(url);
    await page.waitForFunction(() => window.fogTest && window.ButtonwoodArt?.burialFog, null, {polling: 100});
    await page.evaluate(() => fogTest.fresh());
    const color = rgb(await page.evaluate(() => ButtonwoodArt.palette.buriedShade));
    const opacity = await page.evaluate(() => Array.from({length: 11}, (_, i) => ButtonwoodArt.burialFog.opacity(i)));
    const layers = await page.evaluate(() => {fogTest.prepare();return Array.from({length: 14}, (_, y) => ({layer: fogTest.layer(-6, y), exposed: fogTest.exposed(-6, y)}))});
    assert.deepEqual(layers.map(x => x.layer), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]);
    assert.deepEqual(layers.map(x => x.exposed), [true, ...Array(13).fill(false)], 'fog agrees with authoritative mineability');
    for (const layer of [0, 1, 2, 5, 9, 10]) {
      const result = await page.evaluate(y => fogTest.comparison(-6, y), layer);
      assert.equal(result.layer, layer);
      assertAttenuation(result, color, opacity[layer], 'terrain layer ' + layer);
      if (layer === 10) {
        const channels = result.after.filter((_v, i) => i % 4 !== 3);
        assert.ok(Math.max(...channels) < 25, 'ten layers is almost black');
        assert.ok(Math.min(...channels) > 0, 'deep terrain never becomes solid black');
      }
    }
    // Compare the actual animal sprite before/after the final scene pass. This
    // catches an overlay painted before wildlife, which would leave bright animals.
    for (const [species, layer] of [['worm', 1], ['mole', 5], ['rabbit', 10]]) {
      const bare = await page.evaluate(y => {fogTest.clearAnimals();fogTest.render(false);return fogTest.pixels(2, y)}, layer);
      const result = await page.evaluate(({species, layer}) => {fogTest.animal(species, 2, layer);return fogTest.comparison(2, layer)}, {species, layer});
      assert.ok(result.before.some((n, i) => n !== bare[i]), species + ' sprite is actually present in the measured cell');
      assertAttenuation(result, color, opacity[layer], species + ' layer ' + layer);
    }
    for (const [type, layer] of [['coal', 4], ['ironOre', 8], ['copperOre', 10]]) {
      const result = await page.evaluate(({type,layer}) => {fogTest.mineral(type,-2,layer);return fogTest.comparison(-2,layer)}, {type,layer});
      assertAttenuation(result,color,opacity[layer],type+' mineral inclusions');
    }
    assert.equal(await page.evaluate(() => fogTest.night(true)),'night','the night fixture is inside the real night phase');
    for(const layer of [0,1,5,10]) {
      const result=await page.evaluate(y=>fogTest.comparison(-6,y),layer);
      assert.equal(result.layer,layer,'night does not change burial depth');
      assertAttenuation(result,color,opacity[layer],'night terrain layer '+layer);
    }
    await page.evaluate(() => fogTest.night(false));
    const purity = await page.evaluate(() => {const before=fogTest.world;fogTest.render();fogTest.render();return before===fogTest.world});
    assert.equal(purity, true, 'rendering does not alter terrain, inventories, wildlife, liquids or saves');
    console.log('PASS real terrain layers, native-color exposure, almost-black floor, animal/ore attenuation and render purity');

    await page.evaluate(() => {fogTest.clearAnimals();fogTest.mine(-6, 0);fogTest.prepare()});
    assert.equal(await page.evaluate(() => fogTest.layer(-6, 1)), 0, 'excavation lights the next mineable block immediately');
    assert.equal(await page.evaluate(() => fogTest.layer(-6, 2)), 1);
    assertAttenuation(await page.evaluate(() => fogTest.comparison(-6, 1)), color, 0, 'newly exposed terrain');
    await page.evaluate(() => {for(let y=1;y<=5;y++)fogTest.mine(-6,y);fogTest.prepare()});
    assert.equal(await page.evaluate(() => fogTest.layer(-6, 6)), 0, 'a mined shaft carries exposure down with it');
    assert.equal(await page.evaluate(() => fogTest.layer(-6, 7)), 1);
    assert.equal(await page.evaluate(() => fogTest.layer(-5, 5)), 0, 'shaft side is mineable and fully lit');
    assert.equal(await page.evaluate(() => fogTest.layer(-4, 5)), 1, 'one intact layer beyond shaft side is shaded');

    await page.evaluate(() => {fogTest.pocket(4,12);fogTest.remove(8,12);fogTest.prepare()});
    assert.equal(await page.evaluate(() => fogTest.layer(4,12)), 10, 'an undiscovered pocket is not a light source');
    assert.equal(await page.evaluate(() => fogTest.exposed(4,11)), false, 'hidden pocket does not expose neighboring terrain');
    assert.equal(await page.evaluate(() => fogTest.layer(8,12)), 10, 'missing or ungenerated cells do not invent openings');
    await page.evaluate(() => {fogTest.reveal(4,12);fogTest.prepare()});
    assert.equal(await page.evaluate(() => fogTest.layer(4,12)), 0, 'discovered pocket becomes a known opening');
    assert.equal(await page.evaluate(() => fogTest.layer(4,11)), 0, 'pocket wall exposure matches mining');
    assert.equal(await page.evaluate(() => fogTest.layer(4,10)), 1);
    assert.equal(await page.evaluate(() => fogTest.exposed(4,11)), true, 'an open cell below exposes the ceiling');
    assert.equal(await page.evaluate(() => fogTest.exposed(5,11)), false, 'diagonal contact alone never makes a block mineable');
    assert.equal(await page.evaluate(() => fogTest.layer(5,11)), 1, 'diagonal terrain remains one buried layer beyond the exposed wall');
    assert.equal(await page.evaluate(() => fogTest.layer(5,10)), 2, 'distance increases around the ceiling corner by cardinal steps');
    const beforePlacement = await page.evaluate(() => [fogTest.layer(4,12),fogTest.layer(4,11),fogTest.exposed(4,11)]);
    await page.evaluate(() => {fogTest.place(4,12);fogTest.prepare()});
    assert.deepEqual(await page.evaluate(() => [fogTest.layer(4,12),fogTest.layer(4,11),fogTest.exposed(4,11)]), beforePlacement, 'placed blocks do not change the terrain exposure contract');
    console.log('PASS immediate excavation, shaft sides, pocket ceiling/diagonal exposure, hidden/revealed pockets, unknown cells and placed blocks');

    const swapped = await page.evaluate(() => {
      const f=fogTest;f.fresh();f.open(-12,12);f.open(12,12);f.refill(12,12);f.prepare();
      const before={counts:f.counts,left:f.layer(-12,11),right:f.layer(12,11),leftExposed:f.exposed(-12,11),rightExposed:f.exposed(12,11)};
      const refill=f.refill(-12,12);f.remove(12,12);f.prepare();
      return {refill,before,after:{counts:f.counts,left:f.layer(-12,11),right:f.layer(12,11),leftExposed:f.exposed(-12,11),rightExposed:f.exposed(12,11)}};
    });
    assert.equal(swapped.refill,'obsidian','real liquid-reaction product refills an opening');
    assert.deepEqual(swapped.before.counts,swapped.after.counts,'occupancy swap preserves collection sizes');
    assert.deepEqual([swapped.before.left,swapped.before.right,swapped.before.leftExposed,swapped.before.rightExposed],[0,10,true,false]);
    assert.deepEqual([swapped.after.left,swapped.after.right,swapped.after.leftExposed,swapped.after.rightExposed],[10,0,false,true],'cache observes same-count occupancy changes and closes the refilled light source');
    await page.evaluate(() => fogTest.fresh());
    const guide=await page.evaluate(() => fogTest.pipeGuide(0,12));
    assert.equal(guide.layer,10);
    assert.ok(Math.max(...guide.before.filter((_v,i)=>i%4!==3))<25,'guide starts over almost-black buried terrain');
    assert.ok(Math.max(...guide.after.filter((_v,i)=>i%4!==3))>100,'pipe preview stays bright above world fog');
    assert.ok(guide.after.filter((v,i)=>v!==guide.before[i]).length>100,'a real pipe placement guide was drawn');
    console.log('PASS day/night opacity, same-count obsidian occupancy invalidation and visible pipe placement guides');
    const timing=await page.evaluate(() => fogTest.benchmark());
    assert.equal(timing.reused,true,'unchanged seeds reuse the computed field');
    assert.ok(timing.cells<5000,'minimum-zoom desktop field is bounded to the padded viewport');
    console.log('INFO fog preparation 1100px / .72×, 100 warm samples: '+JSON.stringify(timing));

    await page.evaluate(() => fogTest.fresh());
    for (const viewport of [{width:1100,height:820},{width:390,height:844}]) {
      await setViewport(viewport);
      for (const z of [.7, 1, 1.15, 1.75, 2.25]) {
        const row = await page.evaluate(z => fogTest.seam(z), z);
        const first = row.slice(0,4);
        assert.ok(row.every((v,i) => v === first[i%4]), 'fog has no cell seams at ' + viewport.width + 'px / ' + z + '× zoom');
        for(let c=0;c<3;c++)assert.ok(Math.abs(first[c]-([189,160,131][c]*(1-opacity[5])+color[c]*opacity[5]))<=2, 'zoom preserves layer opacity');
      }
      if (process.env.FOG_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.FOG_SCREENSHOT_DIR,{recursive:true});
        await page.evaluate(() => {fogTest.camera(0,190,1);fogTest.animal('worm',2,1);fogTest.animal('mole',2,5);fogTest.render()});
        await page.screenshot({path:path.join(process.env.FOG_SCREENSHOT_DIR,'terrain-fog-'+viewport.width+'.png')});
      }
    }
    if(process.env.FOG_SCREENSHOT_DIR)for(const viewport of [{width:1100,height:820},{width:390,height:844}]) {
      await setViewport(viewport);
      await page.evaluate(width => {
        const f=fogTest;f.fresh();
        for(let y=0;y<=12;y++)f.mine(-3,y);
        for(let x=-2;x<=5;x++){f.mine(x,12);f.mine(x,11)}
        f.animal('worm',-2,5);f.animal('worm',0,5);f.animal('mole',3,5);f.animal('mole',7,12);
        f.mineral('ironOre',6,11);f.mineral('copperOre',2,14);
        f.camera(32,200,width<500?.75:1);f.render();
      },viewport.width);
      await page.screenshot({path:path.join(process.env.FOG_SCREENSHOT_DIR,'terrain-fog-shaft-'+viewport.width+'.png')});
    }
    assert.deepEqual(errors, [], 'production loader has no runtime errors');
    console.log('PASS desktop/phone composition and seam-free native/fractional zoom');
  } finally {await browser.close()}
})().catch(e => {console.error(e);process.exitCode=1});
