# Exposure-depth darkness · September 27, 2026

User-requested lighting change, reviewed against the approved concept and native
connected meadow. Applies art bible §§3–5 (pixel scale, named palette, truthful
terrain), §8 (shared world/animal light), §10 (state-driven effects), and §12 (review).

Exposed faces retain their native presentation. The first unexposed layer receives
a 28% wash; each further cardinal layer darkens until the 96% cap at layer ten.
The shared `buriedShade #0b0709` retains a warm near-black floor, and the remaining
4% of the original scene keeps faint detail. No layer becomes fully black.
Hidden cavities inherit this field until discovery; raw missing/unloaded cells
do not create light. Excavation updates the field on the next render.

The final native-pixel world pass includes terrain, ore and wildlife together,
after day/night tint. Tool and pipe placement guides remain above it. Saves,
terrain exposure/mining rules, liquids and animal behavior remain unchanged.

Visual evidence:

- [Desktop surface and ten layers](terrain-fog-1100.png)
- [Phone surface and animals](terrain-fog-390.png)
- [Excavated shaft and side tunnel](terrain-fog-shaft-1100.png)
- [Phone excavation view](terrain-fog-shaft-390.png)
- [Native gallery comparison](gallery-1100.png)
- [320px gallery, horizontal scroll without shrinking art](gallery-320.png)

The gallery repeats identical native stone, ore and mole art at all eleven
exposure levels so the lighting difference can be inspected directly. Its
animation respects the existing Pause and reduced-motion settings.

Checks passed:

- `terrain-fog.test.cjs`: all ten opacity levels, cardinal distances, negative
  coordinates, nearest openings and fully enclosed regions.
- `terrain-fog-browser.test.cjs`: real exposed/unexposed terrain, immediate
  excavation and side/ceiling light, hidden/revealed pockets, diagonal rules,
  same-count occupancy changes, obsidian refilling, unchanged placed-block
  semantics, actual ore/animal attenuation, true night tint, render purity,
  readable pipe guides and desktop/phone fractional-zoom seams.
- `buttonwood-terrain.test.cjs` and `buttonwood-sky.test.cjs`: preserved native
  terrain joins, world-state purity and day/night continuity.
- `buttonwood-browser.test.cjs`: ordinary/sample saves, native assets,
  collision envelopes, mining/placement roundtrips and live simulation. The
  smoke check rendered 71 frames in 1,206 ms.
- `background-browser.test.cjs`: 300 full-frame checks across desktop/phone,
  pixel densities and lighting phases, plus pinch, pan, navigation and resize.
- `extraction-browser.test.cjs` and `wildlife-browser.test.cjs`: existing
  extraction, animal/cage, mouse/touch and persistence behavior.
- Gallery inspection at 1100px and 320px: eleven native 32px canvases,
  keyboard-focusable scrolling, no page overflow and reduced-motion rendering.

The exposure field stays bounded to the view plus its ten-layer reach. A warm
1100px-wide, 0.72×-zoom check used 2,520 cells; preparation averaged 0.62 ms
(95th percentile 0.80 ms), reusing the field when the exposure mask was unchanged.
These are local measurements, not a performance guarantee for other hardware.

Validation uses isolated browser contexts on macOS with Chrome, including touch
viewport emulation. This is not a claim of physical phone testing.
