(() => {
'use strict';

const buttonwoodSample = new URLSearchParams(location.search).get('sample') === 'buttonwood';

const coreParts=[
  'game-v8-part0.txt?v=41',
  'game-v8-part1.txt?v=44',
  'game-v8-part2.txt?v=42'
];
const liquidParts=[
  'game-v10-liquid.txt?v=44',
  'game-v10-liquid-fixes.txt?v=28',
  'game-v13-liquid-visibility.txt?v=28',
  'game-v14-liquid-guarantee.txt?v=28',
  'game-v15-liquid-diagnostic.txt?v=28',
  'game-v17-liquid-tuning.txt?v=28',
  'game-v17-seedfix.txt?v=28',
  'game-v18-terraria-liquid.txt?v=28',
  'game-v19-liquid-flow.txt?v=28',
  'game-v20-liquid-surface.txt?v=28',
  'game-v21-liquid-render.txt?v=28',
  'game-v22-liquid-engine.txt?v=28'
];
const cameraUrl='game-v24-camera-bounce.txt?v=28';
const gridUrl='game-v25-grid-toggle.txt?v=41';
const zoomUrl='game-v26-zoom-input.txt?v=28';
const minerUrl='game-v27-miner-ai-rhythm.txt?v=44';
const resourceUrl='game-v28-resources-obsidian.txt?v=44';
const liquidFeelUrl='game-v29-liquid-feel.txt?v=29';
const devPanelUrl='game-v30-dev-panel.txt?v=30';
const obsidianArtUrl='game-v31-obsidian-art.txt?v=31';
const artDirectionUrl='game-v32-art-direction.txt?v=41';
const pickaxeUrl='game-v39-pickaxe.txt?v=39';
const treesUrl='game-v41-trees.txt?v=44';
const spiritsUrl='game-v42-miner-ghosts.txt?v=43';
const industryUrl='game-v44-industry-resources.txt?v=59';
const structureArtUrl='game-v46-structure-art.txt?v=46';
const structuresUrl='game-v46-structures.txt?v=46';
const tailUrl='game-v8-part3.txt?v=42';

async function read(url){
  const r=await fetch(url,{cache:'no-store'});
  if(!r.ok)throw new Error('Could not load '+url+' ('+r.status+')');
  return r.text();
}

(async()=>{
  try{
    let core='';
    for(const url of coreParts)core+=await read(url);
    // Select the sample save before the core reads or registers autosaves.
    if(buttonwoodSample){
      const saveDeclaration="const SAVE_KEY='skyStack.save.v1';";
      if(!core.includes(saveDeclaration))throw new Error('Sample save declaration missing');
      core=core.replace(saveDeclaration,"const SAVE_KEY='tower.buttonwood.sample.v1';");
    }
    const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='buttonwood/sample.css?v=65';document.head.append(sheet);
    for(const path of ['palette.js','sky.js','workers.js','buildings.js','environment.js']){
      (0,eval)(await read('buttonwood/'+path));
    }

    let liquid='';
    for(const url of liquidParts)liquid+=await read(url);

    let tail=await read(tailUrl);
    tail=tail.replace(/^\s*\}\);\s*/, '');

    const camera=await read(cameraUrl);
    const grid=await read(gridUrl);
    const zoom=await read(zoomUrl);
    const miner=await read(minerUrl);
    const resources=await read(resourceUrl);
    const liquidFeel=await read(liquidFeelUrl);
    const devPanel=await read(devPanelUrl);
    const obsidianArt=await read(obsidianArtUrl);
    const artDirection=await read(artDirectionUrl);
    const pickaxe=await read(pickaxeUrl);
    const trees=await read(treesUrl);
    const spirits=await read(spiritsUrl);
    const industry=await read(industryUrl);
    const structureArt=await read(structureArtUrl);
    const structures=await read(structuresUrl);
    const structuresUi=await read('game-v48-structures-ui.txt?v=48');
    const pickaxes=await read('game-v49-pickaxes.txt?v=49');
    const workshopUi=await read('game-v50-workshop-ui.txt?v=50');
    const keyboard=await read('game-v52-keyboard.txt?v=52');
    const devResources=await read('game-v54-dev-resources.txt?v=54');
    const marker='restoreDynamicState(initialSave);';
    if(!tail.includes(marker))throw new Error('v28 insertion marker missing');
    tail=tail.replace(marker,camera+'\n'+grid+'\n'+zoom+'\n'+miner+'\n'+resources+'\n'+liquidFeel+'\n'+devPanel+'\n'+obsidianArt+'\n'+artDirection+'\n'+pickaxe+'\n'+trees+'\n'+spirits+'\n'+industry+'\n'+structureArt+'\n'+structures+'\n'+structuresUi+'\n'+pickaxes+'\n'+workshopUi+'\n'+keyboard+'\n'+marker);

    tail=tail.replace(marker,devResources+'\n'+marker);
    tail=tail.replace(marker,(await read('game-v55-workers.txt?v=55'))+'\n'+marker);
    tail=tail.replace(marker,(await read('game-v56-settlement.txt?v=56'))+'\n'+marker);
    tail=tail.replace(marker,(await read('game-v57-performance.txt?v=58'))+'\n'+marker);
    tail=tail.replace(marker,(await read('game-v60-storehouses.txt?v=60'))+'\n'+marker);
    tail=tail.replace(marker,(await read('game-v61-player-crafting.txt?v=61'))+'\n'+marker);
    tail=tail.replace(marker,(await read('game-v62-sky.txt?v=62'))+'\n'+marker);
    tail=tail.replace(marker,(await read('game-v64-compact-structures.txt?v=64'))+'\n'+marker);
    tail=tail.replace(marker,(await read('buttonwood/integration.txt'))+'\n'+marker+'\nbuttonwoodBoot();');
    tail=tail.replace(marker,(await read('game-v66-mobile-ui.txt?v=66'))+'\n'+marker);
    const src=core+'\n});\n'+liquid+'\n'+tail;
    (0,eval)(src);
  }catch(e){
    console.error('Tower of Babel failed to load',e);
    const el=document.getElementById('load');
    if(el)el.textContent='Game failed to load — refresh to retry';
  }
})();
})();
