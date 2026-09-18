# Buttonwood QA evidence

September 16, 2026. The user approved the native foundation, rich meadow,
industry buildings, and twilight for the default game presentation.

## Checks run

### Default-game promotion

The expanded `buttonwood-browser.test.cjs` passes with Buttonwood enabled by default.
Fresh games retain their procedural terrain and normal starting resources, with no
sample buildings, Workers, controls, or time jumps. Existing `skyStack.save.v1`
inventories, buildings and building inventories, placed blocks, mining/damage,
Workers, camera, liquids, and clock survive rendering and repeated reloads. The
separate sample save remains untouched. The live production sunrise and liquid
simulation advance normally, with no runtime or console errors.

Unit checks passed for liquids, Worker rhythm, developer controls, automation
audio, sky, night audio, connected terrain, and Buttonwood sky. Default-game HUD,
control icons, and guide text were checked against the warm panel backgrounds.

Release browser suites passed for industry, structures, Storehouses, player
crafting, crafting inventory, pickaxes, Workers, and Buttonwood. Structures and
Worker checks now follow the current timed crafting UI and building inventory
outputs, while retaining mouse/touch placement, physical support, production
timing, save migration, families, and mobile coverage.

### Industry and twilight expansion

The sample now includes all five building types: Home and Workshop at 128 × 128,
Storehouse and Blacksmith at 160 × 128, and Forge at 96 × 96. Every type has its own
32 × 32 miniature and native-size portrait. New details include the Forge flame
cycle (720ms), Blacksmith hammer cycle (810ms), restrained smoke/sparks, and warm
window, lantern, and hearth lights. Native sprite, icon, action, and full-strength
light frames passed palette-only and binary-alpha checks.

`sky.js` renders a 30-second sunrise at seconds 0–30 and a 30-second sunset at
150–180 of the existing 240-second saved clock. Continuous sky colors, an ambient
world tint, and warm building lights make the transitions visible across the
whole scene. The clock and simulation rules are unchanged.

- `node tower-of-babel/tests/buttonwood-sky.test.cjs` — continuous palettes and
  lighting at all transition boundaries and midnight wrap, complete 30-second
  dawn/dusk progression, saved-clock purity, integer scenery pixels, and sky
  clipping above the underground cutaway.
- `node tower-of-babel/tests/buttonwood-browser.test.cjs` — all five native world
  sprites, miniatures, and portraits; actual engine clock progression and
  boundaries; sample save isolation; unchanged collision masks; read-only rendering;
  mining/building roundtrips; sample-only activation before promotion; and live simulation.
- Additive migration regression — a progressed sample keeps earned resources,
  every old building and its inventory, terrain edits, placed blocks, crafted
  building inventory, and saved time. A blocked Industry site relocates the new
  district. The persisted `structuresV46.buttonwoodIndustry` marker adds the
  district only once; packing a review building remains persistent across reloads.
- Native/3× structure sheets and native/2× action and lighting sheets inspected;
  Home and Workshop base sprites and miniatures retain their original drawing.

### Rich meadow revision

The follow-up replaces dry tan soil with rich loam, a dark organic horizon,
roots, and fuller sod. Dirt, stone, and deepslate now use continuous world-space
textures and neighbor-aware joins. The shared texture period is 128 world pixels;
cached final tiles remain 32 × 32, with a maximum of 768 cached combinations.

- `node tower-of-babel/tests/buttonwood-terrain.test.cjs` — nine groups covering
  eight-way neighbors, negative coordinates, excavation refresh, aligned multi-cell
  placements, motion/alignment rejection, overlaps, surface-only meadow, and purity.
- The focused browser regression passes with the updated renderer, including live
  simulation, saves, mining/building, and unchanged collisions/liquid state.
- 192 terrain configurations were checked for fully opaque, palette-only pixels.
- Desktop/mobile village, mine, and connected terrain gallery inspected.

Cross-material feathering covers dirt/stone/deepslate. Other materials retain
their existing Buttonwood textures. Moving, rotated, or off-grid blocks deliberately
keep their own internal joins instead of visually attaching to unrelated terrain.

### Original Phase 1 checks

- `node tower-of-babel/tests/liquids.test.cjs` — conservation, flow, barriers,
  timestep independence, lava viscosity, reaction/save behavior, and compilation.
- `node tower-of-babel/tests/miners.test.cjs` — Worker rhythm, level permissions,
  material selection, and staggered decision performance.
- `node tower-of-babel/tests/sky.test.cjs` — sky state, saved time, and clipping.
- `node tower-of-babel/tests/buttonwood-browser.test.cjs` — actual engine in Chrome:
  isolated saves, reset, sample terrain persistence, mining and placement roundtrips,
  old collision masks, native asset/UI sizes, Home portrait containment, controls,
  read-only liquid rendering, ordinary-mode exclusion, and a live simulation check.
- Desktop and 390 × 844 mobile gallery/sample inspection — no page errors or
  horizontal page overflow. Chrome device scale 1; sprites use integer art scales.
- Native asset review — cached sprites, binary alpha, shared palette, unclipped
  Worker canvases, and separately authored 32 × 32 miniatures.

Serve the repository over HTTP. Set `SKY_TEST_URL` to the game's base URL and
`SKY_TEST_BROWSER` to Chromium if needed. The browser test requires Playwright;
`BW_SCREENSHOT_DIR` writes deterministic scene and comparison screenshots below.

## Review images

| Image | What it shows |
|---|---|
| [Industry district](buttonwood-industry.png) | Storehouse, Forge, and Blacksmith in the real engine. |
| [Industry at sunset](buttonwood-industry-sunset.png) | Warm twilight and building lights during the 30-second transition. |
| [Industry at night](buttonwood-industry-night.png) | Lit windows, lanterns, and hearths against the cool night sky. |
| [Industry sprites](industry-sprites.png) | Three new native sprites, 3× inspection, and separately authored miniatures. |
| [Industry motion and lights](industry-frames.png) | Forge/Blacksmith action poses plus warm lights across all five buildings. |
| [Village, 1×](buttonwood-village-native.png) | Native world scale with the actual game UI. |
| [Village, 2×](buttonwood-village.png) | Workers, Home, Workshop, ground, and UI together. |
| [Village, live daytime](village-day-live.png) | Running scene after Workers settle onto the ground. |
| [Original comparison](buttonwood-original-comparison.png) | Original artwork in the same sample world. |
| [Mine at night](buttonwood-mine-night.png) | Underground terrain, ores, and liquid pools. |
| [Mine, live daytime](mine-day-live.png) | Real running engine with water and lava. |
| [Village, live night](village-night-live.png) | Dark scenery with native foreground palette. |
| [Mobile sample](sample-mobile.png) | Playable scene and controls at 390px width. |
| [Art gallery](art-study.png) | Authored sprites, miniatures, materials, and reference. |
| [Connected meadow](connected-meadow.png) | Rich soil, roots, cut corners, and soil-to-stone joins. |
| [Mobile gallery](art-study-mobile.png) | Responsive art inspection. |

The [animated gallery](../index.html) shows full idle, walk, and work cycles.
The playable sample shows the existing engine's actual movement and strike timing.
Screenshots are evidence of rendered states, not an animation or gameplay substitute.

## Deliberate compatibility and remaining work

The existing structural collision envelopes are intentionally retained for save
and physics compatibility. Decorative roof curves do not change placement or support.
The engine currently shows impact and recovery; pre-strike anticipation remains
deferred. Ages, effects, and many UI icons retain existing art. Complete weather
presentation and remaining scenery/depth layers are deferred.

The sample screenshots above document the artwork shared with ordinary gameplay;
its review controls and free fixtures remain exclusive to the opt-in sample.

## UI complaint batch — September 17, 2026

UI-001 through UI-005 received local implementation and technical/visual review.
`ui.js` supplies a work-glove Move icon, four readable pickaxe tiers, a Craft
hammer, the disclosure chevron, and deliberately drawn square wood, stone, dirt,
and deepslate miniatures. Every icon has a native 32 × 32 canvas and uses named
palette tokens. Ingots retain their separate identity. Structures descriptions
remain inline, with 44 × 44 disclosure targets and synchronized expanded state.

Structures, field-guide chapters, and the three building information sections
share reversible height motion. Closing content is immediately inert; keyboard
focus returns to its trigger if needed. Rapid toggles, changing heights, desktop
restoration, and reduced-motion preferences are covered by regression checks.
Top-level phone tabs and unrelated dialogs are excluded from this animation.

Passed on local Chrome with isolated temporary browser profiles:

- `disclosures-browser.test.cjs`: motion and interaction edge cases, art palette,
  binary alpha, native size, square silhouettes, all resource rows, four equipped
  tiers, crafting states, gallery loading, and mouse/touch state captures.
- `mobile-ui-browser.test.cjs`: 320 × 568, 390 × 844, 430 × 932, and 844 × 390;
  phone scrolling, long-press suppression, rotation, header/toolbar bounds,
  inventory interactions, top-layer notices, and desktop restoration.
- `player-crafting-browser.test.cjs`, `pickaxe-browser.test.cjs`,
  `structures-browser.test.cjs`, and `storehouses-browser.test.cjs`: crafting,
  touch mining/dragging, transfers, progression, physics, and save reloads.
- `buttonwood-browser.test.cjs`: ordinary saves and sample isolation, native art,
  preserved collision envelopes, read-only rendering, and live simulation.

Review evidence (screenshots show rendered states; animation is tested in-browser):

- [Native UI family](ui-native.png)
- [Desktop Structures](ui-desktop.png) and [pickaxe tiers](ui-pickaxes.png)
- [Phone inline description](ui-phone.png) and [active crafting](ui-crafting.png)
- [Smallest phone](ui-small-phone.png) and [scrolled landscape](ui-landscape.png)

The gallery includes a dedicated native-size tools and pocket-block section.
This batch does not implement the six-slot hotbar, item reassignment, buckets,
or claim a fix for the background report that still needs reproduction.

## BUG-001 — fractional-zoom background seams, September 17, 2026

**Reproduced and fixed locally.** At a 390 × 844 viewport, DPR 1, camera
`{x: 0, y: -180, z: 1.15}`, and daytime elapsed 90,000ms, the old background
shows thin horizontal dark lines between sky bands and vertical lines between
hill columns. The deterministic fixture sets those values in ordinary gameplay;
the regression also exercises real two-finger zoom, panning, and camera buttons.
Exact browser, coordinates, and pixel readings are in [background-repro.json](background-repro.json).

**Confirmed cause:** integer sky rectangles were drawn directly through a
fractional camera transform. Each edge received partial antialias coverage.
Adjacent sky bands therefore left dark cave color visible between them; adjacent
hill columns mixed with the lighter sky behind them. At the captured band seam,
RGB `[180,189,176]` is darker than either adjoining band, `[202,222,208]` and
`[207,224,207]`. This is a rendering seam, not intentional underground occlusion
or missing canvas coverage.

**Fix:** paint the existing scenery into one reusable canvas at one world unit
per art pixel, then apply camera zoom once with nearest-neighbor compositing.
The captured middle pixel is now `[202,222,208]`, and hill columns meet cleanly.
The painter, palette, scenery geometry, clocks, world scale, and camera behavior
are unchanged. The temporary canvas resizes with the viewport and zoom.

- [Before: sky and hill seams](background-seams-before.png)
- [After: identical background, clean joins](background-seams-after.png)
- [Ordinary gameplay after the fix](background-game-after.png)
- [Landscape sunset after rotation](background-landscape-after.png)

Validation passed:

- `background-browser.test.cjs`: rejects the old renderer, passes the captured
  seam and 300 full-frame native-color/coverage checks across five viewport and
  density combinations, five zoom levels, four phases, and three camera positions.
- Real pinch and touch pan, 64 intermediate Top/Down frames, rotation and resize;
  camera/clock purity and canvas transform/alpha/smoothing restoration.
- `buttonwood-sky.test.cjs` and `buttonwood-terrain.test.cjs`: lighting continuity,
  underground clipping, native geometry, connected terrain, and state purity.
- `buttonwood-browser.test.cjs`: saves, sample isolation, native assets, unchanged
  collision envelopes, liquid render purity, and live simulation (73 frames in
  1,203ms in the local smoke check).

This fixes the reproduced zoom-dependent artifact. A visually different future
background report should receive its own reproduction rather than being assumed
to have the same cause.

## Six-slot toolbar, buckets and mobile holds — September 18, 2026

The remaining UI-006, UI-007 and GAME-001 requests are implemented together.
Slots 1–3 are Pickaxe, Move and Structures; 4–6 hold assigned inventory items.
The attached picker supports blocks, available Workers and empty/filled buckets.
Crafting a reusable bucket costs five iron ingots. The full acquisition, migration,
zero-stock, duplicate, crafting and liquid rules are in the [test notes](../../tests/README.md#six-slot-inventory-and-buckets--v68).

Visual review at native icon size:

- [Desktop toolbar](v68-hotbar-desktop.png)
- [390px phone toolbar](v68-hotbar-phone.png)
- [320px inventory picker](v68-inventory-phone.png)
- [Landscape inventory picker](v68-inventory-landscape.png)
- [WebKit 320px phone](v68-webkit-phone.png)
- [Native item art gallery](v68-native-items.png)

Automated validation passed locally in Chrome 153 and Playwright WebKit 26.5:

- `hotbar-browser.test.cjs` in both engines, desktop and touch contexts: six
  numbered slots, real harvest acquisition order, overflow, duplicates, zero
  stock, Worker eligibility, keyboard access/focus, persistence, old-save
  migration, future bucket IDs, all new icons at 32px with named-palette opaque
  pixels, and portrait/landscape panel bounds.
- Thirty bucket transaction assertions per context: five-ingot crafting,
  insufficient supplies, one-block volume, partial/mixed/disconnected sources,
  blocked/unloaded/out-of-world/occupied destinations, negative coordinates,
  grid-off placement, reusable buckets, obsidian reactions, and conservative
  solver updates. Real mouse and touch roundtrips at 1.35× zoom survive reloads.
- Chrome sends actual touch input for 950ms bucket holds, 900ms UI holds, dragging,
  cancellation, two-finger zoom and picker scrolling. Only an unmoved release
  uses the bucket. Pinch/drag/cancel leave resources unchanged.
- Root selection rules apply without a coarse-pointer condition. Context menus,
  selection starts and browser image dragging are suppressed outside editable
  controls; selection changes clear non-editable ranges. Hidden legacy controls
  are inert and removed from toolbar/shortcut enumeration. Input editing remains
  available. WebKit does not emit `selectionchange` for wholly hidden DOM ranges,
  so the suite checks both empty visible selection and the guard's explicit event.
- Existing browser regressions passed: Keyboard, Mobile UI, Disclosures, Trees,
  Pickaxe, Structures, Storehouses, Player crafting, Crafting inventory, Infinite
  resources, Workers, Industry, Buttonwood integration and Background. The
  Infinite resources test now advances its 1.5-second craft explicitly instead
  of depending on incidental browser delays.
- Liquid, Buttonwood terrain and Buttonwood sky unit regressions passed, including
  production bundle compilation and liquid save/reaction checks.

These are isolated automated browser runs and visual reviews on macOS, including
mobile viewport/touch emulation. Physical iPhone and Android hardware was not
available. Ordinary and optional sample saves remain isolated; source and `dist/`
are synchronized.
