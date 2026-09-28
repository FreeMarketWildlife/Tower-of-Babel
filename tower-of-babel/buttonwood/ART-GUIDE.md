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
