const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const NORMAL_KEY = 'skyStack.save.v1';
const SAMPLE_KEY = 'tower.buttonwood.sample.v1';
const sentinel = JSON.stringify({ v: 1, inv: { dirt: 177, gold: 23 }, marker: 'keep-the-normal-world' });
const baseURL = new URL(process.env.SKY_TEST_URL || 'http://127.0.0.1:8773/tower-of-babel/');
baseURL.searchParams.delete('sample');
const sampleURL = new URL(baseURL); sampleURL.searchParams.set('sample', 'buttonwood');
const buildingSizes = { home: [128, 128], workshop: [128, 128], storehouse: [160, 128], forge: [96, 96], blacksmith: [160, 128] };
const restoredBuilding = building => ({ ...building, workerId: building.workerId ?? null });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.SKY_TEST_BROWSER || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  try {
    const errors = [];
    const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
    const prepare = async (page, freezeAnimation = true) => {
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.route('**/favicon.ico', route => route.fulfill({ status: 204 }));
      if (process.env.SKY_TEST_MATTER) {
        const body = await fs.readFile(process.env.SKY_TEST_MATTER, 'utf8');
        await page.route('**/matter.min.js', route => route.fulfill({ contentType: 'application/javascript', body }));
      }
      // The main regression uses fixture calls; the final smoke check runs normally.
      if (freezeAnimation) await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    };
    const page = await context.newPage();
    await prepare(page);
    await page.addInitScript(({ key, value }) => {
      if (!sessionStorage.getItem('buttonwood-regression-seeded')) {
        localStorage.setItem(key, value);
        sessionStorage.setItem('buttonwood-regression-seeded', '1');
      }
    }, { key: NORMAL_KEY, value: sentinel });
    const loadSample = async () => {
      await page.goto(sampleURL.href, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.__buttonwood, null, { polling: 100, timeout: 30000 });
      await page.waitForFunction(() => !document.getElementById('load'), null, { polling: 100 });
    };
    const state = () => page.evaluate(() => window.__buttonwood.state);
    const save = () => page.evaluate(key => {
      window.__buttonwood.save(); return JSON.parse(localStorage.getItem(key));
    }, SAMPLE_KEY);
    const normalUntouched = async () => assert.equal(
      await page.evaluate(key => localStorage.getItem(key), NORMAL_KEY), sentinel,
      'Sample actions must not modify the normal world save',
    );
    const sampleTerrain = () => page.evaluate(() => {
      const cell = window.__buttonwood.fixture.cell;
      return Object.fromEntries([[2, 8], [8, 8], [14, 8], [7, 6], [10, 6], [2, 6]].map(([x, y]) =>
        [`${x},${y}`, cell(x, y)]));
    });
    const screenshot = async name => {
      if (!process.env.BW_SCREENSHOT_DIR) return;
      await fs.mkdir(process.env.BW_SCREENSHOT_DIR, { recursive: true });
      await page.evaluate(() => window.__buttonwood.render(990));
      await page.screenshot({ path: path.join(process.env.BW_SCREENSHOT_DIR, `${name}.png`) });
    };
    const clickBuilding = async (target, type) => {
      await target.evaluate(type => window.__buttonwood.view(
        type === 'home' || type === 'workshop' ? 'village' : 'industry', 1), type);
      const point = await target.evaluate(({ type, size }) => {
        const { camera, buildings } = window.__buttonwood.state;
        const building = buildings.find(b => b.type === type);
        const box = document.getElementById('game').getBoundingClientRect();
        return { x: box.x + box.width / 2 + (building.x + size[0] / 2 - camera.x) * camera.z,
          y: box.y + box.height / 2 + (building.y + size[1] - 20 - camera.y) * camera.z };
      }, { type, size: buildingSizes[type] });
      await target.mouse.click(point.x, point.y);
      await target.waitForFunction(type => document.getElementById(type === 'home' ? 'homePanel' : 'buildingPanel').open,
        type, { polling: 100 });
    };

    await loadSample();
    assert.equal((await state()).saveKey, SAMPLE_KEY);
    assert.equal((await state()).enabled, true);
    assert.equal((await state()).workers, 3);
    assert.deepEqual((await state()).buildings.map(b => b.type).sort(), Object.keys(buildingSizes).sort());
    assert.equal((await state()).industry.version, 1);
    assert.equal((await state()).collisionsUnchanged, true);
    await normalUntouched();
    const freshSample = await save(), freshBuildings = (await state()).buildings;
    const freshTerrain = await sampleTerrain();
    for (const key of ['2,8', '8,8', '14,8']) assert.equal(freshTerrain[key].material, 'stone', 'Sample basin floor is stone');
    for (const [key, type] of [['7,6', 'copperOre'], ['10,6', 'copperOre'], ['2,6', 'ironOre']]) {
      assert.deepEqual(freshTerrain[key], { material: 'stone', resourceType: type, resourceAmount: 3, hits: 0 });
    }

    const dimensions = await page.evaluate(() => {
      const a = window.ButtonwoodArt, size = c => [c.width, c.height];
      return {
        worker: size(a.worker({ state: 'work', frame: 2 })), workerIcon: size(a.workerIcon()),
        buildings: Object.fromEntries(['home', 'workshop', 'storehouse', 'forge', 'blacksmith'].map(type => [type, size(a.building(type))])),
        icons: ['home', 'workshop', 'storehouse', 'forge', 'blacksmith'].map(type => size(a.buildingIcon(type))),
        tile: size(a.tile('dirt')), anchor: a.workerAnchor,
      };
    });
    assert.deepEqual(dimensions, {
      worker: [40, 32], workerIcon: [32, 32], buildings: buildingSizes,
      icons: Object.keys(buildingSizes).map(() => [32, 32]), tile: [32, 32], anchor: { x: 18, y: 31 },
    });

    await page.locator('#structuresOpen').click();
    const inventoryUI = await page.evaluate(() => {
      const panel = document.getElementById('structuresPanel'), rect = panel.getBoundingClientRect();
      const bar = document.getElementById('bar').getBoundingClientRect();
      const images = ['home', 'workshop', 'storehouse', 'forge', 'blacksmith'].map(type => {
        const image = document.querySelector(`#structure-card-${type} img`), box = image.getBoundingClientRect();
        return [image.naturalWidth, image.naturalHeight, box.width, box.height, getComputedStyle(image).imageRendering];
      });
      const backgrounds = ['.minerToolIcon', '.minerPortrait', '.houseIcon'].map(selector =>
        getComputedStyle(document.querySelector(selector)).backgroundSize);
      return { images, backgrounds, modal: panel.matches(':modal'), gap: bar.top - rect.bottom };
    });
    assert.deepEqual(inventoryUI.images, Object.keys(buildingSizes).map(() => [32, 32, 32, 32, 'pixelated']));
    assert.deepEqual(inventoryUI.backgrounds, ['32px 32px', '32px 32px', '32px 32px']);
    assert.equal(inventoryUI.modal, false);
    assert.ok(Math.abs(inventoryUI.gap - 8) < 2, 'Building inventory stays adjacent to its toolbar trigger');
    await page.locator('#structuresClose').click();

    await page.locator('#bw-zoom').selectOption('1');
    assert.equal((await state()).camera.z, 1);
    await screenshot('buttonwood-village-native');
    await page.locator('#bw-zoom').selectOption('2');
    assert.equal((await state()).camera.z, 2);
    await screenshot('buttonwood-village');
    await page.locator('#bw-mine').click();
    assert.equal((await state()).camera.y, 142);
    await page.locator('#bw-time').selectOption('night');
    assert.equal((await state()).sky.phase, 'night');
    await screenshot('buttonwood-mine-night');
    await page.locator('#bw-time').selectOption('day');
    assert.equal((await state()).sky.phase, 'day');
    await page.locator('#bw-village').click();
    assert.equal((await state()).camera.y, -25);
    await page.locator('#bw-original').click();
    assert.equal((await state()).enabled, false);
    assert.equal((await state()).collisionsUnchanged, true);
    assert.equal(await page.locator('#bw-original').getAttribute('aria-pressed'), 'true');
    await screenshot('buttonwood-original-comparison');
    await page.locator('#bw-original').click();
    assert.equal((await state()).enabled, true);
    assert.equal((await state()).collisionsUnchanged, true);

    // Inspect a building through the actual world pointer handler.
    const homePoint = await page.evaluate(() => {
      const { camera, buildings } = window.__buttonwood.state;
      const home = buildings.find(b => b.type === 'home');
      const box = document.getElementById('game').getBoundingClientRect();
      return { x: box.x + box.width / 2 + (home.x + 64 - camera.x) * camera.z,
        y: box.y + box.height / 2 + (home.y + 84 - camera.y) * camera.z };
    });
    await page.mouse.click(homePoint.x, homePoint.y);
    await page.waitForFunction(() => document.getElementById('homePanel').open, null, { polling: 100 });
    assert.deepEqual(await page.locator('#bw-home-portrait').evaluate(canvas => {
      const box = canvas.getBoundingClientRect(); return [canvas.width, canvas.height, box.width, box.height];
    }), [128, 128, 128, 128]);
    const portraitLayout = await page.locator('#bw-home-portrait').evaluate(canvas => {
      const portrait = canvas.getBoundingClientRect(), panel = canvas.closest('dialog');
      const panelBox = panel.getBoundingClientRect(), header = panel.querySelector('header').getBoundingClientRect();
      const residents = document.getElementById('homeResidents').getBoundingClientRect();
      return {
        insidePanel: portrait.left >= panelBox.left && portrait.right <= panelBox.right &&
          portrait.top >= panelBox.top && portrait.bottom <= panelBox.bottom,
        afterHeader: portrait.top >= header.bottom,
        beforeResidents: portrait.bottom <= residents.top,
      };
    });
    assert.deepEqual(portraitLayout, { insidePanel: true, afterHeader: true, beforeResidents: true },
      'Native Home portrait stays inside the panel between its header and residents');
    assert.equal(await page.locator('#homePanel').evaluate(panel => panel.matches(':modal')), false);
    await page.locator('#homeClose').click();

    // All production buildings use the real pointer path and native portraits.
    for (const type of ['workshop', 'storehouse', 'forge', 'blacksmith']) {
      await clickBuilding(page, type);
      assert.deepEqual(await page.locator('#buildingHero canvas').evaluate(canvas => {
        return [canvas.width, canvas.height];
      }), buildingSizes[type], type + ' portrait retains the native canvas');
      if (type !== 'workshop') assert.deepEqual(await page.locator('#buildingHero canvas').evaluate(canvas => {
        const box = canvas.getBoundingClientRect(); return [box.width, box.height];
      }), buildingSizes[type], type + ' portrait is never stretched');
      if (type === 'workshop') {
        const recipeIcons = await page.evaluate(() => ['home', 'workshop', 'storehouse', 'forge', 'blacksmith'].map(type => {
          const img = document.querySelector('#craft-structure-' + type + ' .recipeBuilding');
          const box = img.getBoundingClientRect();
          return [img.naturalWidth, img.naturalHeight, box.width, box.height];
        }));
        assert.deepEqual(recipeIcons, Object.keys(buildingSizes).map(() => [32, 32, 32, 32]));
      }
      if (type === 'storehouse') {
        assert.equal(await page.locator('#buildingPanel').evaluate(panel => panel.matches(':modal')), false);
        const gap = await page.locator('#buildingPanel').evaluate(panel =>
          document.getElementById('bar').getBoundingClientRect().top - panel.getBoundingClientRect().bottom);
        assert.ok(Math.abs(gap - 8) < 2, 'Storehouse building inventory stays next to the toolbar');
      }
      await page.locator('#buildingClose').click();
    }
    await page.locator('#bw-industry').click();
    await screenshot('buttonwood-industry');

    // Advance the real settlement clock through both complete, thirty-second twilights.
    await page.locator('#bw-time').selectOption('sunrise');
    const dawnStart = await state();
    assert.equal(dawnStart.sky.seconds, 0);
    await page.evaluate(() => window.__buttonwood.fixture.advanceClock(15000));
    const dawnMid = await state();
    assert.equal(dawnMid.sky.phase, 'sunrise');
    assert.ok(dawnMid.sky.darkness > 0 && dawnMid.sky.darkness < dawnStart.sky.darkness);
    await page.evaluate(() => window.__buttonwood.fixture.advanceClock(15000));
    assert.equal((await state()).sky.phase, 'day');
    assert.equal((await state()).sky.darkness, 0);
    await page.locator('#bw-time').selectOption('sunset');
    const duskStart = await state();
    assert.equal(duskStart.sky.seconds, 150);
    await page.evaluate(() => window.__buttonwood.fixture.advanceClock(15000));
    const duskMid = await state();
    assert.equal(duskMid.sky.phase, 'sunset');
    assert.ok(duskMid.sky.darkness > 0 && duskMid.sky.darkness < 1);
    await screenshot('buttonwood-industry-sunset');
    await page.evaluate(() => window.__buttonwood.fixture.advanceClock(14999));
    const beforeDusk = await state();
    await page.evaluate(() => window.__buttonwood.fixture.advanceClock(1));
    const afterDusk = await state();
    assert.equal(afterDusk.sky.phase, 'night');
    assert.ok(Math.abs(beforeDusk.sky.darkness - afterDusk.sky.darkness) < .00001);
    for (const key of Object.keys(beforeDusk.sky.colors)) for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(beforeDusk.sky.colors[key][i] - afterDusk.sky.colors[key][i]) < .001,
        'Sunset crosses the gameplay phase boundary continuously');
    }
    await page.evaluate(() => window.__buttonwood.fixture.advanceClock(59999));
    const beforeDawn = await state();
    await page.evaluate(() => window.__buttonwood.fixture.advanceClock(1));
    const afterDawn = await state();
    assert.equal(afterDawn.sky.phase, 'sunrise');
    assert.ok(Math.abs(beforeDawn.sky.darkness - afterDawn.sky.darkness) < .00001);
    assert.deepEqual(beforeDawn.sky.colors, afterDawn.sky.colors, 'Midnight wrap begins sunrise without a color jump');
    await page.locator('#bw-time').selectOption('day');

    const beforeRender = await save();
    assert.ok(beforeRender.liquidSubV22.some(row => row[2] === 0), 'Sample contains water');
    assert.ok(beforeRender.liquidSubV22.some(row => row[2] === 1), 'Sample contains lava');
    await page.evaluate(() => {
      const sample = window.__buttonwood;
      for (let i = 0; i < 12; i++) {
        sample.setArt(i % 2 === 0); sample.view(i % 3 ? 'mine' : 'village', i % 3 + 1); sample.render(i * 90);
        if (!sample.state.collisionsUnchanged) throw new Error('Art toggle changed structure collision geometry');
      }
      sample.setArt(true); sample.view('village', 2);
    });
    const afterRender = await save();
    assert.deepEqual(afterRender.liquidSubV22, beforeRender.liquidSubV22, 'Rendering preserves every liquid cell amount');
    assert.deepEqual(afterRender.inv, beforeRender.inv, 'Rendering preserves resource quantities');
    assert.deepEqual(afterRender.removed, beforeRender.removed, 'Rendering preserves terrain');
    assert.deepEqual(afterRender.workersV55.clock, beforeRender.workersV55.clock, 'Rendering never advances the settlement clock');

    assert.ok(!beforeRender.removed.includes('-15,0'));
    await page.evaluate(() => window.__buttonwood.fixture.mine(-15, 0));
    const mined = await save();
    assert.ok(mined.removed.includes('-15,0'), 'Mining still removes a terrain cell');
    assert.equal(mined.removed.length, beforeRender.removed.length + 1);
    assert.ok(Object.keys(mined.inv).some(key => mined.inv[key] > (beforeRender.inv[key] || 0)), 'Mining awards a resource');
    await page.evaluate(() => window.__buttonwood.fixture.mine(7, 6));
    assert.equal((await sampleTerrain())['7,6'], null);
    assert.equal((await save()).inv.copperOre, mined.inv.copperOre + 3, 'Sample copper cell awards its defined three ore');
    assert.equal(await page.evaluate(() => window.__buttonwood.fixture.place('home', -384, -128)), true);
    const placed = await save();
    assert.equal((await state()).buildings.length, freshBuildings.length + 1);
    assert.equal(placed.structuresV46.bag.home, beforeRender.structuresV46.bag.home - 1);
    assert.equal((await state()).collisionsUnchanged, true);
    await normalUntouched();

    await loadSample();
    const restored = await save();
    assert.equal((await state()).saveKey, SAMPLE_KEY);
    assert.deepEqual((await state()).buildings, placed.structuresV46.buildings.map(({ id, type, x, y }) => ({ id, type, x, y })));
    assert.deepEqual(restored.removed, placed.removed);
    assert.deepEqual(restored.inv, placed.inv);
    assert.deepEqual(restored.liquidSubV22, placed.liquidSubV22);
    assert.equal(restored.structuresV46.bag.home, placed.structuresV46.bag.home);
    assert.equal((await state()).collisionsUnchanged, true);
    assert.deepEqual(await sampleTerrain(), { ...freshTerrain, '7,6': null },
      'Reload preserves surviving sample materials/ores and does not regenerate mined copper');
    await normalUntouched();

    // Use the real reset button after saved edits; pagehide must not resurrect the old save.
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.locator('#bw-reset').click(),
    ]);
    await page.waitForFunction(() => window.__buttonwood && !document.getElementById('load'), null, { polling: 100, timeout: 30000 });
    const resetSample = await save();
    assert.deepEqual((await state()).buildings, freshBuildings, 'Reset removes the newly placed Home');
    assert.deepEqual(resetSample.inv, freshSample.inv, 'Reset restores starter resources');
    assert.deepEqual(resetSample.removed, freshSample.removed, 'Reset restores mined terrain');
    assert.deepEqual(resetSample.structuresV46.bag, freshSample.structuresV46.bag);
    assert.deepEqual(await sampleTerrain(), freshTerrain, 'Reset recreates the three ore examples and stone floor');
    assert.equal((await state()).workers, 3);
    assert.equal((await state()).collisionsUnchanged, true);
    await normalUntouched();

    // Migrate a progressed pre-industry save, including an occupied preferred site.
    const legacy = structuredClone(restored);
    delete legacy.structuresV46.buttonwoodIndustry;
    legacy.structuresV46.buildings = legacy.structuresV46.buildings.filter(b => b.type === 'home' || b.type === 'workshop');
    legacy.structuresV46.buildings.find(b => b.type === 'home').x = -576;
    legacy.structuresV46.buildings.find(b => b.type === 'workshop').stock.wood = 13;
    legacy.inv.wood = 207;
    const preferredSite = freshBuildings.find(b => b.type === 'storehouse');
    const blocker = { material: 'dirt', x: preferredSite.x + 16, y: -16, w: 31, h: 31, cost: 1,
      nailed: true, hits: 0, angle: 0, vx: 0, vy: 0, av: 0 };
    legacy.placed.push(blocker);
    const migrationContext = await browser.newContext({ viewport: { width: 1100, height: 820 } });
    const migration = await migrationContext.newPage(); await prepare(migration);
    await migration.addInitScript(({ sampleKey, normalKey, sample, normal }) => {
      if (!sessionStorage.getItem('buttonwood-old-save-seeded')) {
        localStorage.setItem(sampleKey, JSON.stringify(sample));
        localStorage.setItem(normalKey, normal);
        sessionStorage.setItem('buttonwood-old-save-seeded', '1');
      }
    }, { sampleKey: SAMPLE_KEY, normalKey: NORMAL_KEY, sample: legacy, normal: sentinel });
    const reloadMigration = async () => {
      await migration.goto(sampleURL.href, { waitUntil: 'domcontentloaded' });
      await migration.waitForFunction(() => window.__buttonwood && !document.getElementById('load'),
        null, { polling: 100, timeout: 30000 });
    };
    const migrationSave = () => migration.evaluate(key => {
      window.__buttonwood.save(); return JSON.parse(localStorage.getItem(key));
    }, SAMPLE_KEY);
    await reloadMigration();
    const migrated = await migrationSave();
    assert.equal(migrated.structuresV46.buttonwoodIndustry.version, 1);
    assert.equal(migrated.structuresV46.buildings.length, legacy.structuresV46.buildings.length + 3);
    for (const prior of legacy.structuresV46.buildings) assert.deepEqual(
      migrated.structuresV46.buildings.find(b => b.id === prior.id), prior,
      'Adding the review district preserves every existing building and its inventory');
    assert.deepEqual(migrated.inv, legacy.inv, 'Migration preserves earned resources');
    assert.deepEqual(migrated.removed, legacy.removed, 'Migration never overwrites mined terrain');
    assert.deepEqual(migrated.damage, legacy.damage, 'Migration preserves partial mining');
    assert.deepEqual(migrated.placed, legacy.placed, 'Migration never moves or removes placed blocks');
    assert.deepEqual(migrated.structuresV46.bag, legacy.structuresV46.bag, 'Migration preserves crafted building inventory');
    assert.deepEqual(migrated.workersV55.clock, legacy.workersV55.clock, 'Migration preserves the saved day/night time');
    const newBuildings = migrated.structuresV46.buildings.filter(b => !legacy.structuresV46.buildings.some(old => old.id === b.id));
    assert.deepEqual(newBuildings.map(b => b.type).sort(), ['blacksmith', 'forge', 'storehouse']);
    assert.notEqual(newBuildings.find(b => b.type === 'storehouse').x, preferredSite.x,
      'The blocked preferred site forces relocation rather than deleting the player block');
    for (const b of newBuildings) {
      const [w, h] = buildingSizes[b.type];
      const overlapsBlock = b.x < blocker.x + blocker.w / 2 && b.x + w > blocker.x - blocker.w / 2 &&
        b.y < blocker.y + blocker.h / 2 && b.y + h > blocker.y - blocker.h / 2;
      assert.equal(overlapsBlock, false, 'New buildings avoid the existing placed block');
    }
    assert.equal(await migration.evaluate(key => localStorage.getItem(key), NORMAL_KEY), sentinel);

    // Packing is a lasting player choice: the district marker must prevent respawn.
    await clickBuilding(migration, 'storehouse');
    await migration.locator('#buildingPack').click();
    const packed = await migrationSave();
    assert.equal(packed.structuresV46.buildings.some(b => b.type === 'storehouse'), false);
    assert.equal(packed.structuresV46.bag.storehouse, migrated.structuresV46.bag.storehouse + 1);
    assert.deepEqual(packed.structuresV46.buttonwoodIndustry, migrated.structuresV46.buttonwoodIndustry);
    for (let n = 0; n < 2; n++) {
      await reloadMigration();
      const afterReload = await migrationSave();
      assert.deepEqual(afterReload.structuresV46.buildings.map(restoredBuilding), packed.structuresV46.buildings.map(restoredBuilding),
        'Reload never respawns a packed review building');
      assert.deepEqual(afterReload.structuresV46.bag, packed.structuresV46.bag);
      assert.deepEqual(afterReload.inv, packed.inv);
      assert.deepEqual(afterReload.placed, packed.placed);
      assert.deepEqual(afterReload.structuresV46.buttonwoodIndustry, packed.structuresV46.buttonwoodIndustry);
    }
    await migrationContext.close();

    // The approved art is the default renderer; review controls and fixture seeding stay isolated.
    const prepareProduction = async target => {
      await prepare(target);
      // Read-only test inspection is injected by the test, never shipped in the production API.
      await target.route('**/game-v8-part3.txt*', async route => {
        const response = await route.fetch(), source = await response.text();
        const inspector = `window.productionArtTest = {
          inspect() {
            const cells = [[2,8],[8,8],[14,8],[7,6],[10,6],[2,6],[8,0],[9,0],[19,8]].map(([x,y]) => {
              const z=grid.get(key(x,y)),material=terrainMaterial(x,y),ore=oreAtV44(x,y,material);
              return {key:key(x,y),actual:z?{material:z.game.material,resourceType:z.game.resourceType??null,resourceAmount:z.game.resourceAmount??0,hits:z.game.hits??0}:null,
                natural:{material,resourceType:ore?.type??null,resourceAmount:ore?.amount??0,hits:terrainDamage.get(key(x,y))||0}};
            });
            return {cells,trees:[...bs].filter(z=>z.game?.naturalTree).length,best};
          }
        };`;
        await route.fulfill({ response, body: source.replace('restoreDynamicState(initialSave);',
          'restoreDynamicState(initialSave);' + inspector) });
      });
    };
    const productionReady = target => target.waitForFunction(() => window.__buttonwood &&
      window.productionArtTest && !document.getElementById('load'), null, { polling: 100, timeout: 30000 });
    const productionSave = target => target.evaluate(key => {
      window.__buttonwood.save(); return JSON.parse(localStorage.getItem(key));
    }, NORMAL_KEY);
    const productionUI = target => target.evaluate(() => ({
      title: document.title, art: typeof window.ButtonwoodArt,
      controls: !!document.getElementById('bw-controls'), note: !!document.getElementById('bw-note'),
      sampleClass: document.body.classList.contains('buttonwood-sample'),
      artClass: document.body.classList.contains('buttonwood-art'),
      fixture: typeof window.__buttonwood.fixture, timeControl: typeof window.__buttonwood.time,
      viewControl: typeof window.__buttonwood.view, comparison: typeof window.__buttonwood.setArt,
      questVisible: getComputedStyle(document.getElementById('quest')).display !== 'none',
      hudTop: document.getElementById('hud').getBoundingClientRect().top,
    }));
    const normalContext = await browser.newContext({ viewport: { width: 1100, height: 820 } });
    const normal = await normalContext.newPage(); await prepareProduction(normal);
    const normalRequests = [];
    normal.on('request', request => { if (new URL(request.url()).pathname.includes('/buttonwood/')) normalRequests.push(new URL(request.url()).pathname.split('/').pop()); });
    await normal.goto(baseURL.href, { waitUntil: 'domcontentloaded' });
    await productionReady(normal);
    const normalState = await normal.evaluate(() => window.__buttonwood.state);
    assert.equal(normalState.enabled, true);
    assert.equal(normalState.saveKey, NORMAL_KEY);
    assert.equal(normalState.workers, 0, 'A new production game receives no sample Workers');
    assert.deepEqual(normalState.buildings, [], 'A new production game receives no demonstration buildings');
    assert.equal(normalState.collisionsUnchanged, true);
    const normalUI = await productionUI(normal);
    assert.deepEqual({ ...normalUI, hudTop: undefined }, {
      title: 'Tower of Babel', art: 'object', controls: false, note: false,
      sampleClass: false, artClass: true, fixture: 'undefined', timeControl: 'undefined',
      viewControl: 'undefined', comparison: 'undefined', questVisible: true, hudTop: undefined,
    });
    assert.ok(normalUI.hudTop < 80, 'Production HUD keeps its normal position without a review toolbar gap');
    for (const asset of ['palette.js', 'sky.js', 'workers.js', 'buildings.js', 'environment.js', 'integration.txt']) {
      assert.ok(normalRequests.includes(asset), 'Production loads approved Buttonwood asset ' + asset);
    }
    const cleanWorld = await normal.evaluate(() => window.productionArtTest.inspect());
    assert.equal(cleanWorld.best, 0, 'Art rollout preserves ordinary unlock progression');
    assert.ok(cleanWorld.trees > 0, 'A fresh production world keeps natural trees');
    for (const cell of cleanWorld.cells) assert.deepEqual(cell.actual, cell.natural,
      'Production terrain at ' + cell.key + ' is procedural, without sample basin/ore decoration');
    const cleanSave = await productionSave(normal);
    assert.ok(Object.values(cleanSave.inv).every(value => value === 0), 'Art rollout grants no demo resources');
    assert.ok(Object.values(cleanSave.structuresV46.bag).every(value => value === 0), 'Art rollout grants no crafted buildings');
    assert.equal(Object.hasOwn(cleanSave.structuresV46, 'buttonwoodIndustry'), false,
      'Review district metadata is not added to production saves');
    assert.equal(await normal.evaluate(key => localStorage.getItem(key), SAMPLE_KEY), null);
    await normal.locator('#structuresOpen').click();
    assert.deepEqual(await normal.evaluate(() => ['home', 'workshop', 'storehouse', 'forge', 'blacksmith'].map(type => {
      const image = document.querySelector('#structure-card-' + type + ' img'), box = image.getBoundingClientRect();
      return [image.naturalWidth, image.naturalHeight, box.width, box.height];
    })), Object.keys(buildingSizes).map(() => [32, 32, 32, 32]));
    await normal.locator('#structuresClose').click();
    await normalContext.close();

    // An existing normal save migrates only its appearance and remains separate from the review world.
    const productionRecord = structuredClone(restored);
    delete productionRecord.structuresV46.buttonwoodIndustry;
    productionRecord.inv.wood = 247;
    productionRecord.inv.gold = 31;
    productionRecord.structuresV46.buildings.find(b => b.type === 'storehouse').stock = { wood: 71, stone: 38, coal: 9 };
    productionRecord.damage = [['19,8', 1]];
    productionRecord.placed.push({ material: 'stone', x: 496, y: -16, w: 31, h: 31, cost: 1,
      nailed: true, hits: 0, angle: 0, vx: 0, vy: 0, av: 0 });
    productionRecord.miners[0].gold = 12;
    productionRecord.miners[1].dir = -1;
    productionRecord.cam = { x: 720, y: -140 };
    productionRecord.workersV55.clock = { day: 7, phase: 'day', elapsed: 164500 };
    const preservedSample = JSON.stringify(legacy);
    const productionContext = await browser.newContext({ viewport: { width: 1100, height: 820 } });
    const production = await productionContext.newPage(); await prepareProduction(production);
    await production.addInitScript(({ normalKey, sampleKey, record, sample }) => {
      if (!sessionStorage.getItem('buttonwood-production-seeded')) {
        localStorage.setItem(normalKey, JSON.stringify(record));
        localStorage.setItem(sampleKey, sample);
        sessionStorage.setItem('buttonwood-production-seeded', '1');
      }
    }, { normalKey: NORMAL_KEY, sampleKey: SAMPLE_KEY, record: productionRecord, sample: preservedSample });
    const assertProductionSave = async () => {
      const actual = await productionSave(production);
      for (const field of ['inv', 'removed', 'damage', 'placed', 'miners', 'restingMiners', 'cam',
        'best', 'pickaxeTier', 'pickaxeOwnedTier', 'deepslateUnlocked', 'deadMiners', 'liquidSubV22']) {
        assert.deepEqual(actual[field], productionRecord[field], 'Buttonwood rollout preserves production ' + field);
      }
      assert.deepEqual(actual.structuresV46.buildings.map(restoredBuilding), productionRecord.structuresV46.buildings.map(restoredBuilding),
        'Every existing building, position, recipe and building inventory survives art migration');
      assert.deepEqual(actual.structuresV46.bag, productionRecord.structuresV46.bag);
      assert.equal(Object.hasOwn(actual.structuresV46, 'buttonwoodIndustry'), false);
      assert.deepEqual(actual.workersV55, productionRecord.workersV55, 'Worker families, ladders and saved time remain unchanged');
      assert.equal(await production.evaluate(key => localStorage.getItem(key), SAMPLE_KEY), preservedSample,
        'Production loading and saving never modify the isolated review save');
      assert.equal((await production.evaluate(() => window.__buttonwood.state)).collisionsUnchanged, true);
      return actual;
    };
    for (let reload = 0; reload < 2; reload++) {
      await production.goto(baseURL.href, { waitUntil: 'domcontentloaded' });
      await productionReady(production);
      await assertProductionSave();
      const actualState = await production.evaluate(() => window.__buttonwood.state);
      assert.equal(actualState.sky.phase, 'sunset', 'Production lighting reads the existing settlement time');
      assert.equal(actualState.sky.seconds, 164.5);
      const inspection = await production.evaluate(() => window.productionArtTest.inspect());
      for (const cell of inspection.cells) if (cell.actual) assert.deepEqual(cell.actual, cell.natural,
        'Loading a production save never reapplies sample terrain art fixtures');
      await production.evaluate(() => { for (let frame = 0; frame < 8; frame++) window.__buttonwood.render(frame * 200); });
      await assertProductionSave();
      if (process.env.BW_SCREENSHOT_DIR) await production.screenshot({
        path: path.join(process.env.BW_SCREENSHOT_DIR, 'buttonwood-production.png'),
      });
    }
    await productionContext.close();

    // Exercise the actual animation loop in a fresh sample world as well.
    const liveContext = await browser.newContext({ viewport: { width: 1100, height: 820 } });
    const live = await liveContext.newPage(); await prepare(live, false);
    await live.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: NORMAL_KEY, value: sentinel });
    await live.goto(sampleURL.href, { waitUntil: 'domcontentloaded' });
    await live.waitForFunction(() => window.__buttonwood && !document.getElementById('load'), null, { polling: 100, timeout: 30000 });
    const liveBefore = await live.evaluate(() => window.__buttonwood.state);
    await live.locator('#bw-mine').click();
    const liveTiming = await live.evaluate(() => new Promise((resolve, reject) => {
      const started = performance.now(); let frames = 0;
      const timeout = setTimeout(() => reject(new Error('Live animation loop stopped')), 15000);
      function observe(now) {
        frames++;
        if (now - started < 1200) return requestAnimationFrame(observe);
        clearTimeout(timeout); resolve({ frames, elapsed: now - started });
      }
      requestAnimationFrame(observe);
    }));
    assert.ok(liveTiming.frames >= 2, 'The live animation loop renders successive frames');
    const liveAfter = await live.evaluate(() => { window.__buttonwood.save(); return window.__buttonwood.state; });
    assert.ok(liveAfter.liquids.fixedSteps > liveBefore.liquids.fixedSteps, 'The unchanged liquid solver advances during live play');
    assert.equal(liveAfter.collisionsUnchanged, true);
    assert.equal(await live.evaluate(key => localStorage.getItem(key), NORMAL_KEY), sentinel);
    assert.ok(await live.evaluate(key => !!localStorage.getItem(key), SAMPLE_KEY));
    await liveContext.close();

    const liveProductionContext = await browser.newContext({ viewport: { width: 1100, height: 820 } });
    const liveProduction = await liveProductionContext.newPage(); await prepare(liveProduction, false);
    await liveProduction.addInitScript(({ key, value }) => localStorage.setItem(key, value),
      { key: SAMPLE_KEY, value: preservedSample });
    await liveProduction.goto(baseURL.href, { waitUntil: 'domcontentloaded' });
    await liveProduction.waitForFunction(() => window.__buttonwood && !document.getElementById('load'),
      null, { polling: 100, timeout: 30000 });
    const productionBefore = await liveProduction.evaluate(() => window.__buttonwood.state);
    await liveProduction.waitForFunction(elapsed => window.__buttonwood.state.clock.elapsed >= elapsed + 1000,
      productionBefore.clock.elapsed, { polling: 100, timeout: 15000 });
    const productionAfter = await liveProduction.evaluate(() => { window.__buttonwood.save(); return window.__buttonwood.state; });
    assert.equal(productionAfter.sky.phase, 'sunrise');
    assert.ok(productionAfter.sky.darkness < productionBefore.sky.darkness,
      'Real production frames smoothly brighten sunrise as the normal game clock advances');
    assert.ok(productionAfter.liquids.fixedSteps > productionBefore.liquids.fixedSteps,
      'The normal liquid simulation keeps advancing with the approved renderer');
    assert.equal(productionAfter.collisionsUnchanged, true);
    assert.equal(productionAfter.workers, 0);
    assert.deepEqual(productionAfter.buildings, []);
    assert.equal(await liveProduction.evaluate(key => localStorage.getItem(key), SAMPLE_KEY), preservedSample);
    assert.ok(await liveProduction.evaluate(key => !!localStorage.getItem(key), NORMAL_KEY));
    await liveProductionContext.close();
    assert.deepEqual(errors, [], 'No browser runtime or console errors');
    console.log('PASS Buttonwood save isolation/reset, all five native building sprites/icons/portraits, thirty-second sunrise/sunset and clock continuity, safe additive migration with blocked-site relocation and packed-building persistence, terrain/ore persistence, collision invariance, read-only rendering, mining/building save roundtrip, default production art without review controls or fixtures, existing production save and Worker preservation, and live simulation');
    console.log(`Live smoke check: ${liveTiming.frames} frames over ${Math.round(liveTiming.elapsed)} ms`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
