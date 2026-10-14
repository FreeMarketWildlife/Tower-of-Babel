# Second-pass quality and performance review

Completed locally on `main`, preserving all 37 pending user files byte for byte.
No push or deployment. Two focused runtime commits:

- `abed6b3`: incremental viewport buckets and stationary candidate reuse.
- `e3f9bd3`: conservative lava bounds before exact obsidian contact checks.

## Independent review and lifecycle stress

Reviewed the first-pass changes against their previous implementations. Velocity
setters change previous-position/velocity state, not bounds; the next physics
timestamp refreshes moving queries. Geometry and static transitions still
invalidate the spatial caches. Worker sleep/wake classification is included.
The input cancellation path clears state before releasing captures, so resulting
lost-capture events cannot act on the cancelled gesture. No asynchronous cache
work or additional event ordering was introduced.

New stress coverage passed 300 cycles for twelve Workers: 3,600 sleep/wake pairs,
with duplicate calls, exact optimized/original Matter collision parity and finite
dynamic mass after waking. It also passed 300 pinch cancellations, forty real
mouse capture interruptions and unchanged inventory after cancellation.

Twelve actual reloads preserve a sleeping Worker, pocketed Bells, inventory,
partial crafting, liquid kinds/amounts and clock state. Dawn restores finite mass.
Four actual Restart World confirmations reset only the selected normal, sample,
sound or survival-demo slot; sentinel values in the other three slots remain intact.
The same stress and restart checks passed in an exported committed `dist` snapshot
without any pending user changes.

The environmental ghost suite initially expected the old manual-release ghost.
That assertion also fails against the pre-optimization code: the already-approved
knife departure grants Bells without a ghost. The updated test retains all
environmental death, grace, revival and save checks, and verifies a repeated
knife action cannot pay twice. Production departure behavior was not changed.

## Equivalent-workload benchmark scope

The first-pass result was independently repeated against its exact before/after
sources, with alternating run order. Median render improvements were 9.6% in the
normal fixture, 11.0% with thirty Workers and 10.4% in the seeded storm fixture.

Second-pass comparison uses first-pass commit behavior as its baseline. Two paired
rounds alternate before/after order. Every pair asserts the same seed, camera,
block/Worker/building/liquid-cell counts, native canvas hash and post-excavation
hash. Viewport: 1280 × 900; seeded random stream and fixed date; no added network
delay. Thirty warmups precede five batches of 100 renders. Values below are the
median of the two per-round medians.

Rendering calls `__buttonwood.render(12000)`: background, terrain, mapped liquids,
Workers, effects and world overlays. Animation frames and simulation advancement
are disabled. These timings exclude physics, AI, input dispatch, progression and
general UI layout. The storm fixture is the seeded tower before its live barrage.
Live gameplay profiling and integration suites are separate evidence.

| Fixture | Blocks | Render 100 before → after | Gain | Block draw-wrapper visits before → after |
| --- | ---: | ---: | ---: | ---: |
| Normal | 7,541 | 105.8 → 89.2 ms | 15.7% | 7,541 → 493 |
| Thirty Workers | 7,541 | 111.2 → 92.4 ms | 16.9% | 7,541 → 493 |
| Seeded storm | 7,699 | 131.5 → 115.9 ms | 11.9% | 7,699 → 41 |
| Explored 25 chunks | 37,708 | 230.45 → 90.75 ms | 60.6% | 37,708 → 493 |

Canvas draw output is unchanged; the optimization avoids calls that the old
wrapper rejected as offscreen. Thirty terrain removals followed by rendering
measure mutation cost. Explored-world p95 is 3.95 → 2.35 ms; normal is
2.60 → 2.35 ms. Storm p95 is 1.50 ms in both variants. No elapsed-time threshold
is used as a regression assertion.

A rejected prototype rebuilt the full spatial index after each removal and
increased explored mutation median from 3.3 to 8.0 ms and p95 from 5.7 to 13.0 ms.
The final renderer updates only the affected single-cell bucket. Moving,
oversized, rotated or irregular bodies retain exact bounds checks. Candidate
references are reused only when every block is static and the exact camera bounds
are unchanged; membership/geometry changes clear them immediately. No texture,
animation, damage, lighting or physics state is cached by this candidate list.

Viewport regression coverage compares exact membership and original Set order
over 120 views, overlapping/large bodies, movement, rotation, scale, static
transitions, removal/re-add, physics motion and clear/re-add. Desktop and phone
canvas hashes match the previous full traversal.

Explicit collection after the paired renders, thirty removals and one physics
step measured additional retained JavaScript heap of 415,462 bytes in normal play,
408,764 with Workers, 403,274 in the storm and 1,978,570 in the explored world.
That is about 1.6–1.9% of the baseline heap. This is a deliberate memory/CPU tradeoff;
transient heap and GPU canvas allocation are not claimed as improvements.

## Liquid reaction work

The live profile contains buried lava even in the starter world, so a no-lava-only
prototype did not help normal play. The final guard derives a conservative box
around eligible lava cells, expanded by one subcell. Water outside that box cannot
contact any lava. Remaining water retains the original snapshot order, exact
cardinal contacts, threshold, twelve-product limit and third-liquid protection.
Fractional or invalid coordinates retain the original contact path.

Exact mixed water/taint/lava traces match the previous contact loop. Both a
water-only fixture and a separated buried-lava fixture reduce 1,000 water cells'
neighbor probes from 4,000 to zero. New pours, threshold edges, oil protection,
fractional coordinates, conservation, saves and extraction checks pass.

Five-second live samples measured inclusive reaction time of 36.2 → 1.5 ms in the
starter world and 136.7 → 4.5 ms in the explored world. The starter sample contains
296 water, 182 lava and 92 oil records; the explored sample contains 1,572 water,
882 lava and 814 oil records. p95 remains 16.7–16.8 ms across the two scenes. These are sampled
local timings; they are not a claim about total-game CPU improvement on all devices.

## Checks and remaining priorities

22 unit suites and 19 selected browser suites pass. Browser coverage includes
render/collision parity, lifecycle stress, environmental ghosts, actual storm
debris, construction, mining, Fey/taint, extraction, native terrain/fog, responsive
presentation and pause. Exported committed production additionally passed viewport,
lifecycle/restart, reaction and loader/save isolation checks. Source and `dist`
runtime changes match. The four changed runtime files add 3,672 raw bytes and
980 bytes for gzip of their concatenation relative to the first pass.

Prioritized technical backlog:

1. **Refresh-rate/physics scheduling validation.** `loopV24` still advances Matter
   by 16.67 ms per animation callback. Real live tests here use about 60 Hz; they
   do not establish equivalent physics at 30/120/144 Hz. Establish deterministic
   contact/input/audio traces before changing that scheduler, preserving 60 Hz feel.
2. **Full-world physics cost and growth.** After the rendering fix, the explored
   profile samples about 537 ms in Matter update calls plus 175 ms in velocity
   updates and 179 ms in position solving over five seconds. Expanding from five
   to twenty-five chunks adds roughly 80 MB of retained JS heap. Profile static
   body passes and chunk representation before attempting collider consolidation
   or simulation activation changes; those can affect physics and saves.
3. **Source delivery.** The committed loader reads 91 independent source modules:
   997,181 raw bytes, about 330,222 bytes if gzip-compressed individually. This
   excludes HTML, CSS, audio.js, the Matter CDN dependency and generated canvases.
   Winter-sky data alone is 148,423 raw / 23,364 gzip bytes. Assess a deterministic
   production bundle and verified delivery compression/cache headers. This pass
   did not change hosting or assume those headers are absent on the deployed site.
4. **Remaining render/solver hot paths.** Terrain-neighbor reads and liquid flow
   remain prominent sampled costs. Cache only with explicit grid/material/settled-
   placement invalidation and exact pixel/conservation traces; broad caching without
   those contracts would risk stale joins or altered liquid behavior.

Art review: ART-BIBLE §§3–5, 8, 10, 12 and ART-GUIDE native-scale/render contracts.
The approved native presentation and gallery families are unchanged. Pixel hashes,
geometry parity and all-world simulation preserve creative direction and collision
envelopes; no bible direction or migration coverage update is required.

Reproduce with `runtime-benchmark.cjs`: `SKY_BASELINE_DIR` overrides before sources,
`SKY_AFTER_DIR` can pin after sources, `SKY_BENCH_ROUNDS=2` alternates order,
`SKY_BENCH_SCENES=normal,workers,storm,explored` sets fixtures and
`SKY_BENCH_MUTATIONS=30` adds excavation samples. `SKY_PROFILE_SCENES` selects live
profile fixtures. Raw profiles and source snapshots remain in
`/tmp/block-stacker-second-pass`; compact data and test results are committed here.
