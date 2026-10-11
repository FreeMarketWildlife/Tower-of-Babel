# Wildlife-style Critz idle animals

[Open the current idle gallery](index.html). [4× roster PNG](exports/idle-roster-4x.png). [Native roster PNG](exports/idle-roster-native.png). [Gameplay-scale scene](exports/world-native.png).

The user abandoned the prior concept-derived critter style and selected the existing mole, worm, bird and butterfly artwork as the character reference. This is the new direction. The prior animation roster and 42px concepts remain archived review history.

## Style and review notes

Art bible references: **§3 Pixel grammar and scale**, **§4 Palette and material vocabulary**, **§8 Landscape, depth, and light / wildlife**, and **Wildlife-style critter reset**. Native wildlife uses small colored contours, one-pixel eyes, compact natural animal bodies, broad upper-left highlights and sparse species cues. These idle models use the same rectangle, scanline polygon and stepped octagon vocabulary as `wildlife.js`; they are directly authored native pixels, without image resampling or a humanoid animation rig.

The European mole reuses the exact existing `A.wildlifeSprite('mole',{frame:0})` pixels. Cottontail uses the existing rabbit silhouette with the roster's brown/cream coat. Bird, butterfly, worm, firefly, original rabbit and original mole remain unchanged and appear beside the new cast for comparison.

All 25 roster species have one idle still each, with no clothes or tools. Species retain natural profiles: long low reptile/mustelid bodies, shell dome, quill mantle, rodent ears/tails, rabbit ears and frog haunches. Every sprite is unique. This work does not add new animations or replace ordinary gameplay Workers.

## Native contract

`A.critterIdles.roster`: IDs, labels, dimensions, ground anchors and identifying cues.
`A.critterIdles.sprite(id,{direction:1|-1})`: cached transparent canvas; unknown ID returns null. Sizes are 22–32 px wide and 14–26 px tall; exact dimensions and anchors are in [manifest.json](exports/manifest.json). Ground anchor is `(floor(width/2),height-1)`. One source pixel equals one world unit. Colors come from `palette.js`; alpha is binary. The gallery shows each animal at 1× and 4× and includes the native Home and meadow at 1×.

Individual PNGs: `exports/<species-id>-idle.png`. The roster sheet uses 40 × 32 cells as padding only; it does not enlarge the animals. The separate 32 × 32 UI portrait contract remains unchanged and is not implemented in this study.

Visual review: checked the 25-species sheet and actual-size Home/terrain scene. Small eyes, sparse highlights and low profiles match the wildlife reference. Pending user approval of individual new animals; technical checks do not establish aesthetic approval.

Verification: browser gallery loads without errors; 25 nonempty unique sprites, exact metadata dimensions, named palette membership, binary alpha, and pixel-identical original mole. Both directions are mirrored from the same source pixels. Production wildlife and simulation files are unchanged.
