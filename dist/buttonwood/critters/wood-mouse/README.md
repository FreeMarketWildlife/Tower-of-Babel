# Wood mouse Worker — native animation study

[Open the interactive preview](index.html). Click the large mouse for a one-shot
Pet response. Six action cards loop independently, with pause, integer inspection
zoom, facing direction, and individual frame scrubbing. Reduced motion starts
paused. This review page has no save access and does not replace game Workers.

The user selected **no clothing** for the critter cast. No hat, overalls, boots,
or other clothing is painted on the mouse. Hand-authored source pixels in
[sprites.js](sprites.js) interpret the original clothing-free concept; the
concept image was not downsampled. Palette comes from `../../palette.js`.

## Pixel and motion contracts

- Every source frame is **40 × 32**, with ground anchor **(18, 31)**.
- Head and ears occupy roughly the upper 15 pixels; compact torso occupies ten.
  Pink inner ears, a pointed cream muzzle, cream belly, bare pink paws, and a
  thin curling tail distinguish the mouse. No new colors are required.
- Walk uses short alternating steps and a maximum 1px body rise. Sprint has
  longer strides, faster cadence, and a head carried 2px farther forward.
- Mine redraws both hands and the pickaxe together through anticipation,
  overhead lift, downstroke, contact (frame 4), and recovery. Use alternates
  empty paws in a small assembly gesture; the optional bench is preview scenery.
- Yay holds the source inside its budget. `jumpOffset` provides integer world
  displacement outside the source canvas, avoiding clipped ears and paws.
- Pet turns toward the camera at frame 2, holds relaxed closed eyes during
  frames 4–7, and returns to idle after one cycle. No human hand is baked in.

| State | Frames | Per frame | Cycle |
|---|---:|---:|---:|
| Idle | 4 | 280ms | 1120ms |
| Walk | 8 | 110ms | 880ms |
| Sprint | 8 | 70ms | 560ms |
| Mine | 8 | 110ms | 880ms |
| Use | 8 | 130ms | 1040ms |
| Yay | 10 | 100ms | 1000ms |
| Pet | 10 | 150ms | 1500ms |

These are the critter study's timings, separate from the existing human Worker
scheduler. Future gameplay integration must align Mine contact with the actual
mining event, apply real locomotion speeds, and trigger Pet on the critter hit
area without interfering with tools. The remaining 24 species are still pending.

## Exports and review

`exports/` contains native transparent PNG frames and horizontal strips, timing
metadata, 4× looping GIF previews, and a six-action animated overview. Native
sprites stay at their authored size; GIF enlargement is inspection only.

Applied art bible sections **1 (identity)**, **3 (pixel grammar / scale)**,
**4 (palette)**, **6 (Workers)**, **9 (UI)** and **10 (motion)**, plus the critter
transition and clothing decision. Compared against the approved Buttonwood
reference, native Worker sprite, and no-overalls 25-critter concept. The new
critter silhouette replaces human clothing cues with ears, muzzle, belly and tail.
Visual review covered enlarged key poses, native frames, Pet eye contact,
left/right motion, tool bounds, and a 390px viewport. This remains a review study
awaiting the user's animation feedback, rather than approval of all critter art.

Check/export command (local server on port 8766):

```sh
node tower-of-babel/tests/wood-mouse-art.test.cjs
```

The suite verifies 56 source frames, binary alpha, palette membership, exact
mirroring around the shared anchor, distinct motion poses, frame wrapping,
click-to-Pet completion, and mobile layout. It exports the native PNG artwork.
