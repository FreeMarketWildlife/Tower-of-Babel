const {chromium}=require('playwright'),assert=require('node:assert/strict');
const url=process.env.SKY_TEST_URL||'http://127.0.0.1:8774/tower-of-babel/';
const hook=`window.oilTest={
 ledger:saveOilV69,save:saveGame,exposure:minerExposureV42,
 volume(){return [...liquidSubV22.values()].filter(r=>r.kind==='oil').reduce((n,r)=>n+r.a,0)},
 source(){return [...liquidSubV22.values()].find(r=>r.kind==='oil'&&r.a>.5)},
 scoop(){const r=this.source();bucketBagV68.bucket=1;hotbarItemsV68[0]='bucket';hotbarIndexV68=3;tool='bucket';return bucketActionV68('bucket',{x:(r.x+.5)*16,y:(r.y+1-r.a*.5)*16})},
 look(){const r=this.source();cam.x=(r.x+.5)*16;cam.y=(r.y+.5)*16;cam.z=2;ctx.setTransform(DPR,0,0,DPR,0,0);bg();for(const z of bs)draw(z);drawMappedLiquids(performance.now());return{kind:liquidPointV42((r.x+.5)*16,(r.y+1-r.a*.5)*16),colors:ButtonwoodArt.liquidColors.oil}},
 image(){const c=ButtonwoodArt.extractionIcon('bucket:oil');return {width:c.width,height:c.height,url:itemImageV68('bucket:oil')}},
 get buckets(){return {...bucketBagV68}}
};`;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.SKY_TEST_BROWSER?{executablePath:process.env.SKY_TEST_BROWSER}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('restoreDynamicState(initialSave);','restoreDynamicState(initialSave);'+hook)})});
  const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.oilTest,null,{polling:100})};await load();
  const initial=await page.evaluate(()=>oilTest.volume());assert.ok(initial>0,'ordinary new game creates real underground oil');
  assert.ok((await page.evaluate(()=>oilTest.ledger())).pockets.includes(0),'starting camera region has oil');
  assert.equal(await page.evaluate(()=>oilTest.scoop()),true);assert.ok(Math.abs(await page.evaluate(()=>oilTest.volume())-(initial-4))<1e-8);
  assert.equal((await page.evaluate(()=>oilTest.buckets))['bucket:oil'],1);
  let result=await page.evaluate(()=>oilTest.look());assert.equal(result.kind,'oil');assert.deepEqual(result.colors,['#675f72','#8b8290','#49313f']);
  const icon=await page.evaluate(()=>oilTest.image());assert.equal(icon.width,32);assert.equal(icon.height,32);assert.ok(icon.url.startsWith('data:image/png'));
  await page.evaluate(()=>oilTest.save());await load();assert.ok(Math.abs(await page.evaluate(()=>oilTest.volume())-(initial-4))<1e-8,'reload preserves extraction without replenishing oil');
  assert.equal((await page.evaluate(()=>oilTest.buckets))['bucket:oil'],1);await page.evaluate(()=>oilTest.look());assert.deepEqual(errors,[]);
  if(process.env.SKY_TEST_SCREENSHOT)await page.screenshot({path:process.env.SKY_TEST_SCREENSHOT});
  console.log('PASS actual loader: natural oil, bucket extraction, palette rendering, native icon, save/reload and no runtime errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
