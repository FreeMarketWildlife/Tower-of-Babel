'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:1100,height:1050}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.MOUSE_TEST_URL||'http://127.0.0.1:8766/tower-of-babel/buttonwood/critters/wood-mouse/');
 const data=await page.evaluate(()=>{const A=window.ButtonwoodArt,M=A.woodMouse,allowed=new Set(Object.values(A.palette)),exports={};let checked=0;const demand=(v,m)=>{if(!v)throw Error(m);};
 for(const [state,m]of Object.entries(M.motions)){const unique=new Set(),frames=[];const sheet=document.createElement('canvas');sheet.width=40*m.frames;sheet.height=32;const sg=sheet.getContext('2d');
 for(let f=0;f<m.frames;f++){const c=M.sprite({state,frame:f});demand(c.width===40&&c.height===32,state+' dimensions');const right=c.getContext('2d').getImageData(0,0,40,32).data,left=M.sprite({state,frame:f,direction:-1}).getContext('2d').getImageData(0,0,40,32).data;let occupied=0;
 for(let y=0;y<32;y++)for(let x=0;x<40;x++){const i=(y*40+x)*4,a=right[i+3];demand(a===0||a===255,state+' binary alpha');if(a){occupied++;const color='#'+[...right.slice(i,i+3)].map(v=>v.toString(16).padStart(2,'0')).join('');demand(allowed.has(color),state+' palette');demand(x<36,'art crosses mirrored canvas');}const mx=35-x;if(mx>=0)for(let k=0;k<4;k++)demand(right[i+k]===left[(y*40+mx)*4+k],state+' mirror anchor');}
 demand(occupied>100,state+' missing art');unique.add(c.toDataURL());frames.push(c.toDataURL());sg.drawImage(c,40*f,0);checked++;
 }demand(unique.size>=(state==='idle'?2:Math.min(4,m.frames)),state+' repeated motion');demand(M.sprite({state,frame:m.frames})===M.sprite({state,frame:0}),state+' wrap');exports[state]={frames,sheet:sheet.toDataURL(),ms:m.ms};}
 demand(M.anchor.x===18&&M.anchor.y===31,'anchor');return {checked,exports};});
 assert.equal(data.checked,56);await page.locator('#pause').click();await page.locator('#pet-mouse').click();await page.waitForTimeout(400);assert.match(await page.locator('#pet-status').textContent(),/Happy/);await page.waitForTimeout(1200);assert.match(await page.locator('#pet-status').textContent(),/Click/);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
 const out=path.join(__dirname,'../buttonwood/critters/wood-mouse/exports');await fs.mkdir(out,{recursive:true});for(const[state,e]of Object.entries(data.exports)){await fs.writeFile(path.join(out,state+'-sheet.png'),Buffer.from(e.sheet.split(',')[1],'base64'));for(let i=0;i<e.frames.length;i++)await fs.writeFile(path.join(out,`${state}-${i}.png`),Buffer.from(e.frames[i].split(',')[1],'base64'));}
 await fs.writeFile(path.join(out,'timing.json'),JSON.stringify(Object.fromEntries(Object.entries(data.exports).map(([s,e])=>[s,{frames:e.frames.length,ms:e.ms}])),null,2));
 await page.setViewportSize({width:1100,height:1050});await page.screenshot({path:path.join(out,'preview.png'),fullPage:true});console.log('PASS: 56 native frames, shared palette, binary alpha, mirrored anchors, distinct poses, frame wrap, click Pet and mobile layout.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
