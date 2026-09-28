'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage({viewport:{width:900,height:660}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<!doctype html><html><body style="margin:0;background:#f7e8c4"></body></html>');
  for(const name of ['palette','wildlife'])await page.addScriptTag({content:await fs.readFile(path.join(__dirname,'../buttonwood',name+'.js'),'utf8')});
  const result=await page.evaluate(()=>{
   const A=window.ButtonwoodArt,allowed=new Set(Object.values(A.palette)),species=Object.keys(A.wildlifeSizes);let checked=0;
   const demand=(v,m)=>{if(!v)throw Error(m)};
   function inspect(c,w,h,label){
    demand(c.width===w&&c.height===h,label+' dimensions');let occupied=0;
    const data=c.getContext('2d').getImageData(0,0,w,h).data;
    for(let i=0;i<data.length;i+=4){const a=data[i+3];demand(a===0||a===255,label+' alpha');if(!a)continue;occupied++;const color='#'+[data[i],data[i+1],data[i+2]].map(n=>n.toString(16).padStart(2,'0')).join('');demand(allowed.has(color),label+' palette');}
    demand(occupied>0,label+' empty');checked++;
   }
   for(const type of species){
    const s=A.wildlifeSizes[type],motion=new Set();
    for(let frame=0;frame<4;frame++)for(const direction of [-1,1]){
     const c=A.wildlifeSprite(type,{frame,direction});inspect(c,s.width,s.height,type);motion.add(c.toDataURL());
     const right=A.wildlifeSprite(type,{frame,direction:1}).getContext('2d').getImageData(0,0,s.width,s.height).data;
     if(direction<0){const left=c.getContext('2d').getImageData(0,0,s.width,s.height).data;for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++)for(let k=0;k<4;k++)demand(left[(y*s.width+x)*4+k]===right[(y*s.width+s.width-1-x)*4+k],type+' shifted mirror');}
    }
    demand(motion.size>=3,type+' missing key poses');
    inspect(A.wildlifeIcon(type),32,32,type+' icon');inspect(A.wildlifeBucketIcon(type),32,32,type+' bucket');
    demand(A.wildlifeSprite(type,{frame:4})===A.wildlifeSprite(type,{frame:0}),type+' cache and frame wrap');
   }
   for(let frame=0;frame<4;frame++)inspect(A.wildlifeSprite('mole',{frame,burrowing:true}),24,16,'burrowing mole');
   for(const [type,s]of Object.entries(A.cageSizes)){
    for(const layer of ['back','front','all'])inspect(A.cageSprite(type,{layer}),s.width,s.height,type+' '+layer);
    inspect(A.cageIcon(type),32,32,type+' miniature');
    const c=A.cageSprite(type),data=c.getContext('2d').getImageData(0,0,s.width,s.height).data;
    let clear=0;for(let y=18;y<s.height-15;y++)for(let x=9;x<s.width-9;x++)if(!data[(y*s.width+x)*4+3])clear++;
    demand(clear>((s.width-18)*(s.height-33))*.65,type+' hides its occupants');
    const composed=document.createElement('canvas');composed.width=s.width;composed.height=s.height;const g=composed.getContext('2d');g.drawImage(A.cageSprite(type,{layer:'back'}),0,0);g.drawImage(A.cageSprite(type,{layer:'front'}),0,0);
    demand(composed.toDataURL()===c.toDataURL(),type+' layer composition');
   }
   for(const unknown of ['unknown','constructor','toString']){demand(A.wildlifeSprite(unknown)===null,'unknown animal');demand(A.cageSprite(unknown)===null,'unknown cage');}
   // Native and 3x QA sheet; source art is never resized for its UI contract.
   const sheet=document.createElement('canvas');sheet.width=900;sheet.height=660;document.body.append(sheet);const g=sheet.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle=A.palette.cream;g.fillRect(0,0,900,660);g.font='14px monospace';g.fillStyle=A.palette.ink;g.fillText('Buttonwood wildlife · native / key poses / native UI',24,26);
   species.forEach((type,i)=>{const y=54+i*61,s=A.wildlifeSizes[type];g.fillStyle=A.palette.ink;g.fillText(type,24,y+18);g.drawImage(A.wildlifeSprite(type),130,y);for(let f=0;f<4;f++)g.drawImage(A.wildlifeSprite(type,{frame:f}),190+f*92,y,s.width*2,s.height*2);g.drawImage(A.wildlifeIcon(type),610,y+4);g.drawImage(A.wildlifeBucketIcon(type),662,y+4);});
   Object.keys(A.cageSizes).forEach((type,i)=>{const x=38+i*280,y=460,s=A.cageSizes[type];g.drawImage(A.cageSprite(type,{layer:'back'}),x,y);g.drawImage(A.wildlifeSprite('rabbit'),x+18,y+s.height-36);g.drawImage(A.cageSprite(type,{layer:'front'}),x,y);g.drawImage(A.cageIcon(type),x+s.width+12,y+10);g.fillStyle=A.palette.ink;g.fillText(type,x,y+s.height+24)});
   return {checked};
  });
  assert.equal(result.checked,76);assert.deepEqual(errors,[]);
  if(process.env.SKY_WILDLIFE_QA)await page.screenshot({path:process.env.SKY_WILDLIFE_QA});
  console.log('PASS wildlife art: 76 native canvases, palette and binary alpha, mirrored anchors, animated poses, separate icons and transparent cage layers.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
