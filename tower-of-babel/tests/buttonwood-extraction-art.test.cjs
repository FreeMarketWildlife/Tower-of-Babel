'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

// Inspect real native canvases without loading a save, the simulation, or a server.
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.SKY_TEST_BROWSER || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent('<!doctype html><html><body></body></html>');
    for (const name of ['palette', 'extraction']) {
      await page.addScriptTag({ content: await fs.readFile(path.join(__dirname, '../buttonwood', name + '.js'), 'utf8') });
    }
    const result = await page.evaluate(() => {
      const A = window.ButtonwoodArt;
      const allowed = new Set(Object.values(A.palette).map(color => color.toLowerCase()));
      const kinds = [null, 'oil', 'water', 'lava'];
      const demand = (pass, message) => { if (!pass) throw new Error(message); };
      let checked = 0;
      function inspect(canvas, width, height, label) {
        demand(canvas.width === width && canvas.height === height, label + ': native dimensions');
        const pixels = canvas.getContext('2d').getImageData(0, 0, width, height).data;
        let occupied = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const alpha = pixels[i + 3];
          demand(alpha === 0 || alpha === 255, label + ': antialiased alpha');
          if (!alpha) continue;
          occupied++;
          const color = '#' + [pixels[i], pixels[i + 1], pixels[i + 2]].map(n => n.toString(16).padStart(2, '0')).join('');
          demand(allowed.has(color), label + ': off-palette ' + color);
        }
        demand(occupied > 0, label + ': empty canvas');
        checked++;
      }
      for (const kind of kinds) {
        for (const active of [false, true]) {
          for (let frame = 0; frame < 6; frame++) {
            inspect(A.extractionSprite('pumpjack', { frame, active, kind }), 128, 96, `Pumpjack ${kind}/${active}/${frame}`);
          }
          for (let mask = 0; mask < 16; mask++) {
            inspect(A.extractionSprite('pipe', { mask, active, kind }), 32, 32, `Pipe ${kind}/${active}/${mask}`);
          }
        }
        for (let level = 0; level <= 20; level++) {
          inspect(A.extractionSprite('tank', { kind, fill: level / 20 }), 96, 96, `Tank ${kind}/${level}`);
        }
      }
      for (const type of ['pumpjack', 'tank', 'pipe', 'oil', 'bucket:oil', 'remove']) {
        inspect(A.extractionIcon(type), 32, 32, 'UI ' + type);
      }

      const alpha = (c, x, y) => c.getContext('2d').getImageData(x, y, 1, 1).data[3] !== 0;
      const pump = A.extractionSprite('pumpjack'), tank = A.extractionSprite('tank');
      demand(alpha(pump, 48, 95) && alpha(pump, 127, 80), 'Pumpjack ports reach the declared edges');
      demand(alpha(tank, 0, 80) && alpha(tank, 95, 80), 'Tank ports reach the declared edges');
      for (let mask = 0; mask < 16; mask++) {
        const c = A.extractionSprite('pipe', { mask });
        for (const [bit, x, y] of [[1, 16, 0], [2, 31, 16], [4, 16, 31], [8, 0, 16]]) {
          demand(alpha(c, x, y) === Boolean(mask & bit), `Pipe mask ${mask}: missing or invented edge ${bit}`);
        }
      }

      const motion = new Set(), bases = new Set(), rest = new Set();
      for (let frame = 0; frame < 6; frame++) {
        const c = A.extractionSprite('pumpjack', { frame, active: true, kind: 'oil' });
        motion.add(c.toDataURL());
        bases.add(String(c.getContext('2d').getImageData(0, 88, 128, 8).data));
        rest.add(A.extractionSprite('pumpjack', { frame, active: false, kind: 'oil' }).toDataURL());
      }
      demand(motion.size === 6, 'Six distinct working poses');
      demand(bases.size === 1, 'Pump foundation shifts during a working cycle');
      demand(rest.size === 1, 'Rest state changes with the frame');
      const gauge = new Set();
      for (let n = 0; n <= 20; n++) gauge.add(A.extractionSprite('tank', { kind: 'oil', fill: n / 20 }).toDataURL());
      demand(gauge.size === 21, 'The gauge must distinguish every visible level, including empty');
      demand(A.extractionSprite('tank', { kind: 'oil', fill: -1 }) === A.extractionSprite('tank', { kind: 'oil', fill: 0 }), 'Clamp low fill');
      demand(A.extractionSprite('tank', { kind: 'oil', fill: 2 }) === A.extractionSprite('tank', { kind: 'oil', fill: 1 }), 'Clamp high fill');
      demand(A.extractionSprite('tank', { kind: 'oil', fill: .501 }) === A.extractionSprite('tank', { kind: 'oil', fill: .511 }), 'Quantize only visible gauge resolution');
      demand(A.extractionSprite('tank', { kind: null, fill: 1 }) === A.extractionSprite('tank', { kind: null, fill: 0 }), 'No invented contents for an empty Tank');
      demand(A.extractionSprite('unknown') === null && A.extractionSprite('toString') === null, 'Unknown sprite types');
      demand(A.extractionIcon('unknown') === null, 'Unknown icon types');
      return { checked, workingPoses: motion.size, gaugeLevels: gauge.size, ports: A.extractionPorts };
    });
    assert.equal(result.checked, 266);
    assert.deepEqual(result.ports.pumpjack, { intake: { x: 48, y: 96 }, outlet: { x: 128, y: 80 } });
    assert.deepEqual(result.ports.tank, { left: { x: 0, y: 80 }, right: { x: 96, y: 80 } });
    assert.deepEqual(errors, []);
    console.log('PASS extraction art: 266 native canvases, palette/binary alpha, 16 pipe masks, 68 edge checks, 6 stable-footing poses, static rest, and 21 gauge levels.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
