# v83 fire and brimstone

Reviewed against Buttonwood bible §§3–4 (named palette and native scale), §6
(existing character identity), §8 (quiet distant sky behind dangerous world
objects), §10 (purposeful contact animation, no bloom/blur/full-screen flashes).
The approved native gallery remains the family reference. New fireballs use
dark rock rims, coral flame tongues and gold/cream cores; blast masks use the
same grid footprints as damage. Ash figures reuse existing native sprites.

Standard blast: `0xx0 / xxxx / xxxx / 0xx0`, 12 occupied cells. Large balls use
a six-cell rounded mask. A body is hit once per explosion for two points, with
one nail armor point consumed first. All pins on that damaged body break.
Unnailed surviving placed blocks launch with mass-sensitive impulses and spin.
Natural terrain remains anchored until destroyed; bedrock keeps its immunity.
Positive damage from mining also consumes nail armor and releases placed bodies.

`brimstone-browser.test.cjs` checks exact masks/corner exclusion, two-point
damage, nailed stone's 3+1 durability, general damage armor consumption, unpinning
and deleted pin state, obsidian damage, real debris velocity, no rewards, lethal
Worker/Fey/wild hits, direct fast hits on airborne wild animals, no fairy-blood
taint, live demo destruction, caps, save validation, and pause. Inventory/nail,
Fey and survival-demo regressions preserve their existing contracts.

The survival demo v2 preserves v1 and the normal world. It starts paused, with
finite stock, seven Fey Tower builders and three Workers. The meteor roll stays
1/6 of eligible full moons outside this seeded demo. No forecast or warning UI.

Budget: 24 live projectiles, 640 launches, 18 blasts, 24 ashes, 64 nail particles.
Physics debris consists of existing blocks; no permanent particle bodies accrue.
Audio uses the Effects bus with spatial, chord-root impacts and volume/pause
guards. [Barrage screenshot](barrage.png) shows an isolated simulation after
roughly 12 seconds of active play, before transient effects are cleared by load.

## Local fracture revision — v84

Reviewed under bible §§3–5 and §10: existing native material tiles and progressive
crack marks identify individual surviving cells. No new palette or pixel scale.
Large placed rectangles split into real cell bodies on first contact. Rotation,
material, existing wear, area cost, velocity, and actual cell nails transfer; only
blast-intersecting pieces are damaged. Geometry tests use real polygon collision,
not only bounding boxes. Two points for soft materials/stone; one for obsidian
and deepslate. Each affected piece is processed once; untouched pieces keep pins.
The 450ms launch cadence caps a fresh shower at 200 launches.

Browser regressions cover a 5×5 nailed stone block becoming 25 pieces, exactly
12 worn cells and 13 untouched cells, then only the worn stone cells disappearing
on the next strike. Obsidian survives both strikes; rotated deepslate survives;
fragment shape, wear, nails and material survive save/restore. Existing actor
deaths, pause, event eligibility and demo save isolation remain covered.
The updated barrage screenshot shows the less destructive actual survival scene.

## Visible wear and explosion falloff — v85

Bible §§3–5,10; approved native material tiles remain the base artwork. The native
terrain renderer now paints five saved-durability stages for obsidian/deepslate:
contrasting connected fissures, exposed edges, branching and chipped faces.
Sprites retain their grid footprint; the collision shape changes only when a
real piece is destroyed. [Wear stages](wear-stages.png): obsidian above, deepslate
below, increasing damage from left to right. Checked at native world pixel scale
and enlarged for inspection; camera zoom and debris rotation apply uniformly.

All materials take two damage in the inner core and one in the outer rim; nail
armor applies afterward. A piece intersecting several cells takes the highest
zone value once. Four-cell blasts have four core/eight rim cells; six-cell blasts
have twelve core/twenty rim cells. The painted blast uses cream/gold in its core
and darker coral in its rim, with identical radius tests.

Browser checks verify exact 2/1/0 cell wear on an unarmored 5×5 block, armor
consumption, surviving rim stone, strong-material survival, rotated intersections,
saves, live demo, pause and eligibility. Pixel samples from the actual native
renderer confirm strictly increasing fracture coverage over five wear stages
and identical pixels when redrawn. Earlier v83/v84 damage descriptions above
are historical; this revision supersedes their uniform damage rules.

## Whole-hit nail shields — v86

The first positive damage event consumes the nail and all pins on that affected
piece, absorbing the entire event with no material wear. This replaces the earlier
one-point armor rule. Player mining and every other `game.hits` damage source
share the accessor. Restore imports saved wear without consuming the shield.
Blasts still fracture large bodies locally; unaffected pieces keep their shields.
Released pieces get a stronger bounded upward/outward impulse, using real mass
and physics, with no new visual asset or camera effect (bible §§3–5,10).

Checks cover one-, two-, and million-point strikes, a nearly broken block surviving
its first real player mining hit then breaking on the next, shield persistence
after reload, unchanged saved material wear, normal second-hit damage, local
blast fracture, first-impact material protection, real velocity, missing pins,
nail inventory/audio/save behavior, and actual demo survival hail.
