const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.SKY_TEST_URL||'http://127.0.0.1:8765/tower-of-babel/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const errors=[];
  for(const device of [
   {width:390,height:844,dpr:1,mobile:true},
   {width:1100,height:820,dpr:1,mobile:false},
   {width:320,height:568,dpr:2,mobile:true},
   {width:844,height:390,dpr:1.25,mobile:true},
   {width:430,height:932,dpr:3,mobile:true}
  ]){
   const page=await browser.newPage({viewport:{width:device.width,height:device.height},deviceScaleFactor:device.dpr,isMobile:device.mobile,hasTouch:device.mobile});
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
   // An optional old renderer proves this regression catches the reported artifact.
   if(process.env.SKY_TEST_INTEGRATION)await page.route('**/buttonwood/integration.txt',route=>route.fulfill({contentType:'text/plain',body:fs.readFileSync(process.env.SKY_TEST_INTEGRATION,'utf8')}));
   await page.route('**/game-v8-part3.txt*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('restoreDynamicState(initialSave);',`restoreDynamicState(initialSave);window.backgroundTest={
    cam,ctx,c,clock:settlementV55,bg,tick:cameraTickV24,render:()=>{ctx.globalAlpha=1;loop(performance.now())},size:()=>({W,HH,DPR}),
    set(x,y,z,seconds){Object.assign(cam,{x,y,z,anim:false});Object.assign(settlementV55,{day:4,phase:seconds>=180?'night':'day',elapsed:(seconds>=180?seconds-180:seconds)*1000});},
    frame(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=1;bg();},
    validate(){
     const width=Math.ceil(W/cam.z),height=Math.ceil(HH/cam.z),ground=Math.round(w2s(0,0).y/cam.z);
     const native=document.createElement('canvas');native.width=width;native.height=height;
     const g=native.getContext('2d'),sky=bwSkyState();
     ButtonwoodArt.paintSky(g,{width,height,ground,camX:cam.x,seconds:sky.seconds,day:settlementV55.day});
     const data=g.getImageData(0,0,width,height).data,colors=new Set();
     const rgb=(p,i)=>(p[i]<<16)|(p[i+1]<<8)|p[i+2];
     for(let i=0;i<data.length;i+=4)colors.add(rgb(data,i));
     ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=1;ctx.fillStyle='#ff00ff';ctx.fillRect(0,0,W,HH);
     ctx.globalAlpha=.37;ctx.imageSmoothingEnabled=true;
     const state=JSON.stringify({cam,clock:settlementV55}),transform=ctx.getTransform().toString();bg();
     const actual=ctx.getImageData(0,0,c.width,c.height).data;
     let invalid=0,uncovered=0,first=null;
     for(let i=0;i<actual.length;i+=4){
      if(actual[i+3]!==255)uncovered++;
      if(!colors.has(rgb(actual,i))){invalid++;if(!first)first={x:(i/4)%c.width,y:Math.floor(i/4/c.width),rgb:[...actual.slice(i,i+4)]};}
     }
     return {invalid,uncovered,first,ground,pure:state===JSON.stringify({cam,clock:settlementV55}),restored:ctx.globalAlpha===.37&&ctx.imageSmoothingEnabled&&ctx.getTransform().toString()===transform};
    }
   };`)});});
   await page.goto(url);await page.waitForFunction(()=>window.backgroundTest,null,{polling:100});
   if(device.width===390){
    await page.evaluate(()=>{backgroundTest.set(0,-180,1.15,90);backgroundTest.frame()});
    const pixels=await page.evaluate(()=>[225,226,227].map(y=>[...backgroundTest.ctx.getImageData(150,y,1,1).data]));
    // Captured pre-fix middle row was [180,189,176], darker than BOTH sky bands.
    for(let channel=0;channel<3;channel++)assert.ok(pixels[1][channel]>=Math.min(pixels[0][channel],pixels[2][channel]),'No dark line between adjacent sky bands: '+JSON.stringify(pixels));
    assert.equal(pixels[1][3],255);
    // All near-hill columns meet cleanly just above the ground, including at 1.15x.
    const hills=await page.evaluate(()=>{
     const t=backgroundTest,ground=Math.round(844/2/1.15+180),y=Math.floor((ground-2)*1.15);
     const row=t.ctx.getImageData(0,y,390,1).data;return Array.from({length:390},(_,x)=>[...row.slice(x*4,x*4+3)]);
    });
    assert.ok(hills.every(rgb=>JSON.stringify(rgb)==='[158,188,162]'),'Near hills have no vertical antialiasing seams');
    if(process.env.BACKGROUND_SCREENSHOT_DIR){
     fs.mkdirSync(process.env.BACKGROUND_SCREENSHOT_DIR,{recursive:true});
     const png=await page.locator('#game').evaluate(c=>c.toDataURL());
     fs.writeFileSync(process.env.BACKGROUND_SCREENSHOT_DIR+'/background-fixed.png',Buffer.from(png.split(',')[1],'base64'));
    }
   }
   let count=0;
   // Portrait/landscape, fractional device pixels, zoom endpoints, both sides of
   // the surface, high sky, negative horizontal camera positions, and all phases.
   for(const z of [.72,.85,1,1.15,1.55])for(const seconds of [15,90,165,210])for(const position of [0,1,2]){
    const result=await page.evaluate(({z,seconds,position})=>{
     const t=backgroundTest,{HH}=t.size();
     t.set(position===0?-417.25:position===1?2048.5:0,position===0?-180:position===1?-HH/z:HH/z,z,seconds);
     return t.validate();
    },{z,seconds,position});
    assert.equal(result.invalid,0,'Scaled scenery must retain native pixel colors '+JSON.stringify({device,z,seconds,position,result}));
    assert.equal(result.uncovered,0,'Background covers the complete frame');
    assert.ok(result.pure&&result.restored,'Rendering preserves camera, clock, and context');count++;
   }
   if(device.width===390){
    // Exercise real two-finger zoom and pan, then the actual Top/Down controls.
    await page.evaluate(()=>backgroundTest.set(0,-180,1,90));
    const cdp=await page.context().newCDPSession(page);
    const touch=points=>points.map(([x,y],id)=>({x,y,id:id+1}));
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touch([[145,422],[245,422]])});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touch([[137.5,422],[252.5,422]])});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.ok(Math.abs(await page.evaluate(()=>backgroundTest.cam.z)-1.15)<.01);
    let result=await page.evaluate(()=>backgroundTest.validate());assert.equal(result.invalid,0);
    await page.locator('[data-tool=move]').click();
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touch([[190,380]])});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touch([[270,490]])});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    result=await page.evaluate(()=>backgroundTest.validate());assert.equal(result.invalid,0);
    for(const id of ['top','down']){
     await page.locator('#'+id).click();
     for(let step=0;step<32;step++){
      result=await page.evaluate(step=>{backgroundTest.tick(performance.now()+step*16.67);return backgroundTest.validate()},step);
      assert.equal(result.invalid,0,id+' transition frame '+step);
     }
     assert.equal(await page.evaluate(()=>backgroundTest.cam.z),1);
    }
    for(const viewport of [{width:844,height:390},{width:320,height:568},{width:390,height:844}]){
     await page.setViewportSize(viewport);
     result=await page.evaluate(()=>{backgroundTest.set(-125.5,-180,.85,165);return backgroundTest.validate()});
     assert.equal(result.invalid,0,'Resizing does not retain pixels from an old frame');
     if(process.env.BACKGROUND_SCREENSHOT_DIR){
      await page.evaluate(()=>backgroundTest.render());
      await page.screenshot({path:process.env.BACKGROUND_SCREENSHOT_DIR+'/background-'+viewport.width+'.png'});
     }
    }
    await cdp.detach();console.log('PASS real pinch, touch pan, Top/Down animation, rotation and viewport resizing');
   }
   console.log('PASS '+device.width+'×'+device.height+' DPR '+device.dpr+': '+count+' full-frame native-color, coverage and render-purity checks');
   await page.close();
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
