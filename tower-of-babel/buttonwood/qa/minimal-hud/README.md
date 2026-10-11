# Minimal HUD and Bells review

Applies ART-BIBLE §§3–4 (one world pixel per unit and native UI canvases), §9
(icon grammar, cream/timber surfaces, mint state, accessible names and 44px
controls), §10 (truthful stability and collection feedback), and the Minimal HUD
and Bells amendment. Compared against the approved Buttonwood reference and
native equipment gallery (`qa/v68-native-items.png`). New assets are also shown
at 1× in the native gallery’s Tower & Bells section.

[Native icon strip](native-icons.png), [Desktop](desktop.png), [quest log](quests.png), [390px phone](hud-390.png),
[320px phone](hud-320.png), [landscape](hud-844.png).

The main interface uses icons and quantities. Each new icon and clock is 32 × 32
source/display pixels with shared palette colors and binary alpha. Narrow screens
reflow controls instead of shrinking art. The original v77 nail-toggle study is superseded by the v78 inventory nail item;
current gameplay screenshots show the six-slot toolbar. See [inventory/nails
review](../inventory-nails/README.md) for the new equipment and pinning behavior. The quest log
remains attached to its trigger, scrolls, and opens at the next milestone.

`tests/minimal-hud-browser.test.cjs` verifies hidden status strips, native sizes
and palette/alpha, six-slot toolbar, quest progression and auto-scroll, day/night
clock and Pause, Options Tips, player/Worker/Fey Bell harvesting, actual native Bell
reward rendering, independent gold ore/bar smelting, save/reload, immediate height
awards and rejection of unsupported/tilted towers, pickup sound limiting/mute,
and desktop/phone/landscape layout. Existing Pause, keyboard, hotbar, Fey and
Buttonwood integration checks verify older interactions and fixture/save isolation.

Screenshots freeze the frame scheduler for deterministic review and explicitly
render after viewport changes. They show a simple supported test tower; phone
captures also show a tilted top and its stability indicator. Ordinary gameplay and the sample retain their existing world and collision scale.
