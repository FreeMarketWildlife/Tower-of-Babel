# 42 × 42 critter concept experiment

[Review concepts and gameplay scale](index.html). [Live isolated sample](../../../?sample=buttonwood&critters=42).

Mouse, box turtle and woodland lizard are unclothed stills made with the built-in image generator using the approved mouse silhouette study as the style reference. Exact prompts are in [PROMPTS.json](PROMPTS.json); enlarged originals are preserved in `source/`.

Each final PNG is exactly 42 × 42 with binary alpha and colors from `../../palette.js`. Ground anchor is `(21,40)`. Occupied bounds are mouse 38 × 32, turtle 38 × 23, lizard 38 × 26. The generator did not return a native 42-pixel image: `prepare.cjs` crops alpha bounds, samples with nearest-neighbor to fit 38 pixels, pads to 42 and maps colors to the shared palette. This is an explicitly requested size experiment, an exception to the bible's production prohibition on shrinking painted concept art. These remain unapproved concepts, not production sprite masters.

Review notes reference art bible sections **1: Composition at three distances**, **3: Pixel grammar and scale**, **4: Palette/materials**, and **Critz character transition / Mouse reset**. Compare face, ear/tail contours, shell readability and natural posture at 1×, then whole-scene enlargement. Small scale necessarily loses some reference detail; approval is visual, not established by technical checks.

The live preview places three render-only fixtures beside the sample Home. It uses the isolated sample save and ordinary camera zoom; it does not change character behavior, hitboxes or normal gameplay artwork. Stills have no animations. A upright work / C quadrupedal travel remains the intended mouse animation direction.

Verification: browser loaded all three 42 × 42 PNGs, review canvas and live sample; shared world scale and unchanged collision geometry checked. Gameplay screenshots are stored here for review.
