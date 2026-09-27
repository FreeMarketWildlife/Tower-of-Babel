/* Export approved generators for the illustrated companion, without modifying game art. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'assets');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.BUTTONWOOD_BROWSER ? { executablePath: process.env.BUTTONWOOD_BROWSER } : {}) });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.setContent('<!doctype html><html><body></body></html>');
  for (const name of ['palette', 'sky', 'workers', 'buildings', 'environment', 'ui']) {
    await page.addScriptTag({ content: fs.readFileSync(path.join(root, `${name}.js`), 'utf8') });
  }
  const assets = await page.evaluate(() => {
    const A = window.ButtonwoodArt, result = {};
    const save = (name, canvas) => { result[name] = canvas.toDataURL().split(',')[1]; };
    for (const type of ['home','workshop','storehouse','forge','blacksmith']) {
      save(`building-${type}`, A.building(type));
      save(`mini-${type}`, A.buildingIcon(type));
    }
    for (let v=0;v<3;v++) {
      save(`worker-${v}`, A.worker({variant:v}));
      save(`portrait-${v}`, A.workerIcon(v));
    }
    for (const state of ['idle','walk','work']) for(let f=0;f<A.workerFrames[state];f++) {
      save(`worker-${state}-${f}`, A.worker({state,frame:f,variant:0}));
    }
    for (const type of ['dirt','stone','wood','leaves','deepslate','obsidian']) save(`tile-${type}`, A.tile(type));
    for (const type of ['copperOre','ironOre','coal']) {
      const c=document.createElement('canvas');c.width=c.height=32;
      const g=c.getContext('2d');g.drawImage(A.tile('stone'),0,0);g.drawImage(A.ore(type),0,0);save(`ore-${type}`,c);
    }
    for (const [kind,tier,name] of [['move',0,'move'],['pick',0,'stone-pick'],['pick',1,'iron-pick'],['pick',2,'steel-pick'],['pick',3,'titanium-pick'],['craft',0,'craft'],['info',0,'details'],['wood',0,'wood'],['stone',0,'stone'],['dirt',0,'dirt'],['deepslate',0,'deepslate'],['leaves',0,'leaves'],['obsidian',0,'obsidian'],['bucket',0,'bucket'],['bucket','water','water'],['bucket','lava','lava']]) save(`ui-${name}`,A.uiIcon(kind,tier));
    const field=['dddddddddddd','ddddddddddds','dddddddddsss','ddddd..dssss','ddd....sssss','ssssssssssss'];
    const c=document.createElement('canvas');c.width=384;c.height=192;const g=c.getContext('2d');
    const at=(x,y)=>({d:'dirt',s:'stone'}[field[y]?.[x]]??null);
    g.fillStyle=A.palette.cave;g.fillRect(0,0,c.width,c.height);
    for(let y=0;y<6;y++)for(let x=0;x<12;x++) {
      const m=at(x,y);if(!m)continue;const n={meadow:y===0};
      for(const [key,dx,dy]of [['n',0,-1],['e',1,0],['s',0,1],['w',-1,0],['ne',1,-1],['se',1,1],['sw',-1,1],['nw',-1,-1]])n[key]=at(x+dx,y+dy);
      g.drawImage(A.terrain(m,x,y,n),x*32,y*32);
    }
    save('terrain-field',c);
    for(const [phase,seconds]of [['sunrise',15],['day',90],['sunset',165],['night',210]]) {
      const c=document.createElement('canvas');c.width=704;c.height=240;const g=c.getContext('2d'),ground=192;
      const sky=A.paintSky(g,{width:704,height:240,ground,camX:0,seconds,day:1});
      for(let x=0;x<22;x++)for(let y=0;y<2;y++)g.drawImage(A.terrain('dirt',x,y,{n:y?'dirt':null,e:'dirt',s:'dirt',w:'dirt',ne:y?'dirt':null,nw:y?'dirt':null,se:'dirt',sw:'dirt',meadow:y===0}),x*32,ground+y*32);
      for(const [type,x] of [['home',32],['workshop',224],['blacksmith',432]]){g.save();g.translate(x,ground-128);A.paintBuilding(g,type,0,true);g.restore();}
      for(const [x,v]of [[177,0],[395,1],[622,2]])g.drawImage(A.worker({variant:v}),x-18,ground-31);
      A.paintGarden(g,5,ground);A.paintGarden(g,654,ground);
      g.save();g.globalAlpha=sky.tint.alpha;g.fillStyle=sky.tint.color;g.fillRect(0,0,704,240);g.restore();
      for(const [type,x]of [['home',32],['workshop',224],['blacksmith',432]]){g.save();g.translate(x,ground-128);A.paintBuildingLights(g,type,sky.darkness,0);g.restore();}
      save(`scene-${phase}`,c);
    }
    return result;
  });
  for (const [name,data] of Object.entries(assets)) fs.writeFileSync(path.join(out,`${name}.png`),Buffer.from(data,'base64'));
  await browser.close();
  console.log(`Exported ${Object.keys(assets).length} approved native-art illustrations.`);
})().catch(error => { console.error(error); process.exit(1); });
