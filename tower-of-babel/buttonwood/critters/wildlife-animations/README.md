# Critz wildlife crew: animation and gameplay

[Animation gallery](index.html) · [Play](../../../) · [Full-moon sample](../../../?sample=buttonwood&view=moon-fairy)

31 forms: 25 approved critters plus original bird, butterfly, worm, mole, rabbit and firefly. Each has idle and the six requested actions: Walk, Sprint, Mine, Use, Yay, Pet. Individual right-facing 320 × 224 sprite sheets use seven rows in that order and eight 40 × 32 cells per row (idle fills four cells). [Manifest](exports/manifest.json) records timing, anchors, species and abilities. Animals keep their native size inside the padded frame; no concept resizing or clothing. Mine adds a native pickaxe; Use gestures over a tiny assembly; Yay lifts the body; Pet presents tiny front-facing eyes and a petting hand.

All-cast animations: [Walk](exports/all-animals-walk.gif), [Sprint](exports/all-animals-sprint.gif), [Mine](exports/all-animals-mine.gif), [Use](exports/all-animals-use.gif), [Yay](exports/all-animals-yay.gif), [Pet](exports/all-animals-pet.gif).

## Play

The moon/egg button shows the current phase and opens an adjacent panel. The moon advances one stage per night through eight phases, starting with New Moon on night 1. The fairy appears during Full Moon on nights 5, 13, 21 and so on, and disappears at dawn. Tap her or the moon button to shop. Choose a species egg and spend 5 shared gold. Eggs incubate beside her visit spot for 30 seconds of active play, then hatch as actual Workers. You may have 64 incubating eggs. All 31 forms are available in the shop, including the original wildlife variants.

Hatched Workers use existing mine navigation, building assignments, Home beds, health and saves. They hatch from eggs and do not enter the human pregnancy system. Tap one to Pet and open the six-action/ability panel. Workers automatically show Walk/Sprint during travel, Mine on strikes and Use on active building jobs. Walking and Sprint commands affect movement when ordinary Home/workplace control permits it. Mine commands hit reachable eligible terrain; Use is the requested small assembly gesture. Wild animals and cage occupants share the action vocabulary, and a regular tap pets them; buckets still capture/release them.

Abilities are small and contextual: Burrow adds one hit to nearby exposed dirt; Handy paws advances an active building job by 2 seconds; Quick feet sprints for 4 seconds; Scout/Keen senses marks the nearest exposed ore within six blocks for 6 seconds. Each has a 12–20 second cooldown. Failed abilities spend no cooldown. No passive resource generation or changed mining tiers. Flyer/burrower anatomy remains distinct.

## Saves and review

Egg species/location/remaining time and Worker ID→species/ability cooldown persist in additive `structuresV46.crittersV73` data. Existing human Workers and original wildlife are preserved. Time uses the existing saved 180-second day / 60-second night; no offline hatch progress. The sample uses its own save key and its full-moon preview adds sample gold only.

Art review references: ART-BIBLE §§3–4 (native scale/colors), §6 (actions), §8 (wildlife/sky), §9 (adjacent native UI), §10 (purposeful motion), and Wildlife crew production integration. [NASA's phase reference](https://science.nasa.gov/moon/moon-phases/) informed waxing/waning silhouettes; the game's one-night-per-phase cadence is intentionally fictional.

Verification: `tests/critter-eggs.test.cjs` checks 1,612 frames, mirror/palette/alpha, eight lunar stages, full-moon-only buying, exact gold costs, all 31 egg hatch/save roundtrips, real Worker identities, abilities and cooldowns, Pet, dawn closure and save isolation. Existing Buttonwood, sky, wildlife and grounding regressions also pass. Animation gallery and full-moon/hatched-Worker screenshots are stored in `exports/`.
