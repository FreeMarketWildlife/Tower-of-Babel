'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:1260,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.CRITTER_TEST_URL||'http://127.0.0.1:8766/tower-of-babel/buttonwood/critters/');
 const result=await page.evaluate(()=>{const A=window.ButtonwoodArt,C=A.critters,allowed=new Set(Object.values(A.palette)),exports=[],ids=new Set(),idleImages=new Set();let checked=0;const demand=(v,m)=>{if(!v)throw Error(m);};
 for(const s of C.roster){demand(!ids.has(s.id),'duplicate species');ids.add(s.id);const sheet=document.createElement('canvas');sheet.width=400;sheet.height=32*7;const sg=sheet.getContext('2d');let row=0;
 for(const[state,m]of Object.entries(C.motions)){const motion=new Set();for(let f=0;f<m.frames;f++){
  const right=C.sprite({species:s.id,state,frame:f}),left=C.sprite({species:s.id,state,frame:f,direction:-1});demand(right.width===40&&right.height===32,s.id+' frame budget');
  const r=right.getContext('2d').getImageData(0,0,40,32).data,l=left.getContext('2d').getImageData(0,0,40,32).data;let count=0;
  for(let y=0;y<32;y++)for(let x=0;x<40;x++){const i=(y*40+x)*4,a=r[i+3];demand(a===0||a===255,s.id+' alpha');if(a){count++;const col='#'+[...r.slice(i,i+3)].map(n=>n.toString(16).padStart(2,'0')).join('');demand(allowed.has(col),s.id+' palette');demand(x<36,s.id+' mirror width');}const mx=35-x;if(mx>=0)for(let k=0;k<4;k++)demand(r[i+k]===l[(y*40+mx)*4+k],s.id+' mirror');}
  demand(count>100,s.id+' empty frame');
  // Draw into a padded surface to find pixels silently clipped by sprite canvases.
  const pad=document.createElement('canvas');pad.width=72;pad.height=64;const pg=pad.getContext('2d');pg.translate(16,16);C.drawInto(pg,{species:s.id,state,frame:f});const pd=pg.getImageData(0,0,72,64).data;for(let y=0;y<64;y++)for(let x=0;x<72;x++)if(pd[(y*72+x)*4+3])demand(x>=16&&x<52&&y>=16&&y<48,`${s.id}/${state}/${f} clipped at ${x-16},${y-16}`);
  motion.add(right.toDataURL());sg.drawImage(right,f*40,row*32);checked++;
 }demand(motion.size>=(state==='idle'?2:4),s.id+'/'+state+' missing motion');demand(C.sprite({species:s.id,state,frame:m.frames})===C.sprite({species:s.id,state,frame:0}),s.id+' cache wrap');row++;}
 idleImages.add(C.sprite({species:s.id}).toDataURL());exports.push({id:s.id,name:s.name,cue:s.cue,sheet:sheet.toDataURL()});
 }
 demand(ids.size===25&&idleImages.size===25,'unique complete roster');demand(C.sprite({species:'unknown'})===null,'unknown species');demand(C.sprite({species:'constructor'})===null,'prototype species');
 const native=document.createElement('canvas');native.width=320;native.height=240;const ng=native.getContext('2d');ng.fillStyle=A.palette.cream;ng.fillRect(0,0,320,240);C.roster.forEach((s,i)=>{ng.drawImage(C.sprite({species:s.id}),i%5*64+12,Math.floor(i/5)*48+10);});
 return {checked,exports,native:native.toDataURL(),motions:C.motions,jumpOffset:C.jumpOffset};});
 assert.equal(result.checked,1400);assert.equal(await page.locator('.critter').count(),25);assert.equal(await page.locator('#detail canvas').count(),6);
 await page.getByRole('button',{name:'Pet Box turtle',exact:true}).click();await page.waitForTimeout(400);assert.match(await page.locator('#status').textContent(),/Box turtle.*touch/);await page.waitForTimeout(1200);assert.equal(await page.locator('#status').textContent(),'Ready to pet.');
 await page.getByRole('button',{name:'Inspect all Crested newt actions',exact:true}).click();assert.equal(await page.locator('#species').inputValue(),'crested-newt');
 await page.locator('#pause').click();await page.locator('input[aria-label="Inspect mine frame"]').fill('4');assert.equal(await page.locator('#pause').textContent(),'Play');
 for(const width of [320,390,430,844]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px page overflow`);}
 const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(process.env.CRITTER_TEST_URL||'http://127.0.0.1:8766/tower-of-babel/buttonwood/critters/');assert.equal(await reduced.locator('#pause').textContent(),'Play');await reduced.close();assert.deepEqual(errors,[]);
 const out=path.join(__dirname,'../buttonwood/critters/exports');await fs.mkdir(out,{recursive:true});for(const s of result.exports){await fs.writeFile(path.join(out,s.id+'-spritesheet.png'),Buffer.from(s.sheet.split(',')[1],'base64'));delete s.sheet;}
 await fs.writeFile(path.join(out,'roster-native.png'),Buffer.from(result.native.split(',')[1],'base64'));await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({width:40,height:32,anchor:{x:18,y:31},rows:Object.keys(result.motions),motions:result.motions,jumpOffset:result.jumpOffset,roster:result.exports},null,2));
 await page.setViewportSize({width:1260,height:1000});await page.locator('#action').selectOption('idle');await page.locator('#scale').selectOption('3');await page.screenshot({path:path.join(out,'gallery-review.png'),fullPage:true});console.log('PASS 25 unique species, 1400 native frames, palette, binary alpha, mirrors, unclipped bounds, all motions, Pet, species selection, scrubbing, four viewport widths and reduced motion.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
