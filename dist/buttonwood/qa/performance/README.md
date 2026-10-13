# v87 performance review

Reviewed against ART-BIBLE §§3–5 and §10: no palette, sprite, pixel scale,
collision envelope or animation cadence changes. Native rendering with the
optimization enabled/disabled has the same pixel hash. Saves stay compatible.

CPU profiling used headless Chrome on the local development Mac, 1280×900,
7-second samples, normal play and the survival storm beginning about 9.5s after
Resume. These are local measurements, not a guarantee for every device.

| Sample | Baseline idle sampled time | Optimized idle sampled time | Frame rate |
| --- | --- | --- | --- |
| Normal world, ~7,541 bodies | 3.82s / 7s | 5.07s / 7s | ~60 fps both |
| Storm, ~7,800 bodies | 2.31s / 7s | 4.16s / 7s | ~59–60 fps both |

Nearby-region benchmark: 1,500 queries took about 56ms with the original linear
scan, versus 3ms indexed. Indexed queries examined 19 candidates out of ~7,543
world bodies. Benchmarks vary with load; the regression asserts candidate bounds,
not a fragile elapsed-time threshold.

Persistent static and frame-refreshed moving spatial buckets preserve original
query ordering and exact Matter bounds checks. Geometry, membership and static
state changes invalidate caches. Broad/invalid bounds and outside queries retain
safe original scans. Large bodies use an oversized list instead of huge bucket
walks. Collision filtering preserves exact narrow-phase pairs, retaining Matter's
original sweep-and-prune for dense (>48 awake bodies) or invalid-bound scenes.
Fixed-block construction records finite dynamic mass before anchoring; release
repairs missing finite material properties in older fixed-body saves. This avoids
invalid debris positions without changing shield damage or collider shapes.
No distant block is removed from the world, save, liquid grid or simulation.

Terrain joins iterate placed blocks; off-screen bodies are rejected before the
legacy drawing chain. Burial exposure recomputes when the viewport, world or
revealed pockets change, rather than scanning unchanged seeds every frame.
Tower anchor tests, Worker nearby scans and blast candidates use indexed lookups.
An already-static block isn't fixed a second time, preserving finite original
mass so multiple cell nails can release healthy moving debris.

The loader starts independent module downloads together and memoizes them, then
evaluates in the existing dependency order. It still fetches fresh source and
keeps ordinary, art-sample and survival-demo saves isolated. Moonfire and the
whole-hit nail shield run in normal gameplay; the demo is only a seeded fixture.

`performance-browser.test.cjs` checks query identity/order, removals and stale
lists, transforms/static toggles, wide/outside queries, collision-pair parity
with Workers and live storm debris, repeated nail/static transitions, unchanged
native pixels and actual storm simulation with finite debris positions/mass. Existing gameplay suites cover
mining, inventory/nails, liquids, Fey tasks, heights, eggs/wildlife, inspection,
extraction, rendering/fog, saves and pause.
