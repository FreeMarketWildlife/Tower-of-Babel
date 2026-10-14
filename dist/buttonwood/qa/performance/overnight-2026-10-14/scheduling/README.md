# Refresh-rate scheduling review

Completed locally on `main`, preserving all 37 pending user files byte for byte.
No push or deployment. Runtime/test commit: `46b1921`. This addresses the
second-pass review's first priority.

## Defect and implementation

The previous frame loop ran one 16.67 ms Matter step per animation callback.
Over two seconds, including its immediate initial step, the deterministic fixture
ran 61 steps at 30 Hz, 121 at 60 Hz, 241 at 120 Hz and 289 at 144 Hz. Gravity,
movement and Worker navigation therefore depended on screen refresh rate.
The [baseline failure](baseline-scheduling.log) establishes that defect.

The loop now schedules Matter and the entire Worker/gameplay update chain at
60 ticks per second, retaining the exact 16.67 ms Matter delta, physics-before-
Worker ordering and immediate first step. A callback can perform zero or several
ticks. Catch-up is capped at six steps (100 ms); excess physics debt is discarded
and the tick origin advances. Repeated timestamps cannot duplicate steps.
Backward clocks reset the accumulator; zero is a valid timestamp.

Nested gameplay `performance.now()` calls receive the scheduled tick time only
during a synchronous simulation step. `finally` restores the clock even if an
update throws. Browser performance time is unchanged. Canonical tick timestamps
multiply by 1,000 before dividing by 60: a prototype's alternative floating-point
expression moved a silent mining strike by one tick at an exact boundary. The
old/new production trace caught that and the final formula preserves the beat.

Pause/visibility reset debt and elapsed origins for liquids, trees, exposure,
Industry, buildings and settlement. Resume primes one step without hidden-time
aging. The existing active-play pause offset remains authoritative. Visible
stalls retain each subsystem's existing elapsed-time guards; discarded physics
time is not reconstructed later.

Rendering, progress, camera controls/tweens, the 8 ms pick timer and audio retain
their existing callback/timer paths. Worker navigation runs beside physics because
its per-step velocity control is part of the established 60 Hz feel. No new
interpolation, collider, recipe, balance, save key or visual change was introduced.

## Deterministic and real-game evidence

`scheduling.test.cjs` checks all four rates, exact legacy 60 Hz timestamp/movement/
one-shot impulse traces, Matter delta, render/camera callback counts, bounded
catch-up, discarded debt, background/Pause, exception cleanup and clock recovery.

`scheduling-browser.test.cjs` uses the production loader and real Matter, with
controlled RAF/wall time only in isolated fixtures. All four rates produce the
same 481-step trace over eight seconds: falling block, Worker movement, actual
harvests, liquid records, Home crafting, eggs and settlement time. Each finishes
with two harvested dirt, one crafted Home and 8,000 ms of settlement elapsed time.
The old 60 Hz trace matches, including mining boundaries and liquid amounts;
numerical tolerance is 1e-7 with exact discrete events and step deltas.

Short background/Pause checks perform one resumed physics step with no hidden-time
crafting, egg or settlement advancement. A 200 ms visible stall performs six steps
while existing elapsed clocks account for 200 ms of active play. Long stalls stay
capped and duplicate callbacks cannot replay debt. The clock override clears.

Two actual mouse taps retain queued strikes through capped catch-up and each
mine once through the independent 8 ms timer, including a callback with no physics
tick. Skipped musical slots add no hits. Live gameplay runs at approximately
60 simulation steps per second without dropped debt; actual pause/save/reload
preserves Worker identity, level, seven pocketed Bells, finite physics and clock.
See [compact results and liquid hashes](browser-results.json). Full liquid records
and raw source fixtures remain in `/tmp/block-stacker-scheduling`.

## Timing, memory and delivery

Seven alternating batches of 200,000 callbacks isolate scheduling with no-op
physics, AI and drawing. At 60 Hz median time is 2.51 → 5.31 ms per batch, about
**14 ns added per callback**. At 144 Hz it is 2.68 → 5.37 ms, about 13 ns added;
physics/Worker calls fall from 200,000 to 83,334 for the same callback timeline.
These are local Node/V8 microbenchmarks, not total-game speed claims or timing
pass/fail limits. See [overhead.json](overhead.json).

Five-second live samples record p95 frame intervals of 16.8 ms in normal play and
16.7 ms with thirty Workers or the storm, with no runtime errors. These are
observational, not paired comparisons; the local display is about 60 Hz.
[Profile summary](live-profile-summary.json) includes heap observations and CPU
samples. Raw profiles remain in the temporary evidence directory. The scheduler
adds one constant-size state object and one clock field, without per-callback
collections. No retained-heap improvement is claimed.

The three runtime files add 2,214 raw bytes, or 697 bytes for gzip of their
concatenation, relative to `960eb28`. This is not a deployed transfer measurement.
Source and `dist` match. The static loader compiles all production sources and
retains four isolated save keys. This repository's documented release is static
`dist`, with no build step. An exported committed-only `dist` snapshot, excluding
all pending user files, passes loader compilation, scheduling, exact viewport
pixels and lifecycle/save/restart stress. See
[committed production results](committed-test-results.json).

Source delivery was assessed afterward. Independent reads already start together
and each module is fetched once. The loader uses `no-store`, and several native
modules lack versioned URLs, so changing cache policy alone risks incompatible
mixtures. Hosting compression/header configuration is absent here; deployed
headers were not assumed. Bundling or a versioned cache contract needs a separate
delivery change. No further supported low-risk optimization was found without
touching the protected loader or changing delivery architecture.

## Regression results and existing failures

23 pure unit suites and 24 selected browser suites pass. Browser coverage includes
native art, scheduling, Pause, keyboard/pickaxe input, Workers, trees, ghosts,
Industry, structures, crafting, extraction, oil, Fey, taint, storm gameplay,
Buttonwood, collision/viewport parity and lifecycle/save/restart stress.
Generated QA/export files were saved in temporary evidence and restored, including
all pending images. [Test results](test-results.json) lists individual checks.

Two pre-existing browser failures reproduce with the previous scheduler:

- `critter-eggs.test.cjs` expects full moon progression using 180/60-second phases;
  current approved constants are 360/120 seconds. The gate assertion fails on
  both variants. [Previous-source failure](baseline-critter-eggs.log).
- `miners-browser.test.cjs` expects an adult to grip a tall wall. Current navigation
  restricts that grip to `isChildV56`; adults retain ladder travel. The climbing
  assertion fails on both variants. [Previous-source failure](baseline-worker-navigation.log).

Those fixtures and gameplay rules were preserved. They need maintenance around
already-approved mechanics, not a scheduler or balance change.

Art review: ART-BIBLE §§3, 5–6, 8, 10, 12; ART-GUIDE native-scale, physics/save and
Pause contracts. Native art/collision parity checks pass; authored sprite cadences
and presentation remain unchanged. No direction or migration coverage changed.

Reproduce with `scheduling.test.cjs`, `scheduling-browser.test.cjs` and optional
`scheduling-benchmark.cjs`. Set `SKY_TEST_URL` to an isolated origin and
`SKY_TEST_BROWSER` to Chromium. `SKY_SCHEDULING_BASELINE_DIR` optionally supplies
the three runtime files with `.baseline` suffixes; `SKY_SCHEDULING_OUTPUT` and
`SKY_SCHEDULING_BENCH_OUTPUT` save results. Previous sources are in `960eb28`.
