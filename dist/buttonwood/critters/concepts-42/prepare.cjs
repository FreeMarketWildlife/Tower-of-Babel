// Technical export of generated concepts; does not redraw character anatomy.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
(async()=>{
 const root=__dirname;
 const paletteSource=await fs.readFile(path.join(root,'../../palette.js'),'utf8');
 const palette=[...paletteSource.matchAll(/#[0-9a-f]{6}/g)].map(m=>m[0]).filter((c,i,a)=>a.indexOf(c)===i).map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
 for(const name of ['mouse','turtle','lizard']){
  const file=path.join(root,'source',name+'.png');
  const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=info.width,y0=info.height,x1=0,y1=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>127){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
  const w=x1-x0+1,h=y1-y0+1,scale=38/Math.max(w,h),outW=Math.round(w*scale),outH=Math.round(h*scale);
  const {data:p}=await sharp(file).extract({left:x0,top:y0,width:w,height:h}).resize(outW,outH,{kernel:'nearest'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const canvas=Buffer.alloc(42*42*4),left=Math.floor((42-outW)/2),top=40-outH;
  for(let y=0;y<outH;y++)for(let x=0;x<outW;x++){
   const i=(y*outW+x)*4,j=((y+top)*42+x+left)*4;if(p[i+3]<128)continue;
   let best=palette[0],dist=Infinity;
   for(const rgb of palette){const d=rgb.reduce((s,v,k)=>s+(v-p[i+k])**2,0);if(d<dist){dist=d;best=rgb}}
   best.forEach((v,k)=>canvas[j+k]=v);canvas[j+3]=255;
  }
  await sharp(canvas,{raw:{width:42,height:42,channels:4}}).png().toFile(path.join(root,name+'-42.png'));
  console.log(name, '42×42; occupied',outW+'×'+outH);
 }
})();
