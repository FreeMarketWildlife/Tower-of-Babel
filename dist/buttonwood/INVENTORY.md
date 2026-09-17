# Buttonwood migration inventory

**Buttonwood is the approved default presentation. Remaining asset families are tracked below.**

The [approved concept](reference/buttonwood-approved.png) sets the visual direction.
The [art guide](ART-GUIDE.md), [gallery](index.html), and
[playable sample](../?sample=buttonwood) document the native interpretation.
The user approved the foundation, rich meadow, Storehouse, Forge, Blacksmith,
and 30-second sunrise/sunset for [ordinary gameplay](../). The optional sample
continues to provide an isolated world for visual comparison and inspection.

## Default-game coverage

| Family | Implemented artwork | Continuing checks / remaining work |
|---|---|---|
| Adult Workers | Three skin/hair appearances; common cream hat, mint overalls, gold buttons; 40 × 32 native canvas. | Preserve approved proportions, expressions, and appearance variation. |
| Worker idle | Four authored poses scheduled by `A.frameFor` over 4.2s, with 110ms closed eyes. | Review the brief blink and relaxed standing expression at normal size. |
| Worker walk | Six authored frames at 110ms; shared `(18,31)` ground anchor. | Check planted feet, direction changes, slopes, and normal gameplay speed. |
| Worker work | Full six-frame gallery cycle at 90ms; engine starts at strike pose 3 and runs recovery poses 4–5, 270ms total. | Review strike readability and tool bounds. Pre-strike engine anticipation remains deferred. |
| Worker UI | Separately composed 32 × 32 portrait with three appearance variants. | Remaining equipment/status indicators and every portrait placement need a full pass. |
| Home | Native 128 × 128 sprite plus separately drawn 32px miniature. | Preserve door scale, native portrait, night readability, and structural collision envelope. |
| Workshop | Native 128 × 128 sprite, working detail, and separately drawn 32px miniature. | Preserve awning, work-bay clarity, animation, previews, and recipe UI uses. |
| Storehouse | Native 160 × 128 sprite, broad coral gable, double loading doors, crates, sack, and separately drawn 32px miniature. | Preserve native portrait, building inventory readability, and warm window/lantern light. |
| Forge | Native 96 × 96 rounded kiln with tall flue, bellows, 720ms flame cycle, stepped smoke, and separately drawn 32px miniature. | Preserve compact scale, fire readability, native portrait, and activity state. |
| Blacksmith | Native 160 × 128 open anvil bay, mint canopy, hammer sign, 810ms hammer cycle, sparks, hearth light, and separately drawn 32px miniature. | Preserve tool motion, Worker-scale anvil, native portrait, and activity state. |
| Dirt / grass | Rich loam, fuller rooted sod, continuous world-coordinate texture, and neighbor-aware 32px cells. | User endorsed the richer meadow; retain it as the terrain direction. Continue checking large-area density as other terrain families migrate. |
| Stone | Continuous world-coordinate planes, soil boundary clusters, and exposed/corner treatments. | Check ore contrast, seams, and placed multi-block constructions. |
| Deep materials | Deepslate joins the connected texture system; bedrock and obsidian use Buttonwood textures. | Review full depth transitions and distinct material identification. |
| Wood / leaves | Four native variants each using shared material ramps. | Tree silhouettes and natural-tree composition are not redesigned. |
| Ore | Four native transparent overlays each for copper ore, iron ore, and coal. | Review buried/exposed visibility, resource recognition, and mixed deposits. |
| Water / lava | Shared three-color ramps and a renderer using one-world-unit pixels. | Review pools, falls, joins, depth, interaction boundaries, and sustained motion. Solver is unchanged. |
| Garden accent | Small native greenery/flower cluster helper in `environment.js`. | Optional scene decoration; placement is not a general vegetation migration. |
| Scenery / light | Smooth 30-second sunrise and sunset, native sky bands, clouds, hills, sun/moon/stars, ambient world tint, and warm building lights. Uses the existing 240-second saved clock. | Preserve twilight warmth and underground contrast; weather/depth expansion remains separate. |
| UI | Warm styling, Worker art, native portraits and 32px miniatures for all five buildings, and terrain swatches. | Many control icons and all unlisted UI assets still use the existing art. Village/Industry/Mine views and the time preview control are sample-only. |

## Explicitly deferred

| Family | Deferred scope |
|---|---|
| Character ages | Baby and kid silhouettes, poses, growth continuity, and UI representations. |
| Character actions | Pre-strike engine anticipation, climbing, carrying, sleeping, arrival/departure, and other dedicated action poses. |
| Ghosts and state effects | Death, ghost drift, revival, immunity, drowning/burning indicators, and related particles. |
| Equipment | Full level identity, pick tiers, held resources, accessories, and their inventory art. |
| Vegetation | Complete tree silhouettes, growth/composition, detached wood/leaves, and foliage decay presentation. |
| Terrain edge cases | Remaining material pairs beyond soil/stone/deepslate, full placement/rotation review, and terrain damage/effects. |
| World effects | Harvest rewards, gold, construction feedback, impacts, particles, ladder art, and smoke/fire outside the migrated building details. |
| Complete UI | Resource/currency icons, controls, tools, locks, warnings, panels, tutorial art, dev controls, and all responsive states. |
| Full scenery | Complete weather presentation and remaining background/depth layers. |

## Runtime and review boundaries

- Buttonwood artwork loads in ordinary gameplay, using the existing
  `skyStack.save.v1` save key, camera behavior, and progression.
- The sample is opt-in at `../?sample=buttonwood` and uses
  `tower.buttonwood.sample.v1`. Its free fixtures, review controls, camera presets,
  and time jumps never run in ordinary gameplay.
- Original-art comparison shares the sample's world and simulation, making scale,
  color, and silhouette differences directly comparable.
- Existing structural collision envelopes are cached before art overrides and
  deliberately retained for save and physics compatibility. Decorative roof
  pixels do not redefine placement or support.
- Liquid art reads the existing solver. A one-pixel render layer does not change
  its 16-unit simulation cells, flow rules, reaction rules, or save format.
- In the sample, the Industry review district is added once in a clear site, avoiding existing
  structures, blocks, Workers, children, and liquids. Its saved
  `structuresV46.buttonwoodIndustry` marker prevents packed review buildings from
  respawning. Existing resources, building inventory, placements, terrain edits,
  and clock progress are retained.
- `sky.js` reads the existing 240-second settlement clock: sunrise occupies seconds
  0–30, sunset 150–180. It changes presentation without changing the clock, Worker
  schedule, recipes, or simulation rules.
- No item costs, resource identities, building footprints, Worker behavior, Home
  capacities, or progression rules are redesigned by the artwork migration.

## Source ownership

| Source | Responsibility |
|---|---|
| `palette.js` | Named palette and shared animation timings. |
| `workers.js` | Worker world poses, anchors, appearance variants, and native UI portrait. |
| `buildings.js` | All five native buildings, separately authored 32px miniatures, working details, anchors, sizes, and warm light overlays. |
| `sky.js` | Continuous saved-clock sky colors, native scenery, twilight timing, and ambient light state. |
| `environment.js` | Terrain, ore overlays, grass, optional garden cluster, and liquid ramps. |
| `integration.txt` | Default-game render adapters, liquid drawing, isolated sample setup, comparison, and review hooks. |
| `sample.css` / `index.html` | Game theme, sample controls, and gallery. |
| `reference/buttonwood-approved.png` | Approved concept reference, retained at original resolution. |
| `qa/` | Rendered review evidence and validation records. |

The main agent owns shared palette changes, integration, and final consistency
review. Specialist agents should edit separate family files after reading the
same guide and reference. Update this inventory when coverage actually changes.

## Future revision workflow

1. Compare the new Storehouse, Forge, and Blacksmith with the endorsed Worker,
   Home, Workshop, and meadow at native scale before judging enlarged details.
2. Review complete idle/walk/work cycles and the corresponding in-game actions.
3. Watch the complete 30-second sunrise and sunset, then inspect terrain, liquids,
   building lights, and underground/night readability.
4. Compare original and Buttonwood art in the same scene; inspect UI miniatures.
5. Confirm save isolation, stable physics masks, relevant regressions, and no
   runtime errors. Record results with the actual delivered review evidence.
6. Record feedback and update the guide when an asset family changes. Keep optional
   sample fixtures and controls separate from the ordinary game's progression.

## QA validation

**Technical checks passed on September 16, 2026.** The expanded browser regression
passes all five native sprites, miniatures, and portraits; 30-second transitions
and clock boundaries; additive Industry migration; blocked-site relocation; packed
building persistence; save isolation; mining/building roundtrips; unchanged collision
masks; read-only rendering; default-game save preservation and sample isolation;
and live simulation. The focused
Buttonwood sky unit test passes continuity, midnight wrap, saved-clock purity,
native-pixel rendering, and underground clipping. Existing liquid, Worker rhythm,
terrain, and sky regressions remain documented in [QA evidence](qa/README.md).

**Review status:** the user approved the native artwork, including industry and
twilight, and requested its promotion to the default game. Production verification
for that promotion is recorded in [QA evidence](qa/README.md). Remaining family
work above is not a blocker to using the approved presentation.
