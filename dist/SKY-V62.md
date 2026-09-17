# Sky and nighttime score

The sky follows the existing 180-second day and 60-second night. Sunrise warms
from violet to gold; sunset passes through peach, rose and violet before a blue
night. Layered ridges, distant firs, drifting clouds, a pixel sun and moon, stars
and a faint star-dust band share the world's art-pixel scale and camera zoom.
Scenery is clipped above the ground and never covers buildings or terrain.

Each night has a 1/12 chance of a meteor shower. A saved world seed and day number
produce one independent pseudorandom outcome per night. The shower arrives after
dusk, sends staggered clusters of small blue-white trails across the background,
and fades before dawn. Its outcome and timeline survive reloads. It grants no
resources and changes no Worker or building behavior.

The MIDI-note score blends into a nocturne: soft sustained chords, a new sparse
upper melody, quiet stereo echoes, and fewer bass and arpeggio notes. Daytime
pulses disappear and birds rest at night. The original 72 BPM clock, harmony,
music toggle, and Worker/machine rhythm remain intact. The sky and music blend
follow settlement time, which pauses in hidden tabs.

## Integration

- `game-v62-sky.txt` loads after the settlement modules, before save restoration.
- The additive save field is `workersV55.skyV62.seed`; legacy saves receive a seed.
- `SkyAudio.setNightMix(0…1)` changes the arrangement at each scheduled bar.
- `__skyStackSkyDebug()` exposes the phase, palette, seed and shower outcome.
- `__skyStackAudioDebug()` includes `nightMix`, `arrangementMix`, and `arrangement`.

## Checks

Run `node tower-of-babel/tests/sky.test.cjs`,
`node tower-of-babel/tests/night-audio.test.cjs`, and
`node tower-of-babel/tests/automation-audio.test.cjs`.

They cover continuous palette/music boundaries, nightly probability, save
restoration, stationary time, shower timing and bounded clusters, integer art
coordinates across viewport sizes and zoom levels, underground clipping,
nocturne note density and envelopes, and the shared five-minute audio clock.
The renderer can export draw commands for offline inspection with
`SKY_RENDER_DIR=/tmp/sky-render node tower-of-babel/tests/sky.test.cjs`.
