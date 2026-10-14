# Buttonwood art guide

**Implementation companion to the [Buttonwood art bible](ART-BIBLE.md).**
Read the bible before any visual task, including UI and effects. It owns creative
direction and new-work acceptance criteria; this guide records native dimensions,
anchors, timing, rendering, and compatibility contracts. The
[migration inventory](INVENTORY.md) distinguishes implemented art from future work.

**Approved default artwork · foundation, industry buildings, and gradual lighting.**

The approved [Buttonwood concept](reference/buttonwood-approved.png) establishes
the direction. The native sprites and timings here define the playable interpretation.
The user approved the native Workers, all five buildings, rich meadow terrain,
and gradual dawn/dusk transitions for ordinary gameplay. Other asset families
remain tracked in the migration inventory.

- [Play the game](../): the approved artwork with normal progression and saves.
- [Playable sample](../?sample=buttonwood): mine, build, compare the original art,
  and inspect the village, underground, day, and night.
- [Art gallery](index.html): inspect the actual authored sprites and animation poses.
- [Migration inventory](INVENTORY.md): implemented artwork and deferred work.

## Identity

**A warm, handmade chibi settlement in a 2D side-view world.** Buildings show their
front elevations; the underground is a cutaway. Preserve this perspective across
every building, Worker, tool, and terrain surface.

Buttonwood's recognizable features are broad cream work hats with mint bands,
rounded hair and cheeks, short overalls with gold buttons, sweeping coral roofs,
cream plaster, warm timber, and mint shutters. Roofs and hat brims share a soft,
slightly lopsided silhouette. Small pixel steps describe curves.

Use a button motif where it gives an object a memorable function: overall
fasteners, a round attic window, or a Workshop sign. Avoid covering everything in
button decorations. A building's silhouette and openings should identify it
before its ornament does. Calm surfaces keep expressions and useful objects clear.

## Pixel scale and canvases

| Asset | Native canvas / anchor | Rule |
|---|---|---|
| Adult Worker | 40 × 32; ground anchor `(18, 31)` | Approximately 30 px tall; padding accommodates tools. |
| Worker UI portrait | 32 × 32 | Separate composition, displayed at native size. |
| Home / Workshop | 128 × 128; bottom edge at foundation | Fixed four-block footprint in each direction. |
| Storehouse / Blacksmith | 160 × 128; bottom edge at foundation | Five-block width, four-block height; same art pixel size. |
| Forge furnace | 96 × 96; bottom edge at foundation | Three-block width and height; never stretch to match larger buildings. |
| Pumpjack | 128 × 96; bottom edge at foundation | Four-block width, three-block height; native moving beam and fixed ports. |
| Tank | 96 × 96; bottom edge at foundation | Three blocks wide and high; two side ports and visible gauge. |
| Pipe segment | 32 × 32; center `(16,16)` | One world cell; connections meet cardinal edge centers. |
| Building miniature | 32 × 32 | Draw a miniature; do not shrink the world sprite. |
| Terrain tile | 32 × 32 | Cover one 32-unit world cell at native resolution. |
| Ore overlay | 32 × 32, transparent | Register exactly with its terrain tile. |
| Liquid render layer | 1 art pixel per world unit | Solver cells remain 16 world units. |

One source pixel equals one world unit. The camera applies the same zoom to all
world art. Never independently resize Workers, buildings, tools, or decorative
elements to make them fit. Building portraits retain native sprite dimensions.

Author with integer coordinates and integer dimensions. Use nearest-neighbor
rendering with image smoothing disabled. Inspect at 1× first; integer enlargement
is for studying the pixels. Normal camera zoom may scale the whole world uniformly.
UI icons remain 32 × 32 at 1×, including in narrow layouts.

## Palette

[palette.js](palette.js) is the normative color and timing source. Use its named
tokens; do not copy slightly different colors into each asset. These are the
approved ramps, listed shadow → base → highlight where available.

| Group | Tokens and exact colors |
|---|---|
| Contours | `ink #49313f`, `outline #67434a` |
| Buried lighting | `buriedShade #0b0709`; renderer wash only, never a pure-black sprite fill. |
| Cream | `creamShade #d8c397`, `cream #f7e8c4`, `creamLight #fff3d6` |
| Mint | `mintShade #597d70`, `mint #8fb69a`, `mintLight #b9d1ab` |
| Coral | `coralShade #ad5955`, `coral #d97d68`, `coralLight #f0a17c` |
| Timber | `woodShade #704939`, `wood #9c684d`, `woodLight #c28d60` |
| Gold | `goldShade #b58250`, `gold #e6b76c` |
| Skin | `skinShade #bb7c67`, `skin #e8b28c`, `skinLight #f7cda2` |
| Dark skin | `darkSkinShade #805246`, `darkSkin #ad735e`, `darkSkinLight #d29473` |
| Hair | `hair #74473c`, `hairLight #a06948`; dark and coral variants reuse existing tokens |
| Stone | `stoneShade #737e78`, `stone #9b9b91`, `stoneLight #c7c3aa` |
| Dirt | `dirtShade #5e4236`, `dirt #785242`, `dirtLight #94694d`; roots `soilRoot #b08b62` |
| Grass | `grassShade #426f49`, `grass #6d9d58`, `grassLight #a5c975` |
| Water | `waterShade #397e89`, `water #5eaaa6`, `waterLight #a5d9c6` |
| Lava | `lavaShade #a95248`, `lava #dd7958`, `lavaLight #f5c77f` |
| Deep stone | `deepShade #4f4d60`, `deep #675f72`, `deepLight #8b8290` |
| Day sky | `sky #c6dcd1`, `horizon #dce5cd` |
| Day hills | `hill #b0cbb7`, `nearHill #9ebca2` |
| Underground | `cave #67564f`, `nightCave #403b50` |
| Night sky | `nightSky #384454`, `nightHorizon #495364`, `nightCloud #64717a` |
| Night hills | `nightHill #52616b`, `nightNearHill #46565b` |

Use three main shades per material, with shared contour colors when needed.
Do not add another ramp without changing the shared palette and reviewing the
representative scene. The migrated scenery uses these named tokens. Remaining
inherited controls and effects still need a full palette review.

## Drawing rules

- Light comes from the upper left. Put compact highlights on upper-facing planes
  and the strongest shadows under hats, eaves, tools, and feet.
- Use a one-pixel colored outer contour. Use material shadows for interior joins;
  reserve dark ink for eyes, narrow recesses, and essential separation.
- Build forms from connected pixel clusters. Avoid isolated texture speckles,
  checkerboard shading, smooth gradients, blurred edges, and automatic antialiasing.
- Leave most faces, walls, and roof planes quiet. Add a few deliberate marks that
  describe the material without filling every available pixel.
- Decorations use the same source pixel size as the object they belong to.
  Shade a curve with stepped rows; do not rotate and resample a finished sprite.

## Workers

The hat, hair, and face occupy a little over half the standing silhouette; the
short body and boots make the Worker read as a capable adult chibi character.
Keep eye spacing, hat band, collar, straps, and foot line consistent across all
three initial appearances. Change skin and hair within the shared palette without
changing proportions. Equipment levels must remain readable at gameplay size.

The current pose set uses a slight three-quarter face on a side-moving body.
Left and right directions share the same ground anchor. Equipment should fit in
the padded canvas without clipping or shifting the body's foot position.

| Action | Authored frames | Cadence | Intent |
|---|---:|---:|---|
| Idle | 4 | 4.2 s cycle; 110 ms blink | A calm standing hold with brief closed eyes. |
| Walk | 6 | 110 ms per frame | Small marching steps, at most 1 px body rise. |
| Work, gallery | 6 | 90 ms per frame | Preparation, raised tool, impact, recovery. |
| Work, engine | Frames 3–5 | 90 ms each; 270 ms total | Actual strike followed by recovery. |

`A.frameFor` in `palette.js` owns idle timing: the closed-eye pose occupies only
110ms of the 4.2-second cycle. Use this shared scheduler in both the gallery and
engine so the blink duration stays consistent.

The gallery plays all six work poses for inspection. The engine announces a hit
through `q.game.pickUntil` after the strike has happened, so the renderer starts at
impact pose 3 and follows with recovery poses 4 and 5. This keeps impact aligned
without delaying or adding strikes. Anticipation before an actual engine strike
remains deferred. Review gameplay timing separately from the full gallery loop.
Avoid sliding planted feet, changing head volume, detached hands, and horizontal
anchor jitter.

Babies, kids, ghosts, climbing, carrying, sleep transitions, and additional
equipment need their own reviewed poses. Do not create age variants by
fractionally shrinking the adult sprite.

## Buildings

Home and Workshop share coral curved roofs, cream walls, warm timber framing,
mint trim, stout openings, and a grounded stone foundation. Use broad roof sweeps
with sparse tile accents. Window arches and roof curves use the same deliberate
pixel steps as the Worker hats.

The Home emphasizes a welcoming doorway and domestic detail. The Workshop
emphasizes its open working bay, striped awning, visible tools, and sign. Keep the
door and window vocabulary related. Doors must look comfortable for a roughly
30-pixel Worker; a larger building gets more canvas area, never larger art pixels.

The Storehouse uses broad loading doors, crates, sacks, mint shutters, and a quiet
button gable. The Forge is a compact rounded stone kiln with a coral hood, warm
fire mouth, and tall flue. The Blacksmith uses an open anvil bay, mint canopy,
hammer sign, small hearth, and side door. Their functions should remain distinct
in the native 32px miniatures. Keep the existing player-facing name **Forge** for
the smelting furnace and the stable internal identifier `forge`.

Working fire uses four 180ms frames; the Blacksmith hammer uses six 135ms frames.
Smoke uses four 280ms poses. These art loops communicate activity; crafting timing
and outputs stay controlled by the simulation. Night lighting uses compact warm
window, lantern, and hearth pixels without blurred halos.

Animation belongs in small functional details, such as a working tool. Keep roof,
wall, and foundation anchors fixed. Miniatures preserve the identifying roof,
opening, and accent colors with fewer details on a separately drawn 32px canvas.

## Extraction machinery and oil

[extraction.js](extraction.js) owns the native Pumpjack, Tank, connected pipe
segments and their separately composed UI art. The Pumpjack has a broad warm
timber A-frame, coral walking beam, attached rod/linkage and mint flywheel. The
Tank is a stout cream-and-mint vessel with restrained wood/copper-colored hoops.
Pipes use warm copper-colored surfaces and stone couplings. These colors are
existing named tokens, not new material ramps. Preserve Buttonwood's front
elevation, upper-left highlights, quiet surfaces and one-pixel world scale.

### Native API and ports

`A.extractionSprite(type, options)` returns a cached native canvas; an unknown
type returns `null`. All positions below are measured from the canvas's top-left.

| Type | Canvas | Options | Fixed connectors |
|---|---|---|---|
| `pumpjack` | 128 × 96 | `frame: 0..5`, `active: boolean`, `kind: null / oil / water / lava` | Downward intake `(48,96)`; right outlet `(128,80)`. |
| `tank` | 96 × 96 | `kind`, `fill: 0..1` | Left `(0,80)` and right `(96,80)`. |
| `pipe` | 32 × 32 | `mask`, `kind`, `active` | Center `(16,16)`; enabled arms reach their canvas edge. |

`A.extractionSizes` and `A.extractionPorts` expose frozen metadata. A pipe mask
combines `N=1`, `E=2`, `S=4`, `W=8`: for example, `5` is a vertical segment,
`10` a horizontal segment, `3` a bend, `11` a tee and `15` a cross. Mask `0`
is a capped center. Missing arms must remain absent. Do not draw an external
connection unless the network or placement preview supplies it.

The engine places the Pumpjack's adjoining intake pipe cell at building-cell
offset `(1,3)`, its outlet pipe cell at `(4,2)`, and the Tank's adjoining pipe
cells at `(-1,2)` and `(3,2)`. Those are **cell coordinates**, distinct from the
sprite-edge pixel coordinates above. The intake line descends into the pocket;
the right outlet uses a separate network leading to a Tank. Keep both routes
visible and never paint a connection through the Pumpjack to imply a single circuit.

`A.extractionIcon(type)` returns a separately authored 32 × 32 canvas for
`pumpjack`, `tank`, `pipe`, `oil`, `bucket:oil`, or `remove`. Unknown types return
`null`. `remove` shows a wrench undoing a copper coupling. The oil bucket retains
the common pail silhouette but has its own dark surface and oil emblem. Display
all six icons at 32 CSS pixels. Building portraits use the full native world
canvas; they are not another miniature.

### Motion and liquid readability

`A.extractionFrameMs` is 150ms. Active Pumpjacks use six authored poses, a 900ms
loop; inactive Pumpjacks use one fixed rest pose regardless of frame. Grounded
feet, foundation, wellhead, and external pipes remain fixed while the beam,
flywheel, rod and linkage move coherently. In-game active state is supplied only
when the network actually transfers liquid. Animation neither schedules a transfer
nor determines its volume.

The Tank's gauge contains 20 visible liquid pixels. `fill` is clamped and rounded
to twentieths for cached art only; the simulation and UI keep the actual quantity.
`kind: null` produces a vacant gauge. Content windows may show a known kind while
equipment rests; they do not claim directional flow. Review oil, water and lava
at empty, low, mid and full levels, including a paused or blocked network.

Oil's world-liquid colors in `A.liquidColors.oil` are base `deep`, glint
`deepLight`, and shade `ink`. Extraction windows and the drop/bucket icon may add
a sparse `mintShade` sheen. Water retains the turquoise ramp; lava retains warm
coral/orange and pale hot accents. Color is reinforced by gauge level, a readable
liquid name, real quantity and status. Do not draw oil as mineable coal or a
flaming lava variant. It is a finite third liquid in the existing 16-unit solver;
the renderer preserves empty space and the depleted pocket's actual liquid level.

### Game values that visual explanations must preserve

These are current implementation facts from
[`game-v46-structures.txt`](../game-v46-structures.txt) and
[`game-v70-extraction.txt`](../game-v70-extraction.txt), not art-controlled balance:

| Item / action | Current value |
|---|---|
| Pumpjack construction | 15 wood, 8 stone, 5 iron ingots; 4 × 3 blocks. |
| Tank construction | 8 wood, 4 stone, 6 iron ingots; 3 × 3 blocks. |
| Pipe batch | 1 iron ingot makes 4 pipes; reclaim returns the placed pipes. |
| Pump transfer | Up to 1 block per second from a wet intake, without depleting it; no fuel or assigned Worker. |
| Direct machine connection | Opposite outlet/inlet faces at the same world position connect without a pipe. Gaps and height differences need pipes. |
| Tank capacity | 32 blocks of one liquid. |
| Bucket transfer | 1 block per bucket; a mismatched occupied Tank cannot mix liquids. |
| Tank drain | Up to 1 block through the right outlet, including a final fractional remainder; blocked outlets retain the contents. |

Oil, water and lava follow the same extraction equipment path. Pipes drill
through eligible terrain without making a walkable opening. Renewable pumping,
real source presence, empty/blocked/full states and finite storage belong to game logic.
Buckets still remove liquid; water–lava reactions still consume it. A Tank must
be emptied before packing. Visuals must not advertise an unimplemented refinery,
oil sale, automatic pool regeneration, fuel cost or Worker staffing requirement.

### Review the extraction family

The [gallery section](index.html#extraction-heading) keeps all machinery at native
size and includes active/rest Pumpjacks, oil/water/lava/empty Tanks, six pipe
connection examples and all native icons. Its playback uses the gallery's shared
Pause control and reduced-motion preference. The poses are an art study; capacity
and transfer are not simulated there.

Run `node tower-of-babel/tests/buttonwood-extraction-art.test.cjs` with Playwright
and Chromium available (`SKY_TEST_BROWSER` can select a browser). It checks native
dimensions, palette membership, binary alpha, all 16 pipe masks, connection-edge
occupancy, stable pump foundations, six active poses, static rest and clamped
gauge caching. Inspect the gallery on desktop and at 320px/390px phone widths,
then compare a connected scene beside the Forge and a Worker in daylight and night.
Behavior requires the separate extraction-network and oil suites; an art check
does not establish conservation, save migration or UI interaction correctness.

## Terrain, liquids, and effects

Terrain supports the settlement rather than competing with it. Dirt is rich warm
loam: a chocolate-brown base, low-contrast organic clumps, and restrained warm
highlights. Avoid sandy tan ground, cracked earth, and scattershot bright speckles.
The meadow has a fuller green sod layer, an irregular dark humus band, and small
root clusters inside the soil.
Stone uses broad quiet planes; deeper rock becomes cooler and darker.

### Connected terrain

`A.terrain(material, cx, cy, neighbors)` draws native 32px cells. Dirt, stone, and
deepslate sample shared world-coordinate textures; never offset a random texture
independently in each tile. Neighbor keys are `n/e/s/w/ne/se/sw/nw`; each is a
material name or `null` for air. `meadow` permits sod only on exposed surface dirt.
An underground ledge remains bare soil after excavation.

Same-material joins have no outlines or per-cell darkening. Soil-to-stone and
stone-to-deepslate boundaries use small stepped clusters, with one material owning
each join. Draw those clusters inside occupied cells only. Concave diagonal joins
need their own corner treatment; exposed cutaway edges use short material-colored
bevels. Preserve the complete solid cell silhouette and its collision footprint.

The renderer resolves natural neighbors from the real terrain grid. Stationary,
unrotated, grid-aligned placed bodies can join through a separate visual index.
Moving or misaligned pieces retain only their own internal tile joins; they never
change physics to force alignment. Rebuild the index each render so mining and
movement update the visible edges immediately. Keep texture caches bounded.

Ore stays distinct: peach copper with restrained mint inclusions, pale warm iron,
and dark charcoal coal. Check ore readability against both exposed and buried
terrain. Wood grain and leaf clusters reuse the architectural and garden palette.

Water uses quiet turquoise planes and restrained pale surface glints. Oil uses
quiet ink/deep planes with sparse cool marks. Lava uses
warm orange/coral planes, pale yellow highlights, and dark crust; it must remain
recognizable as hazardous. Render the unchanged solver geometry at one world
pixel, composite a single liquid layer, and avoid darker overlapping cell seams.
Glints and crust advance in discrete steps; they must not suggest false flow.

Future particles should use small coherent clusters from the matching material
ramp. Existing particles and death/revival effects remain to be reviewed.

## Daylight and atmosphere

### Exposure-depth fog

`fog.js` provides a pure, capped cardinal distance field and the shared opacity
curve. Exposed cells are layer 0 (no extra wash). The first unexposed layer uses
28% `buriedShade`; layers 2–10 increase linearly to 96%, which remains the cap
below layer ten. This permits faint detail throughout the darkest terrain.

`../game-v72-terrain-fog.txt` reads the existing `terrainExposed` rule and known
open cells. Excavated cells and revealed/surface liquid pockets are open; hidden
pockets, ungenerated space and the world's lower edge do not emit light. Layers
spread in four directions, so diagonal gaps do not change mining eligibility.
Undiscovered cavities inherit the distance field until revealed. Placed blocks
retain the existing mining/exposure semantics and do not invent new blockers.

Each render checks an exposure mask within the viewport plus eleven cells.
The distance field is rebuilt only when this mask or its bounds change; equal
collection sizes cannot hide changed occupancy. The temporary field never enters
saves or changes terrain, liquids, collisions, animals, or progression.

A native-world-pixel canvas applies the wash once after the complete world scene
and its day/night tint. Ore, animal sprites and notices receive the same opacity
as the ground beneath them, including sprite pixels crossing cell boundaries.
Nearest-neighbor composition keeps joins closed at fractional zoom. Tool/build
previews, including pipe placement, render afterwards. Original-art comparison
in the optional sample keeps its original lighting.

The gallery's exposure study uses the same opacity curve and native terrain,
ore and animal art. See the fog unit/browser tests for all ten layers, digging,
pocket visibility, render purity, zoom and shared animal shading.

### Day/night cycle

`sky.js` owns pure presentation through `A.skyState(seconds, day)` and
`A.paintSky(context, options)`. The existing saved settlement clock stays authoritative:

| Cycle time | Appearance | Duration |
|---|---|---|
| 0–30s | Sunrise: violet, peach, soft gold, then meadow daylight | 30 seconds |
| 30–150s | Daylight | 120 seconds |
| 150–180s | Sunset: gold, coral, lavender, then blue night | 30 seconds |
| 180–240s | Night | 60 seconds |

Total cycle remains four minutes. Worker sleep/wake routines, family progression,
crafting durations, saved time, and hidden-tab pausing retain their existing rules.
The sample's Time selector jumps to the start of a phase for review; it then plays
at normal speed. The gallery uses the same sky code and offers the same preview.

Day/night foundations use `palette.js`; named dawn and dusk accent colors live in
`A.skyPalette` in `sky.js`. Interpolate color continuously over time while keeping
spatial art in discrete pixel bands. Clouds, stars, sun, and moon use native pixel
shapes; absolute saved time prevents motion from restarting at a day boundary.
Apply one subtle scene wash (maximum 22% at night), followed by warm building lights.
Never switch the background at a darkness threshold or add a second simulation clock.
Meteor/weather presentation and more elaborate scenery remain deferred.

## Scenic biomes and wildlife

`../biomes.js` exports `ButtonwoodBiomes.regionAt(seed, x)`, `biomeAt(seed, x)`,
and `weightsAt(seed, x)`. It uses the existing saved sky seed. Regions span
2305–3839 world units, with 384-unit blending boundaries; the region at zero is
mountains. Scenery, animals, and music use these regions. Terrain and resources do not.

`biomes.js` adds `A.paintBiomeScenery`; `A.paintSky` accepts `biomeSeed` and
`biomeWeights` alongside the existing options. The integration passes these
through its native sky canvas before applying camera zoom. Unconfigured gallery
and unit-test callers retain the original meadow scenery. Mountain ridges,
rolling plains, clustered jungle crowns, and ocean islands use named palette
tokens mixed with the existing day/night atmosphere.

`wildlife.js` owns four authored poses per animal. `A.wildlifeSprite(species,
{frame, direction, burrowing})` anchors at the bottom center. `A.wildlifeSizes`
and `A.wildlifeFrameMs` expose the contracts below.

| Species | Native canvas | Pose duration |
|---|---|---|
| Bird | 24 × 20 | 150ms |
| Butterfly | 16 × 16 | 130ms |
| Worm | 20 × 10 | 220ms |
| Mole | 24 × 16 | 220ms |
| Rabbit | 24 × 24 | 180ms |
| Firefly | 12 × 12 | 160ms |

Natural fireflies appear in plains and jungle at dusk/night. Captured and released
fireflies remain visible by day. Light uses crisp warm body pixels, with no blur.
Burrowers draw over soil in the cutaway without changing a terrain cell. Animal
simulation, saved habitats, bucket transfers, and cage occupancy belong to
`../game-v71-wildlife.txt`, not the art generator.

`A.cageSprite(type, {layer})` returns a native `back`, `front`, or `all` composition.
Draw inhabitants between the back and bars. Small cages use 64 × 64, medium
96 × 64, and large 128 × 96; all use the same world pixel scale. Their fixed
gameplay frame colliders are defined explicitly, never inferred from occupants.
`A.cageIcon`, `A.wildlifeIcon`, and `A.wildlifeBucketIcon` return separately authored
32 × 32 UI compositions. Display cage portraits at their native world dimensions.

## Physics and save boundaries

Ordinary gameplay uses the existing `skyStack.save.v1` key and normal progression.
The opt-in sample uses `tower.buttonwood.sample.v1`; its review controls, camera
presets, free buildings, Workers, and terrain fixtures stay isolated. Original-art
comparison switches presentation within that sample world. Reset sample clears
only the sample save.

The renderer caches the existing `structureShapeV47` collision envelopes before
swapping building art. Preserve these envelopes deliberately for save and physics
compatibility: decorative roof curves do not redefine placement or support.
Worker bodies, recipes, inventories, controls, and liquid simulation keep their
existing rules. The terrain's 31px contact body can retain its small gap while the
native 32px artwork covers the world cell.

Author future silhouettes with those interaction boundaries in view. Changes to
collision envelopes require a separate gameplay migration and save-compatibility
review; they are not part of an artwork update.

## Authoring and review workflow

1. Read the [art bible](ART-BIBLE.md) and relevant family sections; study the saved
   concept and approved native artwork. Cite the applied sections in review notes.
2. Edit the shared tokens in `palette.js` only when the direction requires it.
3. Author cached canvases in `workers.js`, `buildings.js`, `extraction.js`, `environment.js`, or `ui.js`.
   Paint native pixel clusters; never reduce the concept image into game sprites.
4. Keep `integration.txt` responsible for engine state, anchors, and render hooks.
   Keep art generators independent of saves, physics, and resource balances.
5. Inspect the gallery at native size, then enlarge to inspect contours and poses.
6. Review ordinary gameplay and the optional comparison sample at day/night,
   different zoom levels, opened inventories, and active Workers.
7. Run the focused Buttonwood checks and relevant existing regressions. Synchronize
   source and `dist/` through the repository's direct-file workflow.
8. Record the review outcome in the inventory before expanding an asset family.

### QA validation

**Visual approval received for the default-game rollout.** The native artwork and
30-second transitions passed sample checks on September 16, 2026, including save
isolation, mining and placement, unchanged collision masks, read-only liquid
rendering, native UI sizes, live simulation, and desktop/mobile presentation.
See [QA evidence](qa/README.md) for commands, production verification, and remaining
asset work. Approval of these families does not imply that every legacy effect or
character age has been redrawn.

### Acceptance checklist

- Preserve the approved Worker and building charm at 1×.
- Keep palette, contours, lighting, pixel size, and material density consistent.
- Check stable feet, readable eyes, attached hands, and unclipped tools in every pose.
- Align work impact with actual strikes and keep idle blinking brief.
- Make all five buildings recognizable from silhouette and their 32px miniatures.
- Retain the established structural collision envelopes.
- Keep terrain seams, ores, liquid surfaces, and underground/night views clear.
- Preserve production saves and keep sample reset, controls, and fixtures isolated.
- Verify normal progression, native UI sizes, live simulation, and responsive layouts.
- Update the gallery and QA evidence when authored assets change.

## Critter Worker animation study

The user selected clothing-free critters. The first native [wood mouse](critters/wood-mouse/)
uses 40 × 32 frames and anchor `(18,31)`, shared named colors and binary alpha.
`A.woodMouse.sprite({state, frame, direction})` returns cached native canvases.
`motions` and `frameAt` own the study cadence; `jumpOffset` supplies integer
Yay displacement without changing source size. Six actions plus idle provide
56 frames. Human Workers and production integration retain existing contracts.
See the [study notes](critters/wood-mouse/README.md) for the complete timing table
and remaining action-hook, portrait and world-review work.

### Complete critter roster

[critters/](critters/) now contains all 25 species with Walk, Sprint, Mine, Use,
Yay, Pet, and idle (56 frames each, 1,400 total). `roster.js` exposes
`A.critters.sprite({species,state,frame,direction})`, `drawInto`, `roster`,
`motions`, `frameAt`, `jumpOffset`, dimensions and anchor. The original mouse
renderer is reused. Other species use separately specified head/body geometry,
limb connections, ears, tails, shells, quills, crests and markings, with shared
integer-pixel action choreography. No production save or action hook is changed.
The gallery adds all-species action selection and one-shot click-Pet responses.
The export manifest documents seven row positions in native 400 × 224 sheets;
each cell is still 40 × 32. See [the roster guide](critters/README.md) for timing,
review evidence, export instructions, and remaining integration scope.

### Mouse silhouette reset

The previous 25-critter procedural roster was rejected visually and remains
review history. [The still comparison](critters/mouse-silhouettes/) returns to
one mouse and contains separate 40 × 32 and exploratory 64 × 64 source maps.
A is the selected upright work posture; C is selected for quadrupedal travel;
B is a possible transition. The larger anchor `(32,61)` is a proposal, while
production Workers retain their existing `(18,31)` anchor and dimensions.
No new animations, scale changes, save migrations or physics changes occur here.

## 42-pixel critter comparison (unapproved)

[Raster concept review](critters/concepts-42/): mouse, turtle, lizard still PNGs,
42 × 42, anchor `(21,40)`, binary alpha, shared palette. These are converted
imagegen concepts for the user's size experiment, not approved production art.
`?sample=buttonwood&critters=42` places render-only fixtures in the isolated
sample. One exported pixel equals one world unit. UI portrait contracts remain
32 × 32. Source artwork, prompts and conversion notes accompany the PNGs.

## Current critter direction: native wildlife

The user selected existing wildlife style and abandoned the prior critter concept
style. [25 idle models](critters/wildlife-idles/) expose `A.critterIdles.sprite`
and `roster`. Species-specific canvases are 22–32 × 14–26 pixels; each ground
anchor is `(floor(width/2),height-1)`. Shared palette, binary alpha and one source
pixel per world unit. Original mole pixels are reused exactly. PNGs and metadata
are in that gallery's `exports/`. Earlier animation/42px galleries are history.
No production replacement, animation hooks or UI portrait changes yet.

## Wildlife animations, eggs and lunar gameplay

`critters/wildlife-idles/animations.js` exposes `A.animalAnimations`: 31 roster
forms, seven states and 1,612 right-facing frames, with exact left mirroring.
Frames are 40 × 32 padding at `(20,31)`; approved small animal pixels retain their
native size. Idle: 4 × 350ms; Walk: 8 × 110ms; Sprint: 8 × 70ms; Mine: 8 × 110ms;
Use: 8 × 130ms; Yay: 8 × 110ms; Pet: 8 × 150ms. Individual sprite sheets and
all-cast GIFs are in [the animation gallery](critters/wildlife-animations/).

`lunar-art.js` owns pixel moon masks, separately authored 32px icons, native fairy
32 × 40 and egg 16 × 20. `game-v73-critter-eggs.txt` integrates saved species,
clock-derived phase/merchant gating, 5-gold eggs, 30-second active incubation,
real Worker creation, actions and four ability classes. `crittersV73` is additive
under `structuresV46`; Worker IDs and physics/save compatibility remain intact.
Original wildlife rendering/cages pass explicit animation state. Bucket targeting
keeps established wildlife dimensions; action padding does not enlarge hitboxes.
The sample `view=moon-fairy` is explicitly isolated from ordinary saves.

## Sparse habitats, flowers and vertical depth

`meadow.js` extends wildlife size/pose contracts to the 25 approved critters and
adds separately authored 32px animal portraits and bucket miniatures. All 31
species use the existing capture/release/cage save paths. `game-v71-wildlife.txt`
keeps 25% of the former 1–2 spawn opportunities per newly visited 24-block habitat (about 0.34 animals per habitat). All 31 forms spawn naturally; empty habitats are remembered. Existing saved animals stay.

`A.flowerSprite(type)` returns 12 × 12 native art; `A.flowerIcon()` returns a
separate 32 × 32 bouquet. `game-v74-meadow.txt` owns saved surface plants,
tap gathering, support removal and the Flowers inventory item. Each eligible
surface dirt cell has a deterministic 19% plant chance on first habitat visit;
collected plants do not regenerate on revisit. Drag/cancel/pinch do not gather.

The integration supplies `camY` to sky and biome art. Integer rectangles receive
vertical depth translation before zoom, and clip against real world ground.
Existing horizontal depth factors are unchanged. Sky repainting is capped at
20Hz while stationary; camera/viewport changes repaint immediately. The moon HUD
caches data URLs and skips unchanged content/layout; obstacle scans reuse a
100ms cache, invalidated immediately when body counts change.


## Fairy Workers and Fey task integration

`fey-art.js` wraps `A.worker` with native wing pixels inside its unchanged 40 × 32
canvas and ground anchor. `A.workerIcon` uses a separate 32px fairy portrait.
`A.paintFeySpark` and `A.paintFairyDefeat` use integer palette rectangles. Gameplay
effects are drawn before the shared buried-light pass.

`game-v75-fey.txt` owns saved animal Fey/task/gold/supply state, temporary Matter
bodies for terrain/ladder travel, and bucket metadata. Animal sprites and animations
are reused. Tool mining poses are excluded from Fey rendering. Eggs hatch wild
animals; older animal Worker records migrate into wild animals carrying their gold.
Human Worker IDs and normal environmental ghost/revival behavior remain intact.

Tainted Water is liquid save type 3 (existing 0/1/2 types remain compatible).
The fixed-step solver in `game-v29-liquid-feel.txt` advances it at water cadence;
blood conversion changes kind without changing volume. `bucket:taintedWater`
retains bucket volume checks, atomic transactions and save validation.

Base uses connected supported placed-block components, excluding natural trees.
Mine checks local exposed terrain and counts three eligible rhythm beats per hit.
Collect excludes living Workers; transfers between Collect Fey flow toward lower
IDs to prevent a gold ping-pong loop. Work extends employee readiness at the real
building entrance. Tower keeps width >= ceil(next height / 6), consumes local stock,
uses nails if present, and places dynamic supported blocks otherwise. Installed
ladders use the existing clear-cell checks and actual Workshop batch recipe.
Sparkle audio uses the current MIDI chord, half-beat alignment, global cue limiting
and music mute. Task navigation runs at 10Hz; sprite rendering remains at frame rate.

## Pause transport — v76

`game-v76-pause.txt` wraps the final frame loop. The lexical gameplay
`performance.now()` in the core returns active-play time; browser performance
remains untouched. Paused frames only schedule the next frame. Physics, liquids,
production, eggs, Fey and settlement time therefore stop together.
`SkyAudio.setPaused` suspends/resumes the AudioContext without resetting the score
or beat origin; input initialization and visibility handlers respect pause.
Master/Music/Effects volume preferences use `skyStack.audio.volume.v1` and are
independent of world saves. Phone reflow leaves audio controls inside Options.


## Minimal HUD and currency — v77

`hud-art.js` provides cached `A.hudIcon(kind, active)` 32 × 32 miniatures, a
separate `A.bellSprite()` 12 × 12 world pickup, gold ore overlays, and
`A.paintDayClock(context, phase, elapsedMs)`. All opaque pixels use shared named
palette colors; UI art displays at 32 CSS pixels with binary alpha. The clock
traverses its daylight semicircle over 180 seconds and night over 60 seconds.

`game-v77-bells-resources.txt` loads immediately after industry, before building
inventory resource registration. Currency retains `inv.gold` and existing saved
Worker/animal `gold` fields; new `goldOre` and `goldIngot` fields are independent
materials. Forge smelting uses one ore plus one coal for one gold bar in four
seconds. Buried Bell cluster generation and costs remain unchanged.

`game-v77-minimal-hud.txt` owns the icon HUD, attached scrollable quest log and
six-slot toolbar (updated in v78). Keys 1–3 select tools and 4–6 select assigned
items; saved item indices remain unchanged. Nails are inventory items.
Tips, grid and isolated sample review controls live in Options. Click the clock
or press Escape to pause. Labels and keyboard focus remain accessible.

Height progression uses supported placed-block components and actual body speed,
spin and tilt; it no longer uses a dwell timer. The active currency effect in
`game-v32-art-direction.txt` draws the native Bell pickup and numeric yield.
`SkyAudio.bellCollect` is Effects-volume gated and chord-aware; `goldChaching`
remains a compatibility alias. Review: [HUD QA](qa/minimal-hud/README.md).


## Searchable inventory and nail items — v78

`inventory-art.js` provides cached 32 × 32 `inventoryIcon` and
`inventoryCategoryIcon` assets and four `paintNailStrike` contact poses. Display UI
icons at native size; contact effects use the shared world pixel scale. New ore,
metal and ladder miniatures are drawn independently; building and bucket entries
reuse approved native inventory assets. Native gallery includes the new family.

`game-v78-inventory-nails.txt` supplies seven category tabs, search and a quantity
grid attached to the selected hotbar slot. Normal inventory omits zero stock.
Creative (Options → Dev Tools) exposes the whole catalog and all unlocks, with
virtual resource/building/Worker supplies. Filled buckets, pipes and ladders use
transaction wrappers rather than writing virtual stock to saves. Mode and normal
unlock snapshots persist per world; earned height remains an actual record.
Existing three saved item assignments keep their indices. Keys 4–6 select them.

Nail taps target `ctr(cell(x)), ctr(cell(y))` on an existing visible solid block.
One saved pin per cell, including multi-cell blocks; pins preserve the original
body envelope. Duplicate or invalid requests cost nothing; stock is consumed only
at the strike. `SkyAudio.nailHammer` schedules a chord-aware steel/wood impact on
a MIDI quarter-note boundary. Paused requests wait; missed audio boundaries move
to the next beat. Without audio, the same 72 BPM active-play timing is used.
Pin positions live in `structuresV46.inventoryV78`; legacy nailed bodies import
occupied cells, removed/released bodies discard their pins. Review: §§3–4, 9–10
of the bible and [v78 QA](qa/inventory-nails/README.md).


## Inspector and helper roster — v79

`hud-art.js` adds independent 32px `hudIcon('magnifier')` and
`hudIcon('workers')` assets and recomposes `bell` / `bellSprite` as round jingle
bells. Named palette, native display, and approved Worker face landmarks remain
mandatory. The native gallery includes both new equipment icons.

`game-v79-inspector-crew.txt` lays out the HUD in two 2-column corner grids.
Its nonmodal left roster embeds existing Worker and Fey controls. Stable entity
IDs drive selection; the camera eases toward a moving world target in the area
beside the panel. Closing, pausing or losing the target releases tracking.
Resting/young/bucketed entries remain visible without pretending to occupy a
world position. Icon URLs are cached; roster refresh is throttled while open.

The 192px lens overlay samples the rendered world canvas at 2× nearest-neighbor,
with a separately drawn stepped rim and wood handle. It never changes `cam.z`.
Window capture makes lens pointer actions read-only before legacy world handlers.
`SkyAudio.rhythm` and `inspectCue` share the MIDI origin; description changes are
allowed only on even quarter-beat indices (one half note). Missed audio boundaries
wait for the next half note; silent play uses the same 72 BPM active-play grid.
A target outside the lens acquisition area immediately loses its bubble. Pause freezes timing and
hides the lens; Effects mute silences the cue. No inspection state enters saves.
Review: bible §§3–4, 6, 9–10 and [v79 QA](qa/inspector-crew/README.md).


## Winter inspection and flight — v80

`winter-sky-data.js` holds the Yale V/50 bright-star subset and frozen JPL planet
ephemeris; `winter-sky.js` precesses positions and computes Sapporo alt/az from
local sidereal time. The v81 slowed night spans a stylized 18:00–00:00 JST segment. The horizon
panorama wraps at 1440 native pixels, centered south before camera parallax.
`sky.js` emits Sun/Moon and exact cloud hit geometry; `biomes.js` emits mountain
slope hit geometry. `A.lastSkyObjects` is the last native painted frame, so the
inspector picks rendered objects, with scenery occlusion and closest-star hits.
Below-horizon objects never draw. Metadata and bibliography identify the frozen
date, catalogue, projection limits and fact sources. No network access at runtime.

The v80 integration selects semantic sky targets after foreground world targets;
there is no generic sky bubble. Celestial samples retain the rendered size, without extra zoom. New entries retain the v79 MIDI half-note gate.
Pointer movement invalidates the scan throttle, and exit clears immediately.
Animal facts cover all 31 species and stay the same after Fey conversion.

Ctrl-wheel on canvas handles Chromium Mac trackpad pinch; Safari GestureEvents
use a stable world anchor. Touch pinch also works while inspection is enabled.
Game zoom clamps to 0.72–2.5; paused input does not change the world.
Fey flyers retain their species motion and existing gravity cancellation, use
solid collision bodies, route above obstacles, and keep wing animation while
hovering. A blocked route never converts a flyer into a ground animal.
Review: bible §§3–4, 8–10 and [v80 QA](qa/winter-inspector/README.md).


## Slow clock, scenery picking and full-moon fire — v81

`DAY_V55` / `NIGHT_V55` are 360000 / 120000ms. Sky color/trajectory APIs keep
their normalized 240-second vocabulary; integration divides actual elapsed time
by two. `hud-art.js` uses the longer durations. `workersV55.clockV81:2` marks
saves using the longer clock; older saved elapsed values scale once on restore.
Worker sleep/growth and the eight lunar stages follow the new day boundaries.

`winter-sky.js` advances visible-night hour angle at half its previous normalized
rate, hence one quarter of the old real-time star rate. No celestial enlargement
is applied by the inspector. New facts keep half-note entry; exit stays immediate.
`biomes.js` records clipped native snow/tree paint rectangles for picking. Small
island palms add a real ocean backdrop tree family, with no structural collider.

`game-v81-moonfire.txt` owns exclusive tool state, clock migration and the hidden
full-moon event. Eligibility uses the supported tallest-tower component, not the
all-time height record. Seed/world-day hashing gives one 1/6 roll per eligible
full moon. `structuresV46.moonfireV81` saves the roll, elapsed time and up to eight
projectiles. No player-facing announcement is generated. The active full Moon
uses the named coral ramps; `meteor-art.js` draws native cool trails and hot fire.
A 20Hz cached backdrop refresh renders the shower. Foreground fire uses swept
Matter ray queries against real solids, adds impulses/damage to placed blocks,
removes broken blocks and stale pins, invalidates support caches, and grants
no inventory or Bells. Sparks expire within 900ms; effects stop at dawn.
Review: bible §§3–4, 8–10 and [v81 QA](qa/moonfire/README.md).


## Survival event demo — v82

`?demo=moonfire` selects `tower.moonfire.survival-demo.v2` before core restore or
autosave registration. It never reads or overwrites the normal or art-sample
world. The fresh fixture seeds a 109m, 24-cell-wide reinforced tower, finite
player supplies, a stocked Storehouse, and seven Fey Tower helpers: two birds,
two butterflies, a firefly, a wood mouse and a mole. Pockets are deducted from
the Storehouse. Creative mode and infinite resources/Workers remain off.

A seeded winning full-moon roll queues the ordinary event with unchanged game
probability outside the fixture. Initial load and reload pause before play;
Resume starts the normal simulation. Restart World resets only this demo save.
Demo builders space their turns around the current real construction cell;
normal routing, collision, material costs and nail placement still apply.
A successful Fey Tower placement uses the approved Use animation for 650ms;
no decorative building animation invents a resource or placed block.
Review: bible §§3–4, 8–10 and [demo QA](qa/moonfire-demo/README.md).

## Lens acquisition, Critterpedia, and sacrifice — October 11, 2026

`inspectionSubjectV79` shares the point tests used by `inspectionV79`.
`inspectLensTargetV79` scans ordered 4px lens samples inside radius
`68 * sqrt(.9)`, divided by the world lens magnification of two. Centered
subjects win; surrounding subjects outrank backdrop terrain. Sky uses its 1×
source radius. The same picker runs on pointer release, with an 8px drag threshold
and existing touch-pinch consumption. The nonmodal `critterpediaV79` displays
the selected entry beside the magnifying-glass toolbar control, reflows on
resize, and closes on Escape or pause. Inspection never invokes pet/mining actions.

Four tapered wing lobes join the shoulders inside the existing 40×32 Worker
canvas; wings have fixed veins and no independent animation. `paintFairyBody`
uses native sprite crops, falling rotation and distinct Stab/Slice wounds.
Forty-eight delayed blood particles start at contact, obey gravity and ground
collision, contaminate real water, and form 12-second transient pools. A corpse
holds 4.5 seconds and fades over two seconds. Blood adds no liquid volume on dry
soil. The named blood ramp is reviewed under ART-BIBLE §§3–4, 6, 9–10.


## Brimstone mechanics and effects — v83

`game-v83-brimstone.txt` installs a damage accessor on existing and future block
bodies. A positive `game.hits` increment consumes a nailed body’s entire one-use
shield, absorbs the whole increment without changing material hits, and clears the body's pins and queued nail operations; placed bodies become
dynamic. Constructor/restored hit values are imported before the accessor, so
loading an undamaged nailed block never spends its armor. Material max durability
stays unchanged; the nail protects against one complete damage event.

The barrage spawns at 450ms intervals after an eight-second build-up, with at
most 24 active projectiles and 200 total launches in a fresh shower. Fast swept Matter rays and
wild-sprite segment tests prevent tunneling. Each 4/6-cell rounded blast damages
a body once, regardless of how many covered cells overlap it. Large placed blocks fracture into saved cell-sized bodies on contact; only
intersected pieces take damage. Real polygon tests preserve rotated shapes.
Actual nails, previous wear, material, total area cost and motion transfer.
Untouched pieces keep nails and durability. The inner radius (blast radius minus
one cell) deals two damage, the outer rim one. Each piece takes only the maximum
overlapping zone damage, never their sum; an intact nail absorbs the entire
first strike. Shielded fragments receive a stronger bounded release impulse. Strong materials retain their higher durability. Native terrain rendering
calls `paintStrongWearV85` for five persistent fracture/chip stages using named
palette colors and one art pixel per world unit. Bedrock retains its immunity. Natural terrain
stays anchored until destroyed, with removed-cell/save bookkeeping preserved.
Dynamic debris uses real existing bodies, bounded velocities and angular impulse.
No replacement collision envelopes or inventory rewards are introduced.

Worker deaths use the environmental path; wild/Fey victims are removed along
with their physics bodies. Building wear, surviving-cage release and fairy loss
persist. Projectiles, spawn count and the last tower footprint save with validated
limits; the shower can continue after tower support collapses. Particle caps: 18
blast effects, 24 fading figures, 64 flying nails. Pause freezes all effects.
Chord-root bass drops and filtered impacts use the Effects bus, existing volume
controls, pause guards and a 180ms spatial cue throttle.

The isolated survival demo now uses its v2 save, preserving the earlier v1 demo
and ordinary world. It includes three fairy Workers in addition to the seven
Fey builders. Initial load stays paused. Review: bible §§3–4, 6, 8–10 and
[brimstone QA](qa/brimstone/README.md).

## Spatial and rendering performance — v87

`game-v87-performance.txt` adds persistent static spatial buckets and refreshed
moving buckets for nearby queries. Original bounds tests, return order, collider
shapes and world membership stay authoritative. Membership/geometry/static-state
changes invalidate indexes; broad and outside queries use linear fallbacks.
Matter receives awake bodies and spatial neighbors only in sparse scenes; dense
piles retain its original sweep-and-prune. Repeatedly fixing an already-static
block preserves its original finite mass for nail release. New fixed blocks are
constructed with finite material mass first; older fixed blocks with missing
dynamic properties recover material mass/inertia on release.

Placed-block terrain joins, early off-screen rejection, cached exposure seeds,
indexed tower anchors, Worker solids and blast lookups reduce per-frame work.
The loader downloads modules independently and evaluates them in the existing
order. No art, physics timestep, liquid clock, save key or gameplay rule changes.
[Performance evidence](qa/performance/README.md) records native-pixel/collision
parity and measured CPU/query improvements.

## Storm score and ice — v89

`storm-audio.js` receives the real context, Effects bus, beat origin and score
chord through `SkyAudio.stormTransportV89`. `stormGrid`, `stormFlight` and
`stormImpact` schedule sixteenth-note phrases with distance gain/pan, voice caps
and cleanup. The storm owns an independent submix and debug cue history.

`game-v89-storm-score.txt` retains the 24-live/200-launch budgets, marks every
third launch ice, predicts imminent contact for the whoosh at a 100ms cadence,
and holds actual contact until a sixteenth boundary. Pending waits/kinds save;
transient target references use a WeakMap. Reload re-arms sound on the new clock.
Fire's linear impulse/caps increase 20%; ice wears only its contacted cell.
`paintHail`/`paintHailImpact` use 16px shared-palette ice and eight cold shards;
the existing renderer supplies the projectile kind without changing scale.
Review: bible §§3–5, 8,10 and [storm score](qa/storm-score/README.md).

## Discovery timing — v90

`game-v90-discoveries.txt` owns the inspector discovery sequence. In score quarter
beats, entry is `b` (an even beat), reveal begins `b+2`, and completion/reward is
`b+4`. `SkyAudio.discoveryCue` schedules all chord tones at that exact completion
boundary; cancellation disconnects its dedicated Effects bus. The native mask
uses 4 × 4 cells and twelve steps. Fireworks use a 96 × 40 native effect canvas
with 2px clusters, never a scaled UI icon. Reduced motion disables both motions.
Knowledge lives in `structuresV46.discoveriesV90` in the existing world save.
