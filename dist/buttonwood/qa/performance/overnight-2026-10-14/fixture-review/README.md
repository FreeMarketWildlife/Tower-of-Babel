# Lunar and adult-navigation fixture follow-up

Both original failures were stale assertions. Investigation also found and fixed
a technical defect in supported installed-ladder travel. Intended mechanics remain
unchanged; no creative or balance decision is needed. Work is local on `main`,
with all 37 pending user files preserved and no push or deployment.

## Full-moon timing: outdated assertions

The ART-BIBLE's **Quiet sky and rare full-moon fire — v81** section specifies
six-minute days and two-minute nights. ART-GUIDE's **Slow clock, scenery picking
and full-moon fire — v81** records 360000/120000 ms, the once-only saved-clock
migration and unchanged eight-night lunar stages. Commit `54b35d5` explicitly
doubled the previous 180000/60000 constants; current `game-v55-workers.txt`
matches. See [authoring diff](lunar-rule-history.txt).

`critter-eggs.test.cjs` still advanced the old durations, and its post-reload
merchant-closure check also assumed dawn after sixty seconds. The fixture now
asserts the authored durations, checks every phase one millisecond before and
at dusk/dawn, confirms the merchant only visits the fifth night, and verifies
the restored merchant remains through the last night millisecond and closes at
dawn. Existing 31-species art, Bell prices, incubation, hatchling identity and
save-isolation assertions remain. No runtime clock, lunar gate or balance changed.
Local commit: `9361a61`.

## Adult wall grip: intentionally unsupported

Settlement commit `992eabc` deliberately changed the navigation rise limit from
level-based wall-climbing heights to 1.2 blocks and gated sheer-wall grip on
`isChildV56`. Its authored comment, still present in `game-v56-settlement.txt`,
says: “Daytime mining can use installed ladders too, but never grips sheer walls.”
See [authoring diff](adult-rule-history.txt).

The old fixture expected a level-three adult to grip a three-cell wall, and its
later two-cell overhang case also lacked a supported high route. The test now
checks all three adult tiers in an actual airborne wall-contact pose: no wall
grip and no upward grip velocity. Positive high-ledge and overhang cases supply
clear, connected ladders, use real production route following and Matter physics,
then verify resumed deepslate/dirt harvesting. The ordinary one-cell jump,
upgrade, tunnel, unreachable-work, live-music and suspended-audio checks remain.
Adult grip permission, jump parameters and routing rise limit were not changed.

## Installed-ladder landing: actual technical defect

The new supported-route case fails on the previous settlement source. A Worker
ascends its ladder but stops about eleven pixels below the route's landing-centre
height, then tries to walk while its feet still intersect the ledge. After 360
fixture ticks it remains at `(21.4900, -34.1858)`, with the next route point at
`(48, -45.3)`. This is not unsupported wall grip: the ladder is installed in
clear cells, the route exists and the Worker has already entered ladder travel.
See [before failure](ladder-before.log).

`climbLadderV56` previously stopped ascent a half-body height (12.8 world units)
below the centre-height goal. It now uses a half-pixel arrival tolerance, allowing
the existing body to clear the unchanged landing collider before moving across.
The climb speed remains -1.9, horizontal control and clearance checks stay intact,
and no teleport, collider, recipe, currency, save or wall-grip rule changes.

The same scene reaches its landing in 100 ticks at `(68.7451, -44.7481)` and then
mines the high deepslate. The overhang route also completes and harvests its dirt.
Those are about 1.67 versus 6 seconds of fixture physics time, not a wall-clock
performance benchmark. The old-source override reproduces the failure without
reverting any working files. [Before/after classification data](classification.json).
Local runtime/regression commit: `ca201b1`.

## Verification and preservation

The same aggregate now passes **23 pure unit suites and all 26 selected browser
suites**, including the two previously failing tests. Coverage includes exact
clock boundaries, adult permissions and ladder landings, real harvests/audio,
settlement, Fey, storm gameplay, Pause/input, 30/60/120/144 Hz scheduling, native
art/collision/viewport parity and repeated lifecycle/save/restart stress.
[Aggregate results](aggregate-results.json) lists every check.

An exported committed-only `dist` tree, excluding all pending user files, passes
loader/production compilation, lunar fixtures, Worker navigation/live audio,
settlement saves and scheduling. [Committed results](committed-results.json).
The documented static release has no separate build step. Source and `dist`
runtime/test copies match. Generated QA/export images were retained under
`/tmp/block-stacker-fixture-review/generated-after` and restored in the checkout;
all 37 pending files remain byte for byte unchanged.

The test README's obsolete 180/60-second and adult wall-grip descriptions now
match these authored rules. Historical scheduling-review failure logs remain
unchanged as baseline evidence. Current failures: none in the executed aggregate.

Art/physics review: ART-BIBLE §§3, 5–6, 8, 10 and the v81 timing section;
ART-GUIDE native-scale, physics/save and v81 clock contracts. No authored art,
sprite cadence or collision envelope changed; no bible or migration update is
required.

Reproduce `critter-eggs.test.cjs` and `miners-browser.test.cjs` with the standard
`SKY_TEST_URL`/`SKY_TEST_BROWSER` setup. `SKY_TEST_SETTLEMENT_SOURCE` optionally
points to the previous `game-v56-settlement.txt` (from `742cad0`) to reproduce the
new landing regression. Logs, source snapshots and raw QA remain in
`/tmp/block-stacker-fixture-review`.
