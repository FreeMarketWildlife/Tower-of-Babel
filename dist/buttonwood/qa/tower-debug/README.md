# Tower progression and debug report review

October 11, 2026. Applies ART-BIBLE §§9–10 (short semantic controls, accessible
copy status, truthful stability) and §12 (responsive review). Compared with the
approved Buttonwood concept and the existing native HUD/equipment gallery.
The copy action reuses the Dev Tools button presentation; it adds no icon assets,
world art, collision changes or art direction changes. The fallback textarea uses
named cream/ink/outline palette colors and selectable 14px text.

Pause → Options → Dev Tools → Copy debug report captures current tower physics,
record, next quest, support/motion reasons for each block, mode flags, and this
world's latest save. Clipboard success is announced; denied/unavailable clipboard
access exposes and selects a read-only report for manual copying. Gameplay stays
paused. No report is sent automatically.

`tests/tower-debug-browser.test.cjs` verifies 31m towers built from multi-cell
and shifted bodies, a settled dynamic body, independent floating/tilted tops,
a missing support layer, full body envelopes, quest/save report contents,
clipboard success/fallback, and 320px/390px/landscape panel layouts.
The [fallback capture](fallback.png) shows the selected report in landscape.
Existing minimal HUD, Pause, inventory/nails and dev-control regressions pass.

Height credit uses actual body envelopes with a two-unit adjacency tolerance
(the ordinary 31px body sits in a 32px cell), grounded at terrain/buildings.
Every credited body needs a settled path to an anchor. Natural tree artwork is
excluded. Supported portions earn independently of unrelated loose/tilted blocks;
a floating tower still earns nothing. Speed, spin and tilt thresholds are unchanged.
