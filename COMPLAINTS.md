# Player complaints and requested improvements

Logged: 2026-09-17. Source: player feedback in the mobile UI task.
Implementation authorized in the subsequent complaint-fixing tasks; UI-001–UI-005
and BUG-001 completed and verified on 2026-09-17. Remaining gameplay choices stay open.

## How agents should use this log

This is a backlog, not a record of completed implementation. The logging request
explicitly authorizes documentation only; no gameplay or UI fixes were made as
part of logging it. Implement items when a subsequent task authorizes that work.

- Keep stable IDs. Use `Open`, `Investigating`, `In progress`, or `Blocked`.
- Before implementation, read [AGENTS.md](AGENTS.md) and the
  [Buttonwood art guide](tower-of-babel/buttonwood/ART-GUIDE.md).
- Record findings separately from assumptions. Clarify unresolved gameplay choices
  during implementation; do not silently treat suggestions below as approved rules.
- Mark an item complete only after its acceptance criteria have been checked.
  Move its section to **Archive** with the completion date, commit, and validation
  evidence. Keep active complaints short and useful. Archived entries may later
  be deleted if their history is preserved in Git.
- Preserve saves, collision envelopes, native pixel scale, accessible labels,
  phone scrolling, long-press gameplay, and top-layer temporary notifications.
- Runtime changes must follow the repository's source/`dist/` synchronization
  workflow. This planning document does not need a deployment copy.

## Preserve what the player likes

The player **loves the inline information reveal in Structures**. Retain its
placement and content flow. Change its trigger art and add motion without
replacing it with a modal, tooltip, or unrelated information layout.

## Active complaints

### UI-006 — Six-slot toolbar in two groups of three

**Status:** Open · **Type:** Toolbar redesign · **Related:** UI-007, GAME-001

**Player request:** Split the toolbar into two groups of three, in this exact order:

| Group | Slot | Contents |
| --- | --- | --- |
| Left | 1 | Pickaxe |
| Left | 2 | Move |
| Left | 3 | Structures |
| Right | 4 | Initially empty; assignable inventory item |
| Right | 5 | Initially empty; assignable inventory item |
| Right | 6 | Initially empty; assignable inventory item |

Newly mined item types occupy the lowest-numbered empty right-hand slot.
The player's explicit example is **dirt → 4, leaves → 5, wood → 6**, in that
acquisition order. Do not revert to a fixed resource ordering.

**Initial investigation:** The toolbar starts in
[index.html](tower-of-babel/index.html) and Structures is inserted by later UI
modules. Current resources have their own fixed `data-tool` slots. Numeric
shortcuts in [game-v52-keyboard.txt](tower-of-babel/game-v52-keyboard.txt) select
buttons by current DOM order. The phone layer hides locked slots and horizontally
scrolls the bar in [style-v66-mobile-ui.css](tower-of-babel/style-v66-mobile-ui.css).
This requires coordinated input, inventory, and UI work, not just CSS reordering.

**Acceptance criteria:**

- Present exactly six numbered slots, visibly grouped 1–3 and 4–6 on PC and phone.
- Keep Pickaxe, Move, and Structures fixed in slots 1, 2, and 3.
- Show three empty boxes before assignable items are acquired.
- Auto-fill the lowest empty slot when a new mined type enters inventory.
  Additional units of an assigned type update its count without taking another slot.
- Reproduce the dirt/leaves/wood example exactly.
- Once all three slots are occupied, retain additional items in inventory without
  silently replacing the player's existing assignments.
- Make number shortcuts 1–6 match the displayed slots, and review legacy 7–0
  behavior so hidden old slots cannot remain active accidentally.
- Preserve inventory quantities and existing saves; define migration of old worlds
  and persistence of chosen slot assignments.

**Decisions to resolve:** What happens to a slot when its count reaches zero?
How are already-owned items assigned on first load after migration? Can one type
occupy more than one slot? How do non-mined acquisitions auto-fill empty slots?
The player specified initial mining order but did not settle these edge cases.

### UI-007 — Reassignable hotbar inventory and contextual tip

**Status:** Open · **Type:** Inventory interaction · **Depends on:** UI-006

**Player request:** When inventory contains more than three block types, show a
popup tip teaching slot reassignment. Use **“Double tap”** on mobile and
**“Double click”** on PC. Double-tapping/clicking an assignable slot opens an
inventory-style chooser where the player can select its item.

**Allowed right-hand hotbar items:**

- Blocks of every kind, including leaves.
- Empty buckets.
- Filled buckets: water, lava, and future liquid types.
- Workers.

**Initial investigation:** Current slots select tools directly; no reassignment
chooser was identified in the reviewed toolbar paths. Use the existing attached
panel layout and top-layer notices in
[game-v66-mobile-ui.txt](tower-of-babel/game-v66-mobile-ui.txt) as integration points.
Keep the recently fixed long-press selection/menu suppression intact.

**Acceptance criteria:**

- Trigger the tutorial when the player first has more than three distinct block
  types; use the correct device wording and explain that a slot can change item.
- Display the temporary tip above other UI using the notification system.
- Double tap/click slots 4–6 to open an inventory-style item picker adjacent to the
  relevant toolbar area, bounded to the visible screen.
- List eligible owned items with recognizable icons and counts, including the
  full set above as the relevant systems become available.
- Assign the chosen item to the intended slot without discarding resources or
  changing the other slots. Provide a clear close/cancel path.
- Avoid accidental placement, mining, deployment, or resource spending while
  recognizing the double gesture or selecting an item in the chooser.
- Keep ordinary single-tap selection, holds, dragging, and panel scrolling working.
- Preserve accessible/keyboard operation and keep fixed slots 1–3 dedicated to
  their tools.

**Decisions to resolve:** Tutorial repeat/dismissal persistence; treatment of zero
stock or unavailable Workers; selection of duplicate assignments; and a suitable
accessible alternative to the double gesture. Worker eligibility must respect
existing availability and progression rules.

### GAME-001 — Empty and liquid-filled buckets

**Status:** Open · **Type:** New gameplay feature · **Related:** UI-006, UI-007

**Player request:** Add buckets. With an empty bucket selected in the toolbar,
tapping liquid collects **one block of liquid**. With a filled bucket selected,
tapping a location places that liquid **ON THE GRID**. Support water and lava,
and allow future liquid types.

**Initial investigation:** The reviewed bucket-named liquid functions refer to
spatial grouping for the solver, not player bucket items. Current liquid state
uses subcells and quantities in
[game-v22-liquid-engine.txt](tower-of-babel/game-v22-liquid-engine.txt) and
[game-v29-liquid-feel.txt](tower-of-babel/game-v29-liquid-feel.txt). Their units must
be reconciled with one world-grid block; do not equate one solver subcell with
one full block without checking. Input and grid behavior also involve
[game-v25-grid-toggle.txt](tower-of-babel/game-v25-grid-toggle.txt),
[game-v26-zoom-input.txt](tower-of-babel/game-v26-zoom-input.txt), and the core
pointer handlers.

**Acceptance criteria:**

- Represent empty and liquid-filled buckets as inventory items eligible for slots
  4–6 and the reassignment picker.
- Collect exactly one grid block's volume of the selected liquid without
  duplication or unexplained volume loss.
- Place the held liquid on the world grid, even when ordinary block free-placement
  is enabled; maintain correct targeting at different zooms and camera positions.
- Preserve the held liquid's type, including water and lava; make future types
  possible without redefining the hotbar interaction.
- Validate destination occupancy/capacity and collection quantity before spending
  items or modifying liquid state. Failed actions must not lose resources.
- Preserve liquid reactions, simulation stability, and inventory/liquid save data.
- Verify collect/place roundtrips, invalid targets, insufficient liquid, reloads,
  and mobile tap/hold versus camera gestures.

**Decisions to resolve before implementation:** How buckets are obtained or crafted,
cost and unlock point, stacking limits, whether filling consumes an empty bucket
and pouring returns it, and the rule for partial or mixed-liquid source cells.
The player has not specified these economy and edge-case rules.

## Suggested implementation grouping

These are dependencies, not a player-approved priority ranking:

- UI-001–UI-005 are completed in the Archive below.
- Design UI-006 and UI-007 together; include save and shortcut migration.
- Coordinate GAME-001 with the hotbar item model, after resolving bucket rules.
- BUG-001 is completed in the Archive with a confirmed fractional-zoom reproduction.

## Archive

### BUG-001 — Intermittent background clipping

**Status:** Completed · **Type:** Rendering bug · **Reproduction:** Fractional-zoom sky and hill seams

**Completed:** 2026-09-17 · **Implementation commit:** `4b0c63f`

**Confirmed finding:** At 1.15× zoom, separately antialiased sky-band rectangles
exposed dark background pixels along shared edges; adjacent hill columns showed
vertical seams. The captured 390 × 844, DPR 1 daytime case includes exact camera,
clock, browser, and pixel readings in [reproduction evidence](tower-of-babel/buttonwood/qa/background-repro.json).

**Fix and validation:** Composite the unchanged sky art at native world-pixel
resolution, then scale it once with nearest-neighbor rendering. The new browser
regression fails on the old renderer and passes the captured seam, 300 frame
checks across viewport/density/zoom/lighting/camera combinations, real pinch and
pan, 64 Top/Down transition frames, rotation, and resizing. The sky, terrain, and
Buttonwood integration suites also pass, including save/sample isolation, camera
and clock purity, unchanged collisions, and live simulation. Source and `dist/`
match. See [before](tower-of-babel/buttonwood/qa/background-seams-before.png),
[after](tower-of-babel/buttonwood/qa/background-seams-after.png), and
[validation details](tower-of-babel/buttonwood/qa/README.md).


**Player report:** Background visuals sometimes clip or glitch. Find and fix the
cause so it no longer happens.

**Initial investigation:** Static source inspection only; no specific clipping
artifact has been reproduced or diagnosed. The Buttonwood `bg` override in
[integration.txt](tower-of-babel/buttonwood/integration.txt) converts viewport
sizes and ground position through camera zoom before calling `paintSky` in
[sky.js](tower-of-babel/buttonwood/sky.js). The sky painter computes screen/ground
bounds and layered scenery. These are investigation entry points, not proven
causes. Also inspect canvas resizing and camera transitions before choosing a fix.

**Investigation checklist:**

- Capture a screenshot/video and exact reproduction steps: device/browser,
  viewport, device pixel ratio, zoom, camera location, day/night phase, and action.
- Check panning, zooming, Top/Down jumps, phone rotation, browser viewport changes,
  surface/underground transitions, and sky/time transitions.
- Distinguish scenery seams, missing frame coverage, stale canvas contents, and
  unintended clipping from expected underground occlusion.
- Inspect canvas bounds, rounding, transforms, and balanced save/restore or clipping
  state against the evidence. Do not label a suspected cause as confirmed.

**Acceptance criteria:**

- Document a reproducible case and confirmed cause before claiming a fix.
- Eliminate the captured artifact across the relevant device/zoom/viewport matrix.
- Preserve pixel scale, camera behavior, and approved Buttonwood scenery.
- Add an appropriate targeted regression or visual comparison. Review
  [buttonwood-sky.test.cjs](tower-of-babel/tests/buttonwood-sky.test.cjs) and
  [buttonwood-browser.test.cjs](tower-of-babel/tests/buttonwood-browser.test.cjs).

### UI-001 — Professional Move and Pickaxe toolbar icons

**Status:** Completed · **Type:** Art improvement

**Completed:** 2026-09-17 · **Implementation commit:** `e4239ff`

**Validation:** Shared-palette Move glove and all four pickaxe tiers are separately authored at 32 × 32. Native, selected, and mouse/touch pressed states were reviewed. The focused disclosure/art and existing pickaxe browser suites passed, including equipped-tier updates and mining gestures. See [review evidence](tower-of-babel/buttonwood/qa/README.md).

**Player request:** The toolbar icons are unattractive. Redraw the Move and
Pickaxe icons as polished, professional pixel art.

**Initial investigation:** Both are generated by `artIconV32` in
[game-v32-art-direction.txt](tower-of-babel/game-v32-art-direction.txt).
[game-v49-pickaxes.txt](tower-of-babel/game-v49-pickaxes.txt) caches tier-specific
pick icons and updates the equipped toolbar icon. Review these paths together.

**Acceptance criteria:**

- Author each UI icon on a 32 × 32 canvas and display it at native size.
- Follow the Buttonwood named palette, crisp pixel clusters, and nearest-neighbor
  rendering; no emoji, font-symbol replacements, or scaled-down world art.
- Move and Pickaxe read immediately at phone size, with a clean silhouette.
- Pick tiers remain identifiable and consistent with the new art.
- Check normal, selected, and pressed appearances on desktop and phone.


### UI-002 — Square resource miniatures in Structures

**Status:** Completed · **Type:** Art correction

**Completed:** 2026-09-17 · **Implementation commit:** `e4239ff`

**Validation:** Wood, stone, dirt, and deepslate now have distinct square miniatures. The focused suite checks their full square silhouettes, palette, native dimensions, and every Structures cost row. Desktop/phone screenshots verify quantities and missing-resource colors; ingots keep their separate art. See [review evidence](tower-of-babel/buttonwood/qa/README.md).

**Player request:** Wood, stone, dirt, and deepslate resource icons in Structures
must be **SQUARES**, resembling attractive miniature versions of their larger
block counterparts.

**Initial investigation:** `compactIconV64` in
[game-v64-compact-structures.txt](tower-of-babel/game-v64-compact-structures.txt)
draws a small wood shape and an irregular generic resource shape; its fallback
distinguishes dirt from other materials rather than giving deepslate dedicated
art. Structures cost rows call this generator. Buttonwood world/toolbar terrain
art is connected through [integration.txt](tower-of-babel/buttonwood/integration.txt)
and [environment.js](tower-of-babel/buttonwood/environment.js).

**Acceptance criteria:**

- Draw four distinct square block miniatures, each on a 32 × 32 native UI canvas.
- Match each material's larger counterpart in color, texture, and identity,
  while drawing a miniature deliberately rather than shrinking a world sprite.
- Do not use loose rocks, ingots, or rounded lumps for these block resources.
- Keep quantities and insufficient-resource states readable beside the art.
- Review every Structures cost row using these materials; preserve other resource
  identities such as actual ingots.


### UI-003 — Cleaner Craft hammer

**Status:** Completed · **Type:** Art improvement

**Completed:** 2026-09-17 · **Implementation commit:** `e4239ff`

**Validation:** A separately drawn hammer now serves Craft. Enabled, unaffordable, and crafting states were reviewed on desktop and phone. The focused and existing player-crafting suites passed: accessible names, busy/disabled state, costs, timing, completion, and reload behavior remain intact. See [review evidence](tower-of-babel/buttonwood/qa/README.md).

**Player request:** The small hammer used for Craft needs a cleaner icon.

**Initial investigation:** `compactIconV64('craft')` supplies `compactArtV64.craft`
for the player craft buttons in
[game-v64-compact-structures.txt](tower-of-babel/game-v64-compact-structures.txt).
Button styling also appears in
[style-v64-compact-structures.css](tower-of-babel/style-v64-compact-structures.css)
and [style-v66-mobile-ui.css](tower-of-babel/style-v66-mobile-ui.css).

**Acceptance criteria:**

- Redraw a recognizable, well-proportioned hammer at native 32 × 32 resolution.
- Make its head and handle clearly distinguishable against the button background.
- Preserve craft actions, accessible names, busy state, and disabled state.
- Verify enabled, unaffordable, and currently crafting appearances on phone and PC.


### UI-004 — Down-arrow disclosure instead of lightbulbs

**Status:** Completed · **Type:** UI improvement

**Completed:** 2026-09-17 · **Implementation commit:** `e4239ff`

**Validation:** Structures uses a pixel chevron with a 44 × 44 target, flipping on expansion. Inline content and one-row exclusivity are preserved. Focused desktop/phone checks pass for keyboard use, expanded state, and no accidental building drag or world gesture. See [review evidence](tower-of-babel/buttonwood/qa/README.md).

**Player request:** Replace lightbulbs in Structures with a down arrow. Clicking
or tapping the arrow expands the information below, as it does now.

**Initial investigation:** `.structureInfoV64` currently uses
`compactArtV64.info`, a lightbulb, and toggles `.structureDetailsV64` in
[game-v64-compact-structures.txt](tower-of-babel/game-v64-compact-structures.txt).
It already sets `aria-controls` and `aria-expanded` and closes other rows.

**Acceptance criteria:**

- Replace only the Structures disclosure trigger with a clean pixel-art down arrow.
- Keep the liked inline information reveal and existing one-row-at-a-time behavior.
- Make expanded/collapsed states clear; retain accessible names and expanded state.
- Keep a usable touch target and prevent interaction from starting a building drag.
- Coordinate with UI-005 for smooth opening and closing.


### UI-005 — Smooth internal information expansion and collapse

**Status:** Completed · **Type:** Interaction polish

**Completed:** 2026-09-17 · **Implementation commit:** `e4239ff`

**Validation:** Structures, field-guide chapters, Building inventory, Workers & recipes, and About Homes share reversible 190ms height motion. Focused checks pass for closing/opening, rapid reversal, changing height, keyboard focus/inert content, reduced motion, responsive resets, and 320/390/430px portrait plus 844px landscape scrolling. Top-level tabs and unrelated dialogs remain outside this treatment. See [review evidence](tower-of-babel/buttonwood/qa/README.md).

**Player request:** Add a simple, smooth animation when internal information tabs
open and close, especially the Structures information reveal.

**Initial investigation:** Structures details currently toggle `hidden`
immediately and call `scrollIntoView`; there is no transition in that handler.
Native collapsible sections are also introduced by
[game-v66-mobile-ui.txt](tower-of-babel/game-v66-mobile-ui.txt).

**Acceptance criteria:**

- Animate both opening and closing of internal disclosure content smoothly.
- Preserve the existing inline layout and information; avoid elaborate effects.
- Support content of different heights and rapid repeated toggles without snapping,
  stale open states, invisible focus targets, or permanently clipped text.
- Recheck scrolling and available panel height during transitions, including the
  smallest phone and landscape; do not overlap the header or toolbar.
- Respect reduced-motion preferences and keep accessibility state synchronized.
- Inventory the internal disclosure sections before applying a consistent treatment;
  do not assume every unrelated popup or dialog needs animation.
