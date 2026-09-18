/* Separately drawn UI miniatures. Every canvas is displayed at its native 32px. */
(() => {
  'use strict';
  const A = window.ButtonwoodArt, P = A.palette, cache = new Map();
  A.uiIcon = function (kind, tier = 0) {
    const key = kind + ':' + tier;
    if (cache.has(key)) return cache.get(key);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
    const g = canvas.getContext('2d'); g.imageSmoothingEnabled = false;
    const r = (x, y, w, h, color) => { g.fillStyle = color; g.fillRect(x, y, w, h); };
    if (kind === 'move') {
      // An open work glove: separated fingertips, cupped palm, and a mint cuff.
      r(12,4,4,18,P.outline); r(17,3,4,19,P.outline);
      r(22,6,4,16,P.outline); r(26,11,3,11,P.outline);
      r(10,13,17,11,P.outline); r(6,12,4,6,P.outline);
      r(7,16,5,6,P.outline); r(10,21,14,5,P.outline);
      r(13,5,2,12,P.cream); r(18,4,2,13,P.cream);
      r(23,7,2,12,P.cream); r(27,12,1,8,P.creamShade);
      r(11,16,15,6,P.cream); r(12,21,12,4,P.creamShade);
      r(7,13,2,4,P.creamLight); r(8,16,4,4,P.cream);
      r(11,19,3,3,P.creamLight); r(12,16,10,2,P.creamLight);
      r(13,6,1,7,P.creamLight); r(18,5,1,8,P.creamLight);
      r(14,22,8,1,P.woodLight);
      r(11,25,14,5,P.outline); r(12,26,12,3,P.mintShade);
      r(12,26,11,1,P.mintLight); r(13,27,9,2,P.mint);
    } else if (kind === 'pick') {
      const ramps = [[P.stoneShade,P.stone,P.stoneLight],
        [P.stoneShade,P.creamShade,P.creamLight],
        [P.waterShade,P.water,P.waterLight], [P.deepShade,P.deepLight,P.creamLight]];
      const [shade,base,light] = ramps[tier] || ramps[0];
      // Stepped diagonal handle is painted directly, never rotated or resampled.
      for (let i=0;i<9;i++) r(5+i,24-i,5,5,P.outline);
      for (let i=0;i<9;i++) { r(6+i,24-i,3,3,P.wood); r(6+i,24-i,1,2,P.woodLight); }
      r(6,26,3,2,P.woodShade);
      r(7,5,14,1,P.outline); r(5,6,19,2,P.outline);
      r(4,8,22,3,P.outline); r(3,11,9,2,P.outline);
      r(2,13,5,2,P.outline); r(2,15,2,2,P.outline);
      r(23,10,5,4,P.outline); r(26,14,3,4,P.outline); r(28,18,2,3,P.outline);
      r(7,6,13,1,light); r(5,8,8,2,base); r(7,7,14,2,base);
      r(5,10,6,1,shade); r(4,11,4,2,base); r(3,13,2,2,light);
      r(19,8,5,2,base); r(21,10,4,2,shade);
      r(24,11,2,3,base); r(26,14,2,3,base); r(28,18,1,2,light);
      r(8,7,10,1,light); r(19,8,3,1,light);
      r(14,8,5,7,P.outline); r(15,9,3,5,shade); r(15,9,2,4,base); r(15,9,1,2,light);
      if (tier > 0) { r(11,20,3,2,shade); r(12,19,3,2,base); }
      if (tier > 1) { r(8,23,3,2,shade); r(9,22,3,2,base); }
      if (tier === 3) { r(16,10,1,2,P.gold); r(6,25,2,2,P.gold); }
    } else if (kind === 'craft') {
      r(13,13,6,16,P.outline); r(14,14,4,14,P.wood);
      r(14,14,1,12,P.woodLight); r(16,21,2,7,P.woodShade);
      r(13,26,6,3,P.outline); r(14,26,4,2,P.woodLight);
      r(6,6,20,9,P.outline); r(4,7,4,7,P.outline);
      r(5,8,3,5,P.stoneLight); r(8,7,16,6,P.stone);
      r(8,7,15,2,P.creamLight); r(8,12,16,2,P.stoneShade);
      r(23,8,3,5,P.stoneShade); r(24,8,1,4,P.stoneLight);
      r(13,7,6,8,P.outline); r(14,8,4,6,P.stoneShade);
      r(14,8,3,4,P.stoneLight); r(15,9,1,2,P.creamLight);
    } else if (kind === 'info') {
      // A shaded chevron; a half-turn preserves its integer pixel grid.
      for (let i=0;i<6;i++) {
        r(7+i,11+i,3,5,P.outline); r(22-i,11+i,3,5,P.outline);
        r(8+i,12+i,2,2,P.woodLight); r(22-i,12+i,2,2,P.woodLight);
      }
      r(14,17,4,4,P.outline); r(14,17,4,2,P.woodLight);
    } else if (kind === 'bucket') {
      // Upright iron pail, arched handle, broad rim and distinct liquid surfaces.
      r(9,5,14,2,P.outline); r(7,7,2,11,P.outline); r(23,7,2,11,P.outline);
      r(10,6,12,1,P.stoneLight); r(8,8,1,8,P.stoneLight); r(23,8,1,8,P.stone);
      r(5,13,22,4,P.outline); r(6,17,20,7,P.outline); r(8,24,16,4,P.outline);
      r(7,17,18,6,P.stone); r(9,23,14,4,P.stoneShade);
      r(8,17,3,7,P.stoneLight); r(11,25,9,1,P.stone); r(22,18,2,5,P.stoneShade);
      r(6,14,20,2,P.creamLight); r(8,13,16,2,P.deepShade);
      if(tier){
        const water=tier==='water',lava=tier==='lava';
        r(8,13,16,2,water?P.water:lava?P.lava:P.mint);
        r(9,13,8,1,water?P.waterLight:lava?P.lavaLight:P.mintLight);
        r(14,19,6,3,water?P.waterShade:lava?P.lavaShade:P.mintShade);
        r(15,18,4,3,water?P.water:lava?P.lava:P.mint);
      }
    } else if (['wood','dirt','stone','deepslate','leaves','obsidian'].includes(kind)) {
      const [shade,base,light] = {wood:[P.woodShade,P.wood,P.woodLight],
        dirt:[P.dirtShade,P.dirt,P.dirtLight], stone:[P.stoneShade,P.stone,P.stoneLight],
        deepslate:[P.deepShade,P.deep,P.deepLight], leaves:[P.grassShade,P.grass,P.grassLight], obsidian:[P.ink,P.deepShade,P.deepLight]}[kind];
      r(4,4,24,24,shade); r(5,5,22,22,base);
      r(5,5,21,1,light); r(5,6,1,20,light);
      r(26,7,1,20,shade); r(7,26,19,1,shade);
      if (kind === 'wood') {
        r(9,7,2,10,shade); r(8,15,2,9,shade); r(11,7,1,6,light);
        r(20,6,2,8,shade); r(21,13,2,12,shade); r(23,16,1,8,light);
        r(14,17,4,1,shade); r(13,18,1,4,shade); r(17,18,1,4,light);
        r(14,22,3,1,shade); r(15,19,1,2,shade);
      } else if (kind === 'dirt') {
        r(8,10,8,2,shade); r(10,12,9,2,shade); r(9,9,5,1,light);
        r(18,18,6,3,shade); r(16,19,7,1,shade); r(18,17,4,1,light);
        r(8,22,4,2,light); r(9,21,2,1,light);
      } else if (kind === 'leaves') {
        r(7,9,9,4,light);r(16,8,7,3,light);r(11,16,10,3,shade);
        r(8,21,6,3,light);r(19,22,5,2,shade);r(20,13,4,3,light);
      } else if (kind === 'obsidian') {
        r(8,8,9,2,light);r(7,10,4,3,light);r(18,11,2,9,shade);
        r(10,17,5,7,shade);r(19,22,5,2,light);
      } else if (kind === 'stone') {
        r(8,10,9,2,light); r(7,12,3,2,light);
        r(10,17,10,2,shade); r(19,14,2,4,shade);
        r(16,21,8,1,light); r(15,22,3,1,light);
      } else {
        r(8,9,12,2,light); r(7,11,3,1,light);
        r(10,14,14,2,shade); r(20,12,3,2,shade);
        r(7,19,12,2,light); r(16,21,8,2,shade); r(8,24,7,1,shade);
      }
    }
    cache.set(key,canvas); return canvas;
  };
})();
