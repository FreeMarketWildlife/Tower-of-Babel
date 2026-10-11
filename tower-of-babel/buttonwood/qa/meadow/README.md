# Meadow, rarity and depth review

Visual review follows ART-BIBLE §§3–4 (native pixels/palette), §8 (landscape,
wildlife and vegetation), and §9 (separate native 32px inventory art). Reviewed
[surface](surface.png) and [ascent](ascent.png) captures at shared 2× camera zoom.
The actual world moves fully; distant peaks retain depth behind the playable scene.
Flowers sit on soil with readable stems and three quiet petal colors.

An isolated sample profile with 9,009 world bodies measured the following average
milliseconds per call across 120 calls. Static render calls keep the clock and
camera fixed; these are diagnostic timings, not gameplay FPS guarantees.

| Call | Before | After |
|---|---:|---:|
| Sky/background | 0.68 | 0.31 |
| Render | 1.78 | 1.38 |
| Closed moon HUD refresh | 0.37 | 0.002 |
| Structures/wildlife update | 0.105 | 0.029 |

The new deterministic population test found all 31 forms across 300 habitats:
399 animals (1.33/habitat), versus the previous 5–9/habitat. Already saved animals
are not deleted. Repeated unchanged HUD refreshes perform zero canvas encodes or
layout reads. Stationary sky repainting reuses the native canvas between 50ms
clock buckets; moving the camera always repaints.

Regression coverage: flowers mouse/touch tap, drag/cancel/pinch, support removal,
no double collection, inventory/reload, all-species spawn coverage, vertical layer
motion, original ground support/fall, capture/release/cages/save, 700-animal save,
31-species animations/eggs/moon cycle, and Buttonwood production/sample isolation.
