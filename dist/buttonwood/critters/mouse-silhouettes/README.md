# Mouse silhouette reset

[Open the still comparison](index.html).

The previous procedural 25-critter animation roster was rejected visually.
The user supplied `reference-mouse.png` as the identity anchor and requested
one mouse, three still postures, actual-size review, and additional pixel
budget if needed to preserve charm. This pass contains no new animations.

## Selected posture direction

The user liked all three generated concepts and selected:

- **A / Upright** for working, Mine, and Use.
- **C / Quadrupedal** for moving, Walk, and Sprint.
- **B / Mostly quadrupedal** is retained as a transition study between C and A.

This is a posture selection for the concept. It is not blanket approval of
native sprite interpretations, a new world scale, or an animated sequence.
Yay, Pet, and idle need key-pose review in this more animal-like design language.

## Artwork

`posture-concept-v1.png` was generated with the built-in imagegen tool using the
user's screenshot as the reference; the full prompt is in `PROMPT.txt`. It is
an enlarged concept comparison, not a certified sprite sheet. Its warm cheek,
large ears, cream muzzle/belly, pink paws, short limbs and thin tail establish
identity across all three poses. Tools were omitted to keep silhouettes clear.

`stills.js` separately authors three **40 × 32** stills and three **64 × 64**
stills with explicit pixel-cluster maps. These are not reduced concept images,
scaled copies of each other, generic ellipses, or animated rig variants. Both
rows use the named shared palette, binary alpha, and one art pixel per world
unit. The page starts at 1× and includes 2×/4× inspection, a 32px terrain-cell
reference, soil/night backdrops, and silhouette-only review.

The 40 × 32 studies use existing anchor `(18,31)`. The larger studies use proposed
anchor `(32,61)`, with natural grounded feet near row 61. A larger authored
canvas gives more room for ear shading, eye highlights, muzzle and haunches,
while also making the character physically larger at the shared world scale.
It is not permissible to shrink the larger artwork independently in gameplay.
Before adopting it, review doorway clearance, terrain scale, tool reach and
anchors together; existing saves and collision geometry are unchanged here.

## Review notes

Applied art bible **1 (identity)**, **3 (pixel grammar/scale)**, **4 (palette)**,
**6 (Workers)**, **9 (UI)** and the **mouse reset** direction. Used the native
art guide's one-pixel/world-unit and separate-portrait contracts. Compared with
the user's original mouse, approved Buttonwood reference, previous mouse native
sprite, and the new posture concept. The old 25-species roster stays archived as
review history and is not a style template for more work.

At 40 × 32, each posture is identifiable, but the ears, eye, muzzle and paws
have fewer shading steps than the concept. The larger stills preserve more of
those features and are the recommended next *review* budget. Both remain native
interpretation studies; neither should be treated as a finished animation asset
without visual feedback. Selecting A/C for actions does not require choosing
one universal upright or quadrupedal skeleton for every state.

## Files and checks

`exports/` contains six transparent native PNGs, dimensions/anchors in
`manifest.json`, and the actual-size review capture. `reference-mouse.png`
preserves the user attachment beyond its temporary original location.

With the project served locally on port 8766:

```sh
node tower-of-babel/tests/mouse-silhouettes-art.test.cjs
```

Checks verify the six exact budgets, palette membership, binary alpha, padded
bounds for clipping, backdrop/zoom/silhouette controls, and mobile page width.
Technical checks do not assert visual quality or user approval.
