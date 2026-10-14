# Overnight technical optimization — October 14, 2026

Three reproduced correctness failures are repaired, rendering and liquid work
allocate less, and the loader starts all independent modules together. No physics
parameters, balance, progression, artwork, saves, or animation cadences changed.
Work is local on `main`; nothing was pushed or deployed.

## Correctness

- A Worker classified as static while sleeping could wake without invalidating
  the collision index. The optimized detector then returned no terrain contact
  where Matter's original detector returned a collision. Cache invalidation now
  covers Workers and actual detector members. Temporary raycast bodies remain
  excluded, and velocity changes rely on the physics timestamp rather than
  unnecessarily rebuilding spatial buckets.
- Blur, hidden tabs, and lost pointer capture retained interrupted pinch records.
  A fresh finger could join the abandoned pinch; Move drags also survived blur.
  Shared cancellation now clears gesture, pending strikes, both touch maps and
  pinch state before releasing captures. Mouse, touch, normal pinch, keyboard
  Grab and building interactions pass their existing tests.
- Repeating a fairy departure with a removed/missing Worker threw before the
  original function could reject it. The audio wrapper now rejects stale calls
  before reading the Worker or creating departure art. The existing Fey suite
  reproduced this on the baseline and passes after repair.

`correctness-before.log` and `fey-baseline.log` retain the failing baseline evidence.
`overnight-correctness-browser.test.cjs` checks wake collision parity, relocation,
idempotent departures, interrupted pinch cleanup, fresh touches and Move cleanup.

## Measurements

Headless Chrome on the local Mac, 1280 × 900. The paired benchmark uses the same
seed and world, five batches per measurement, the median batch, 100 renders per
batch and 20,000 terrain-neighbor lookups. Animation frames are disabled in this
microbenchmark; the separate live profile samples five seconds at normal speed.
These local measurements describe these fixtures, not all hardware or gameplay.

| Paired fixture | Render 100 frames before → after | Improvement | Neighbor 20k before → after |
| --- | --- | --- | --- |
| Normal, 7,541 blocks | 136.7 → 121.8 ms | 10.9% | 15.1 → 12.0 ms |
| 30 Workers, 7,541 blocks | 138.9 → 122.7 ms | 11.7% | 15.3 → 11.7 ms |
| Seeded storm, 7,699 blocks | 156.2 → 147.6 ms | 5.5% | 14.9 → 11.6 ms |

A separate paired run with 60 ms added to each source request measured render
improvements of 8.0%, 11.1% and 12.3%. Native canvas hashes matched exactly in both
runs: normal `1332942647`, Workers `1589973812`, storm `958897052`.

With the 60 ms request delay, first-to-last module request spread fell from
599/646/758 ms to 147/151/233 ms. Total startup fell from 993 to 631 ms in normal
play and 1,038 to 769 ms with Workers. Storm startup varied from 1,198 to 1,268 ms;
the request waterfall improved, but total storm startup did not improve in that
sample. Without added delay, normal startup was 723 → 581 ms, Workers 655 → 580 ms,
and storm 571 → 590 ms. Browser scheduling, compilation and network timings vary.

Live profiles stayed near 60 fps: p95 was 16.7 ms before and 16.7–16.8 ms after.
One after-run Worker frame reached 33.3 ms; there is no claim that stalls are
eliminated. Normal sampled idle time rose from 3.51 to 3.70 seconds out of five;
Worker idle time rose from 2.99 to 3.09 seconds. Storm idle time was 3.07 → 3.10
seconds. Raw profiles remain in `/tmp/block-stacker-overnight`; compact summaries
are committed here. The profile shows Matter's full-world loops remain a major
cost in populated worlds; this pass preserves their simulation behavior.

Explicit collection after the paired render benchmark and one real physics step
measured retained heap at 23,778,184 → 23,869,172 bytes in normal play,
24,262,256 → 24,354,392 with Workers and 25,397,788 → 25,496,276 in the storm.
The correctness member set adds roughly 90–98 KB (under 0.4%). Transient heap
readings vary with collection; they are recorded but are not memory-saving claims.

## Allocation and loading changes

Terrain-neighbor directions are collected once; terrain origin reads use existing
metadata. Sprite cache signatures avoid several arrays per tile and use one cache
lookup. Both liquid renderers reject offscreen records before checking occupancy.
Buoyancy visits the maintained placed-body set instead of every terrain body.

The solver snapshots only eligible liquid records. All four passes still read the
latest Map in insertion order, so transfers, pressure and parity are preserved.
Absent kinds stop after the first empty snapshot. The allocation regression checks
exact mixed-liquid records after each of 180 ticks; its absent-kind fixture scans
2,000 records instead of 8,000. Existing 30/60/144 Hz conservation and save suites
pass. New source prefetches remove the late biome/feedback/discovery/placement
waterfall while retaining dependency evaluation order and isolated save keys.

The eight changed runtime files total 100,878 → 102,369 bytes (+1,491); gzip is
31,332 → 31,727 bytes (+395). No bundler is used by this project. Runtime changes
are mirrored into `dist`, and both the loader compiler test and production browser
checks pass. The existing pending level-reward module is preserved and included
in local integration checks; its unrelated changes are not part of these commits.

## Verification and preservation

- 21 unit suites passed, including exact liquid-record parity, empty-kind work
  bounds, terrain joins, production compilation and all four save destinations.
- 22 selected gameplay browser suites passed. Coverage includes query and collision
  parity, live storm debris, Workers, Fey, liquid/oil extraction, crafting, towers,
  placement, keyboard, mouse/touch mining, fog, native presentation and pause.
- The two initial integration failures were resolved: the baseline stale-departure
  crash was fixed; the pickaxe suite now checks the existing approved dirt kick
  instead of the obsolete hi-hat filter signature. Audio itself was not redesigned.
- Production `dist` passed the new correctness suite and existing performance
  parity suite. The live sound playground also passed after the departure guard.
- The exact staged snapshot, exported into `/tmp` without pending user changes,
  separately passed both loader compiler/save suites, exact liquid-record parity,
  and production correctness/performance browser suites on port 18744.
- All 37 pre-existing modified/untracked files were preserved. Only the two loader
  files additionally contain this task's prefetch edits. Tests' generated QA images
  were retained in `/tmp` and the exact pre-test images restored.

The pending v92 loader invocation and its matching prefetch remain together in the
working tree. The committed loader prefetches only already tracked modules, so its
independent production snapshot never requests the user's uncommitted module.

Art review follows ART-BIBLE §§3–5, 8, 10 and 12 and ART-GUIDE pixel/render contracts.
The approved native presentation and gallery asset families are unchanged; paired
production pixel hashes prove unchanged output for the measured scenes. Art
direction and migration coverage did not change, so the existing bible and inventory
remain intact.

Correctness commit: `daf4b29` (`Fix Worker wake collisions and interrupted input state`).
The allocation/loading change and this evidence are a separate focused commit.

## Reproduction

Serve the repository on an unused loopback port, such as 18743. Point
`SKY_TEST_URL` at its `tower-of-babel/` or `dist/` entry, set `NODE_PATH` to the
installed Playwright package location, and optionally set `SKY_TEST_BROWSER`.

```sh
node tower-of-babel/tests/loader.test.cjs
node tower-of-babel/tests/liquid-allocations.test.cjs
node tower-of-babel/tests/overnight-correctness-browser.test.cjs
node tower-of-babel/tests/runtime-benchmark.cjs
node tower-of-babel/tests/runtime-profile.cjs
```

The paired benchmark accepts `SKY_BASELINE_DIR`: relative source files suffixed
`.baseline` override only the before page. `SKY_BENCH_LATENCY=60` adds source-request
latency, and `SKY_BENCH_OUTPUT` saves JSON. `SKY_PROFILE_DIR` controls raw profile
output. The baseline snapshots and full logs for this run are in
`/tmp/block-stacker-overnight`. No scheduled reminder or notification was created;
the parent task consolidates the morning report.
