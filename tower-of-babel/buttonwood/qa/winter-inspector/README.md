# v80 Hokkaido winter inspection

Reviewed against Buttonwood bible §§3–4 (native scale, named palette), §8
(day/night, wildlife and layered scenery), §9 (native tool icons and minimal
HUD), §10 (half-note entry, immediate exit, calm animation). Native 32px hand
and pickaxe silhouettes retain material tier ramps; no world art resampling.

The Sapporo January 15, 2027 horizon uses 822 catalogue entries brighter than
magnitude 4.5. Only currently above-horizon objects draw; mountains and clouds
occlude inspection. Catalogue coordinates are precessed, then projected from
43.0618°N, 141.3545°E. Planets are frozen at 21:00 JST on the same date.
The 2D panorama is stylized; refraction, proper motion and atmospheric extinction
are omitted. Moon phases still follow the game's eight-night cycle.

`winter-inspection-browser.test.cjs` verifies named visible stars, below-horizon
rejection, Polaris altitude, evening Jupiter/absent Venus, actual rendered star
fact hits, 24× local lens, empty-sky rejection, immediate exit, anchored
Chromium/Safari pinch, and gravity-free Fey hover plus solid-obstacle traversal
for birds, butterflies and fireflies. Ground animals retain gravity.
`inspector-crew-browser.test.cjs` covers existing half-note sound timing, touch
inspection, roster and pause. `background-browser.test.cjs` covers 300 native
full-frame composition cases and real touch pinch/pan/navigation at five DPRs
and viewport sizes. `fey-browser.test.cjs` retains task/conversion/save checks.

Screenshots use isolated fixtures and never replace the player's save.
[Star inspection](star.png) · [Native tool silhouettes](icons.png) ·
[Data and fact sources](SOURCES.md).
