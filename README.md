# Tower of Babel

Stack a tower to the heavens and declare war on God.

A pixel-art physics building game: mine resources, recruit Workers, craft industrial buildings, and raise a tower toward heaven. The heavenly war is the game's direction; the current playable game focuses on mining, crafting, and tower construction.

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

## Buttonwood artwork

Buttonwood is the game's default art direction: chibi adult Workers, warm
front-facing buildings, rich meadow soil, connected terrain, and turquoise water
in a side-view cutaway world. Home, Workshop, Storehouse, Forge, and Blacksmith
share one native pixel scale. Sunrise and sunset each last 30 seconds within the
existing four-minute day/night cycle. Existing worlds keep their saves, inventories,
building collision envelopes, progression, and camera behavior.

Open `/tower-of-babel/buttonwood/` for the animated art gallery and reference.
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

## Migration

Formerly Sky Stack in the Snake-Game-Test repository. This repository preserves the game's Git history and Tower of Babel's initial commit. The old Snake game remains in Git history; the root entry now opens Tower of Babel.

Existing `skyStack` local-storage keys and debug APIs are retained for compatibility. Browser saves carry over when using the same origin (scheme, host, and port). Moving to a different hosting origin does not automatically transfer browser storage.
