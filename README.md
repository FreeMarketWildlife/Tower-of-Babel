# Critz Tower Defense

A small world with big ambitions, now moving toward a cast of wild critters.

A pixel-art physics building game transitioning toward animal Workers and tower defense. The current playable game still focuses on mining, crafting, and tower construction. The new critter cast is a concept study; combat and playable critter sprites are not implemented yet.

## Play locally

[Play the hosted game](https://tower-of-babel.freemarketwildlife.chatgpt.site).

From the repository root, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://localhost:8765/. The game lives in `tower-of-babel/`; the old `sky-stack/` entry redirects there.

## Development

No build step is required. Serve the files over HTTP so the JavaScript loader can fetch its modules. Matter.js loads from a CDN, so an internet connection is required.

See [development and regression checks](tower-of-babel/tests/README.md) and [art direction](AGENTS.md).

## Critter animations

The [native critter gallery](tower-of-babel/buttonwood/critters/) has all 25 species
with Walk, Sprint, Mine, Use, Yay, and Pet. Click a critter to pet it, compare actions,
or inspect individual frames. All world frames are 40 × 32 with a shared pixel scale.
This is an animation review gallery; gameplay integration remains separate.

## Critter character concepts

The [25-species Worker concept study](tower-of-babel/buttonwood/concepts/critz-workers/README.md) explores the new cast. Existing animal artwork and its implementation are preserved in the [wildlife archive](tower-of-babel/buttonwood/archive/wildlife-2026-10-10/README.md).

## Buttonwood artwork

Buttonwood is the game's default art direction: chibi adult Workers, warm
front-facing buildings, rich meadow soil, connected terrain, and turquoise water
in a side-view cutaway world. Home, Workshop, Storehouse, Forge, and Blacksmith
share one native pixel scale. Sunrise and sunset each last 30 seconds within the
existing four-minute day/night cycle. Existing worlds keep their saves, inventories,
building collision envelopes, progression, and camera behavior.

Open `/tower-of-babel/buttonwood/` for the animated art gallery and reference.
Buried terrain darkens through ten layers inward from exposed faces. The first
unexposed layer is visibly shaded; the deepest stays nearly black with faint
detail. Digging brightens nearby faces, and underground animals share the shading.
The optional `/tower-of-babel/?sample=buttonwood` demo offers Village, Industry,
and Mine views, original-art comparison, and a Time control for previewing twilight.
Its free review fixtures and controls remain confined to the separate
`tower.buttonwood.sample.v1` save slot; ordinary gameplay uses `skyStack.save.v1`.
Character ages, dedicated action poses, effects, and other remaining families are
tracked separately in the migration inventory.

Start every visual task with the [Buttonwood art bible](tower-of-babel/buttonwood/ART-BIBLE.md):
Terraria's pixel-art richness, Minecraft's block logic, and Buttonwood's handmade
warmth. It covers world art, UI, animation, effects, accessibility, research sources,
and the review process. The [illustrated edition](output/pdf/buttonwood-art-bible.pdf)
is a visual reading companion; the living bible is the full direction reference.

See the [native art guide](tower-of-babel/buttonwood/ART-GUIDE.md) for exact
implementation contracts and the [migration inventory](tower-of-babel/buttonwood/INVENTORY.md)
for completed and deferred families.

## Oil and liquid extraction

Craft Pumpjacks, Tanks, and pipes from Structures. Drill an intake pipe into a
visible underground oil pocket, then touch the right outlet to a Tank or join
them with pipes. Pumping leaves the source pool unchanged.
The same system pumps water and lava. Tanks hold 32 liquid blocks, support bucket
transfers, and stop incompatible or full networks. Buckets still move real liquid.
See the [extraction guide](tower-of-babel/LIQUID-EXTRACTION.md) for controls, costs,
save behavior, and the Turmoil / Factorio research behind the mechanics.

## Biomes and wildlife

Worlds start in the mountains. Explore large, randomly ordered plains, jungle,
ocean, and mountain regions with layered pixel parallax and gently changing music.
Biome geography saves with the world. Only scenery, animals, and music vary;
terrain, resources, and construction rules remain the same.

Tap birds, butterflies, worms, moles, rabbits, and fireflies to hear them. Collect
any animal with an empty bucket; use its filled bucket to place it back into the
world or into a cage. Craft small, medium, and large timber-and-iron cages from
Structures. Animals, occupied cages, and filled buckets persist across reloads.
The [wildlife guide](tower-of-babel/BIOMES-WILDLIFE.md) documents costs and controls.

## Migration

Formerly Sky Stack in the Snake-Game-Test repository. This repository preserves the game's Git history and Tower of Babel's initial commit. The old Snake game remains in Git history; the root entry now opens Tower of Babel.

Existing `skyStack` local-storage keys and debug APIs are retained for compatibility. Browser saves carry over when using the same origin (scheme, host, and port). Moving to a different hosting origin does not automatically transfer browser storage.


## HUD and Bells

The main interface uses native pixel icons and quantities. The tower icon shows
height, the bell shows your Bells, and the quest book opens your scrollable log
at the next milestone. Arrow buttons jump to the tower or mine; the circular clock
shows day/night progress and opens Pause. Escape also pauses the game and music.
Options contains Tips, Dev Tools, Restart World and volume sliders; sample art
review controls are available there in the isolated demo.

The toolbar has Pickaxe, Move and Structures on the left, and three assigned
inventory items on the right.
Choose Nails from inventory and tap an existing block to pin it at the closest
grid-cell center, once per square. Hammer strikes follow the MIDI quarter-note
beat. Keys 1–3 select tools and 4–6 select items. Supported stable towers earn height
immediately. Buried currency clusters and Worker/animal balances are Bells, with
a short bell pickup sound. Gold ore and gold bars are separate materials;
a Forge smelts one gold ore and one coal into one bar.


## Inventory and Creative mode

Double click/tap an item slot to open its attached inventory. Category tabs and
search organize blocks, nature, materials, tools, buildings and animals. Normal
play shows only owned items. In Escape → Options → Dev Tools, Creative mode unlocks
all items and equipment with unlimited supplies. Mode persists per world; disabling
it restores real inventory balances and normal unlocks. Inventory icons remain
32 × 32 native pixels, including the new nail bundle and resource miniatures.
