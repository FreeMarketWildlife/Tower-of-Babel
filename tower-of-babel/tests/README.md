# Liquid development

Serve the repository with `python3 -m http.server 8765 --bind 127.0.0.1`.

- Game: http://localhost:8765/tower-of-babel/
- Isolated liquid playground: http://localhost:8765/tower-of-babel/tests/liquids.html
- Regression checks: `node tower-of-babel/tests/liquids.test.cjs`

The playground loads the real v22 storage/helpers and v29 solver/renderer in a small
fixture world. It does not access game saves. Springs deliberately add liquid;
closing the playground dam removes liquid inside its newly solid cells. Turn off
springs to inspect settling. Water/lava reaction is tested separately against the
production v28 reaction; the two playground tanks stay separate.

The production loader appends v29 after the v28 resource patch so the existing
obsidian behavior and saved-world format are retained. The v29 changes use a 60 Hz
liquid clock, conservative downward/lateral/pressure transfers, slower lava, and
one offscreen pixel layer to avoid overlapping translucent cell seams. Simulation
continues in the existing horizontal activity range around the camera.

## Buttonwood artwork and sample

Ordinary gameplay uses the approved Buttonwood artwork and existing
`skyStack.save.v1` saves. Open `../?sample=buttonwood` for the isolated playable
sample, or `../buttonwood/` for the animated native art gallery. The sample uses
`tower.buttonwood.sample.v1`; free fixtures, comparison controls, camera presets,
and time jumps are confined to that mode.

With Playwright and Chromium available, run:

```sh
SKY_TEST_URL=http://127.0.0.1:8765/tower-of-babel/ node tower-of-babel/tests/buttonwood-browser.test.cjs
```

`SKY_TEST_BROWSER` selects Chromium; `BW_SCREENSHOT_DIR` optionally records review
screenshots. The test covers all five building sprites, miniatures and portraits,
sample controls, 30-second twilight and clock boundaries, save isolation, reset,
additive Industry migration and persistence, persistent ore/floor decoration,
mining and building roundtrips, preserved collision masks, liquid render purity,
and a smoke check with the live animation loop. Production release checks also
verify default activation, existing-save preservation, normal progression and
camera behavior, and the absence of sample controls and fixtures in ordinary play.
See [QA evidence](../buttonwood/qa/README.md) and the [art guide](../buttonwood/ART-GUIDE.md).

`node tower-of-babel/tests/buttonwood-terrain.test.cjs` checks the connected terrain
lookup: negative coordinates, excavation refresh, aligned multi-cell placements,
motion/alignment rejection, ambiguous overlaps, meadow eligibility, and no world
mutation. The gallery's connected meadow shows the same tiles and seam rules.

`node tower-of-babel/tests/buttonwood-sky.test.cjs` checks continuous color and
light at phase boundaries and day wrap, 30-second sunrise/sunset progression,
saved-clock purity, integer scenery pixels, and underground clipping.

## Dev panel

Open the lightbulb and choose Dev Tools, or press F2. Escape closes the panel.
Gold additions and height records save immediately. Height changes update building
size and height-based unlocks; existing miners are retained when lowering a record.
One-hit mining bypasses exposure/material locks, including bedrock. Unlimited
miners can be placed from the toolbar, and direct spawn controls support levels 1–3.
Cheat switches reset on reload; spawned miners remain in the ordinary world save.

Run `node tower-of-babel/tests/dev-panel.test.cjs` for dev-control regressions. Browser
verification used port 8766 as a separate save origin from the normal 8765 preview.

## Art direction

`tests/art.html` displays actual terrain sprites (exposed, buried, and damaged),
miner tiers, and tools. `tests/mobile.html` embeds the game in a 390 × 844 viewport
for checking the responsive UI. The game uses cached 32 px terrain sprites, with
uncached small animated miners, pixel damage marks and gold effects. The v32 UI
stylesheet covers the toolbar, HUD, tips, all confirmation/miner dialogs, and dev
panel. Rendering changes do not change collision bodies or progression rules.

## Field guide and audio

The lightbulb opens a compact native-details field guide. Restart World and Dev
Tools remain in its fixed footer, so neither action depends on scrolling. The Dev
button no longer occupies the game HUD. The score in `audio.js` is a 12-bar,
72-BPM MIDI-note arrangement rendered by Web Audio oscillators. Wind and birds
are procedurally generated on a separate ambience bus at a much lower gain.

## Miner rhythm

Run `node tower-of-babel/tests/miners.test.cjs` for cumulative level permissions, target
selection, material-specific beat windows, and duplicate-frame prevention. Dirt
hits on 1 and 3, stone on 2 and 4, and deepslate on the eighth-note offbeats after
2 and 4. Mining follows the audio clock, with a matching 72 BPM silent fallback.

The AI holds position while digging, prioritizes blocks within pick reach, and
backs away from targets after two stalled attempts. All levels can jump and grip
short walls; higher levels can climb taller ledges. Suspended audio uses the
silent beat clock so miners keep working.

With the game served locally and Playwright available, run
`SKY_TEST_URL=http://127.0.0.1:8765/tower-of-babel/ node tower-of-babel/tests/miners-browser.test.cjs`.
Optionally set `SKY_TEST_BROWSER` to an existing Chromium executable. This test
loads the production bundle in an isolated browser context and exercises real
Matter.js physics, harvesting, obstacle jumps, tall-wall climbing, unreachable
target recovery, live music, and audio suspension without touching your saves.

The v38 miner regressions also upgrade workers using the real menu beside mixed
materials, route around an overhang, and run six workers through a low tunnel.
Workers now select an eligible nearby material on each beat, plan routes between
clear standing positions, and stay upright while passing one another. Both the
main AI and the older nearby-mining helper retain lower-level material access.

## Trees


Trees have a one-block-wide 3–5 block trunk and a compact three-wide branched
leaf crown. They are rare landmarks, with a guaranteed starter tree in the first
surface chunk and a low chance in later chunks.
Cutting a trunk releases every log above the cut as a dynamic Matter.js body.
Detached leaves fade and disappear in 1–2 seconds without granting resources;
manually mined leaves and wood go into the toolbar and can be placed as blocks.
Natural trees never count toward tower height. Placed leaf blocks do not decay.

The `treesV41` save field stores generated tree chunks and the surviving natural
blocks, including falling positions and remaining decay time. Older saves gain
trees only on clear surface sites; chopped trees never regenerate on reload.

Run `SKY_TEST_URL=http://127.0.0.1:8765/tower-of-babel/ node tower-of-babel/tests/trees-browser.test.cjs`
with Playwright available. It covers generation, real-physics falls, valid body
mass, leaf decay, soil removal, save restoration, harvesting and toolbar placement.

## Miner ghosts

The v42 layer checks actual filled liquid cells: submerged heads drain five seconds
of air, while lava contact burns through 900 ms of tolerance. Surfacing restores
air. Death removes the physical worker and creates a saved ghost retaining its
identity, level and gold. Ghosts drift upward and sway, then hover above the world.
Tapping one with any tool revives it at its current position with 2.2 seconds of
protection. Manually released miners also leave ghosts, with already claimed gold
removed from their pockets. Audio adds chord-matched ghost phrases and eighth-note
death/revival cues to the existing score.

Run `SKY_TEST_URL=http://127.0.0.1:8765/tower-of-babel/ node tower-of-babel/tests/spirits-browser.test.cjs`
with Playwright available. It checks exposure, recovery, frame-rate independence,
ghost drift, save/reload accounting, click revival, retained upgrades/gold,
revival protection, drag/cancel behavior, manual releases and Web Audio cues.

## Industry and musical automation

Run `node tower-of-babel/tests/automation-audio.test.cjs` for the five-minute shared
clock and crowded-machine mix test. With Playwright available and the repository
served, run `SKY_TEST_URL=http://127.0.0.1:8765/tower-of-babel/ node tower-of-babel/tests/industry-browser.test.cjs`.
This exercises real terrain harvesting and Furnace UI, saves and legacy migration,
pause/auto-repeat, both ingots, frame-rate-independent production, mobile layout,
shared camera attenuation, and live chord-matched Furnace audio.

See `../INDUSTRY-V44.md` for file inventory, balance rules, behavior and limitations.

## Physical structures and nails

Run `SKY_TEST_URL=http://127.0.0.1:8767/tower-of-babel/ node tower-of-babel/tests/structures-browser.test.cjs`
with Playwright and Chromium available (`SKY_TEST_BROWSER` may select an executable).
This replaces global Furnace UI coverage with the Workshop → Forge → Blacksmith
loop, real mouse and touch inventory dragging, foundation protection, nailed
construction, per-building production, migration and mobile layout checks.
The Industry browser suite continues to test ore deposits, harvesting and audio.
See `../STRUCTURES-V46.md` for the current costs and gameplay rules.

## Swappable picks and sixteenth-note mining — v49

The pickaxe toolbar slot now opens an attached, non-modal inventory. Purchases
retain all earlier picks; `pickaxeOwnedTier` saves the highest purchased tier
independently of the equipped `pickaxeTier`. Legacy saves retain earlier picks.
Every pick supports desktop/mobile drag or hold mining. Each audio sixteenth
(208.33 ms at 72 BPM) damages one square at the current pointer, with no interpolated
swath and no replay of missed ticks. Muted/unavailable audio retains the tempo.
Hardness, material unlocks, bedrock, protected foundations and buried-area rules
remain in force. Short taps queue one swing; cancelled gestures do not.
Dirt uses a short high-frequency noise hi-hat. A square groups its material sounds
so nine dirt blocks produce one hat rather than nine overlapping voices.

`pickaxe-browser.test.cjs` covers ownership/purchase/equip/save, exact square
footprints, durability, pointer speed, desktop and mobile gestures, pinch/cancel,
and actual Web Audio subdivision timing and hi-hat filter/grouping behavior.

## Desktop controls — v52

Selecting the pickaxe from another tool equips the last-used pick. Clicking the
already-selected pickaxe toggles its inventory. WASD and arrow keys pan the camera
at a consistent screen speed. Number keys 1–6 activate the six toolbar slots left to right,
using their normal availability rules. Shift temporarily selects Grab and restores
the previous tool on release; release also cancels the active drag. Focus loss
clears held keys, and shortcuts do not intercept form input or modal dialogs.

Run `node tower-of-babel/tests/keyboard-browser.test.cjs` with Playwright available.
The browser check exercises all mappings, pick selection, held-key motion, both
Shift keys, release during dragging, focus loss, and typing in the developer form.

## Infinite resources — v54

Dev Tools → Infinite resources supplies materials, industrial ingredients, nails,
and currency without spending real inventory. Counts display ∞. Unlock rules
still apply; structures must still be crafted and placed normally. The toggle is
session-only. Saves retain real balances and earned/crafted items, and disabling
the toggle restores normal spending. `dev-resources-browser.test.cjs` checks
construction, crafting, currency, inventory restoration, and reload behavior.

## Workers, homes and settlement time — v55

The Workshop crafts Homes for 15 wood and 5 stone in five seconds. Each Home
assigns two adult beds automatically and also shelters their children. At night,
assigned workers enter their shelter and return to their previous work position
at dawn. Unhoused workers stop work at night but cannot sleep. Inventory workers
also receive beds. Homes can be packed and residents automatically seek another.

Active play uses a 180-second day and 60-second night; hidden tabs pause the clock.
Each pair sharing a Home rolls once at dusk with a 25% pregnancy chance. Birth is
at the following dawn. A baby becomes a kid after the next full daytime phase;
a kid becomes an adult after one more full daytime phase. Children do not mine.
The clock, family assignments, pregnancy, children and sleeping positions persist
alongside legacy saves. The new adults need their own available adult beds.

Run `node tower-of-babel/tests/workers-browser.test.cjs` with Playwright and the
local server (`SKY_TEST_URL` overrides its default port 8767). This checks exact
phase boundaries, probability threshold, home capacity, save/reload during sleep
and childhood, growth, packing, crafting, rendering, and the Worker labels.

## Large settlements — v57

Worker target scans now run on staggered decision ticks that grow gradually with
the workforce. Collision bodies shared by travel, children, and ladders are cached
once per physics step, and only a bounded number of expensive routes can be built
per frame. Workers keep moving and mining between decisions. The unit stress check
covers 120 Workers and verifies that 7,200 Worker frames perform fewer than 500
target decisions. Legacy `miner` save keys and test hooks remain compatible; all
player-facing terminology uses Worker.

## Storehouses

Craft a Storehouse for 20 wood and 10 stone: 1.5 seconds from its Structures
card, or 5 seconds in a Workshop.
Click a Workshop recipe to use your inventory, then take the
finished Storehouse and drag it from Structures onto a supported 5 × 4 foundation.
Each Storehouse holds 1,000 resources total across all types. STORE deposits up to
the remaining capacity; TAKE returns resources to your inventory. The resource
selector shows building inventory / your inventory. Packing returns all contents.
Building inventory and unfinished crafting persist across reloads.

Run `node tower-of-babel/tests/storehouses-browser.test.cjs` with Playwright and
a server on port 8769, or set `SKY_TEST_URL`. It checks crafting, collection,
placement, mixed-resource capacity, overflow, withdrawals, save/reload, packing,
and desktop/mobile layouts.

## Player building crafting

Every building card in Structures has a CRAFT button, resource costs, and progress.
Player crafting spends your inventory when it starts and adds one finished building
after 1.5 seconds of active play. One player craft runs at a time; progress survives
reloads and pauses while the tab is hidden. Drag the finished building to place it.
Manual crafting in any building uses your inventory. Automatic Worker crafting
uses building inventory. Existing building crafting durations are unchanged.

`PLAYER_CRAFT_TIME_V61` is the default duration in milliseconds; an optional
`playerCraftTime` on a building definition overrides it. Run
`node tower-of-babel/tests/player-crafting-browser.test.cjs` with Playwright and
the local server on port 8769, or set `SKY_TEST_URL`.

`crafting-inventory-browser.test.cjs` verifies player and Worker resource sources
for Workshops, Forges, and Blacksmiths, including affordability controls, output,
reloads, and packing refunds. Finished products stay in building inventory.

Mining follows audio timeline epochs so restarting audio after a hidden tab cannot
block strikes behind an old beat count. The pickaxe browser regression covers
restarts between clicks, restarts during a hold, and visibility resets.

## Phone UI — v66

Phones use a compact header with mutually exclusive Goal, Village, Settings, and
Guide tabs. Village, locked materials, future pick tiers, and advanced guide
sections appear as their mechanics become available. Building inventory and
Worker recipes collapse independently; Storehouses open their inventory by
default. Attached panels fit between the header and toolbar, including landscape
rotation and safe areas. Toasts and placement notices use the browser top layer
so dialogs cannot cover them. The optional Buttonwood review controls stay separate.

Run `SKY_TEST_URL=http://127.0.0.1:8765/tower-of-babel/ node tower-of-babel/tests/mobile-ui-browser.test.cjs`.
`MOBILE_SCREENSHOT_DIR` optionally saves visual evidence. Checks cover 320 × 568,
390 × 844, 430 × 932, and 844 × 390 touch viewports, locked/unlocked progression,
exclusive panels, all five buildings, inventory transfers, scrolling and rotation,
notifications over native dialogs and expiry, Escape, and desktop restoration.
Also run the Structures, Storehouses, and Buttonwood browser suites for crafting,
touch dragging, save compatibility, artwork, and live simulation.

## Native UI art and inline disclosures — v67

Run `SKY_TEST_URL=http://127.0.0.1:8765/tower-of-babel/ node tower-of-babel/tests/disclosures-browser.test.cjs`
with Playwright and Chromium. `UI_SCREENSHOT_DIR` optionally saves review images.
The suite checks Structures and native inline disclosures on desktop and phones:
opening/closing, midpoint reversal, rapid toggles, one-row exclusivity, changing
content height, keyboard activation, focus recovery, reduced motion, responsive
resets, and 320/390/430px portrait plus 844px landscape panel bounds.

It also checks separately authored 32px icons against the shared palette and
opaque pixel grid, square block silhouettes, every Structures cost row, four
pick tiers and equipped artwork, crafting states, and both art galleries. Mouse
and touch pressed states are included in screenshot capture. Companion suites:
`mobile-ui-browser`, `player-crafting-browser`, `pickaxe-browser`,
`structures-browser`, `storehouses-browser`, and `buttonwood-browser`.

`game-v67-disclosures.txt` provides a reversible 190ms height animation. Structures
remains inline and allows one description at a time. The field guide uses the
same motion; Building inventory, Workers & recipes, and About Homes remain
independent. Top-level phone tabs, panels, and notifications keep their behavior.
Collapsing content becomes inert immediately, and completed animations release
the fixed height so text remains readable after content or viewport changes.

## Background seams at fractional zoom

Run `SKY_TEST_URL=http://127.0.0.1:8765/tower-of-babel/ node tower-of-babel/tests/background-browser.test.cjs`
with Playwright and Chromium. `BACKGROUND_SCREENSHOT_DIR` optionally saves the
background and rotated gameplay views. The regression checks the reproduced dark
sky-band seam and vertical hill seams at 1.15× camera zoom, then verifies 300
full-frame renders against the native sky's colors. It covers zoom .72–1.55,
DPR 1/1.25/2/3 (the game caps rendering DPR at 2), desktop and phone viewports,
all four lighting phases, negative camera positions, high sky, and underground.
It also exercises real pinch/pan input, intermediate Top/Down transition frames,
rotation, resize coverage, unchanged camera/clock data, and restored context state.

`SKY_TEST_INTEGRATION` optionally supplies an old integration source. With the
pre-fix `3b8c8a0:tower-of-babel/buttonwood/integration.txt`, the suite fails at the
captured seam pixel. This isolates the regression to the renderer while retaining
the same sky art. See the [reproduction evidence](../buttonwood/qa/background-repro.json)
and [before/after review](../buttonwood/qa/README.md).


## Six-slot inventory and buckets — v68

The toolbar has Pickaxe, Move, Structures, then three assignable inventory slots.
Newly acquired types fill the first empty slot, in acquisition order. Overflow
stays in inventory; repeat acquisitions only change counts. Slots keep their
assignment at zero stock. Double click/tap slots 4–6 to choose an item, or focus a
slot and press Enter/Space. An empty slot opens the chooser on a single press.
Escape/Close returns focus; clicking outside dismisses. Keys 7–0 have no action.

Assignments share inventory: duplicates do not duplicate resources. Only owned
items and available, unlocked Workers appear in the chooser. Clearing a slot
leaves it available for the next previously unseen acquisition. Both mining and
non-mining acquisitions follow this rule. Legacy saves have no acquisition
history, so they use Wood, Leaves, Dirt, Stone, Deepslate, Obsidian, then Workers
for their first three owned types. Assignments, seen types and the one-time
four-block-type tutorial persist in the additive `hotbarV68` save field. Infinite
resources do not become real acquisitions. Both ordinary and sample saves retain
their original, separate keys.

Craft a bucket directly in this chooser for **five iron ingots**, with no extra
unlock or timer. Buckets stack by contents and are reusable. Filling transfers
exactly one 32 × 32 world block (four full 16px solver cells) from the clicked
liquid and its connected same-type pool. Partial cells may contribute; different
liquids and disconnected pools cannot. Insufficient quantity changes nothing.
Pouring requires a wholly empty, unoccupied world grid square and always snaps,
even with Grid off. The active slot follows the used bucket's new contents.
Other assignments stay put. A hold acts once on release; dragging, cancellation
and pinch do nothing to the bucket. Unknown future bucket types survive saves;
register their liquid ID and simulation support before enabling collection/pour.

Run `node tower-of-babel/tests/hotbar-browser.test.cjs` with Playwright and a local
server (`SKY_TEST_URL`, default port 8774). Set `SKY_TEST_ENGINE=webkit` for WebKit;
Chromium uses `SKY_TEST_BROWSER` when provided. `HOTBAR_SCREENSHOT_DIR` optionally
captures desktop and 320/390/430px portrait plus 844px landscape views. The suite
covers real harvesting order, reassignment and counts, migration/reload, keyboard
access, native art/palette, five-ingot crafting, failed transaction purity, exact
liquid volume/type, negative grid targeting at 1.35× zoom, obsidian reactions,
solver conservation, real mouse/touch roundtrips, and picker bounds. Chromium
also sends sustained touch holds, drag, cancellation, pinch and picker swipes.

Root CSS and selection/menu/drag guards suppress browser text selection on all
pointer configurations, including mobile desktop-site mode and hidden legacy UI.
Inputs, textareas, selects and contenteditable controls retain editing. Chrome
and WebKit checks cover these exceptions; Chrome exercises real touch holds.
These are automated browser tests, not a claim of physical iPhone/Android QA.
