# Critz — 25 native critter Workers

[Open the animation gallery](index.html). Choose an action to see the whole cast,
click any critter for a one-shot Pet response, or choose **All actions** to inspect
one species in six simultaneous previews. Pause, left/right facing, integer pixel
zoom, and individual frame sliders are available. Reduced motion starts paused.

All **25 distinct species** now have **Walk, Sprint, Mine, Use, Yay, and Pet**:
150 action animations plus idle. The original wood mouse is reused unchanged;
the other 24 use species-specific native anatomy, silhouettes and markings in
[roster.js](roster.js). Shared locomotion/hand timing keeps the crew coherent.
This gallery is an animation review artifact. It does not read saves, load
simulation modules, or replace production Workers yet.

## Native contracts

| Contract | Value |
|---|---|
| Every world frame | 40 × 32 source pixels |
| Ground anchor | (18, 31) |
| Pixel scale | One art pixel per world unit |
| Colors | Shared Buttonwood `palette.js` tokens |
| Alpha | Opaque or transparent; no antialiasing |
| Mirroring | About the same ground anchor; tool padding stays within bounds |
| Source generation | Integer ellipses, stepped lines, clusters, and species geometry; no concept downsampling |

`A.critters.sprite({species, state, frame, direction})` returns cached canvases.
`roster` exposes identifiers, display names, and visual cues. Unknown species
return `null`; unknown states fall back to idle. `drawInto` draws the same native
pixels to another context. `motions`, `frameAt`, and `jumpOffset` retain the wood
mouse study contracts. Yay's extra height is renderer displacement, never a
larger source sprite or a stretched body. New species keep attached thighs/shins,
with distinct long feet, digging paws, or frog toe pads where appropriate.

| Action | Frames | Per frame | Intent |
|---|---:|---:|---|
| Idle | 4 | 280ms | Calm hold and blink |
| Walk | 8 | 110ms | Short alternating steps |
| Sprint | 8 | 70ms | Longer stride and forward head carriage |
| Mine | 8 | 110ms | Grip, lift, strike at frame 4, recover |
| Use | 8 | 130ms | Alternating small assembly motions |
| Yay | 10 | 100ms | Crouch, paws up, hop, landing |
| Pet | 10 | 150ms | Turn toward camera, relax, settle |

The turtle has a restrained body bob; frogs have wide toe pads; rabbit and
jerboa have extended hind feet. Tails move through separately drawn poses.
Quills, shell patterns, stripes, spots and crests follow the body without
changing the shared pixel scale. Shared action timing is an art contract, not
new gameplay speeds, resource yields, or extra mining events.

## Roster

| # | Species | Primary silhouette / markings |
|---|---|---|
| 1 | Wood mouse | Round ears, pink paws, thin curling tail |
| 2 | Sand lizard | Green scales, tapering tail |
| 3 | Fire salamander | Dark rounded head, gold spots |
| 4 | African brush-tailed porcupine | Long cream quills, bristly tail |
| 5 | Box turtle | Domed patterned shell, green limbs |
| 6 | European mole | Tiny eyes, broad pink digging paws |
| 7 | Hedgehog | Rounded spine mantle, pointed muzzle |
| 8 | Chipmunk | Face/back stripes, upright tail |
| 9 | Red squirrel | Ear tufts, curled russet plume |
| 10 | Field vole | Squat body, small ears, short tail |
| 11 | Shrew | Long narrow nose; original concept called this “Harvest Shrew” |
| 12 | Least weasel | Slender body, short cinnamon tail |
| 13 | Stoat | Long neck, black tail tip |
| 14 | Striped skunk | Cream stripe, raised plume |
| 15 | Pygmy spotted skunk | Broken cream spots, smaller bushy tail |
| 16 | Cottontail rabbit | Long ears, cream cotton tail |
| 17 | Pika | Round ears, squat body, no visible tail |
| 18 | Jerboa | Huge ears, long feet, tufted thin tail |
| 19 | Dormouse | Golden coat, fluffy curled tail |
| 20 | Lesser tenrec | Narrow spine crest, long muzzle |
| 21 | Tree frog | Large gold eyes, sticky toe pads |
| 22 | Natterjack toad | Stocky olive body, gold dorsal stripe |
| 23 | Crested newt | Jagged crest, coral belly, flattened tail |
| 24 | Leopard gecko | Gold spotted skin, fat segmented tail |
| 25 | Brown anole | Slender brown body, coral throat fan |

## Saved exports

[exports/manifest.json](exports/manifest.json) records every species, timing,
row order, source dimensions, anchors, and jump offsets. Each species has a
transparent native **400 × 224 spritesheet**, seven action rows with up to ten
40 × 32 frames. Empty trailing cells are transparent. `*-six-actions.gif` provides
an integer-enlarged six-action overview per species. `all-25-*.gif` provides
six full-cast action sheets. `roster-native.png` and `gallery-review.png` record
native and enlarged review views. GIFs are inspection artifacts, not world art.

## Review and checks

Applied art bible **1 (identity)**, **3 (pixel grammar and scale)**,
**4 (palette)**, **6 (Workers)**, **9 (UI)**, **10 (motion)** and the **critter
transition**. Compared against the approved Buttonwood reference, native human
Worker art, approved first wood mouse study, and no-overalls 25-species concept.
Native review preserves the cast's defining features while simplifying detail
for the actual pixel budget. No clothing or new palette ramps were added.

Review found and corrected fast-pose ear clipping on squirrel/rabbit/jerboa,
added connected legs under each body, and checked shell/quill/tool bounds.
The review gallery includes all species, camera-facing Pet poses, mirrored
movement, and all six actions per species. This coverage does not imply final
approval of every species or completed gameplay integration.

With the project served on port 8766:

```sh
node tower-of-babel/tests/critter-roster-art.test.cjs
python3 tower-of-babel/buttonwood/critters/export-gifs.py
```

The regression suite verifies **1,400 native frames**, 25 unique species,
binary alpha, named palette membership, exact mirrored anchors, distinct
motion poses, cache wrapping, unknown-species handling, and padded-canvas
checks for clipping. It also checks click-Pet completion, species selection,
frame scrubbing, 320/390/430/844px layouts, and reduced-motion startup.
The exporter uses Pillow and recreates the GIFs from tested native sheets.

Remaining integration work: separately authored 32 × 32 portraits, game
species/save assignments, actual movement speeds, event-aligned Mine/Use/Yay,
click-Pet hit areas, ages and real-world day/night review. Production gameplay
and original wildlife archives remain available throughout this art pass.
