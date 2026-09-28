# Scenic biomes and wildlife review · September 27, 2026

Applied art bible sections **3–4, 7–12**: native pixel grammar and palette,
object silhouettes, quiet landscape depth, attached UI, purposeful motion,
original inhabitants, and review in context. Compared with the approved concept,
native Home/Workshop/Worker art, connected meadow, and existing bucket icons.

The [day/night landscape sheet](biomes-day-night.png) shows mountain ridges,
rolling plains, jungle crowns, and ocean islands beside the actual Home and
Worker. All four remain subordinate to the playable plane. Region layers move
at different speeds, blend at borders, and follow the saved day/night palette.
There are no terrain, tree, resource, or liquid changes tied to these regions.

The [plains at night](plains-fireflies-night.png) and [same view by day](plains-fireflies-day.png)
use a fresh isolated ordinary-game world, seed `2735492645`, natural plains region
`[-7720, -4853]`, and camera `(-6575.125, -65)` at `1.55×`. Only settlement time
changes between views; terrain and animal state match. Four natural fireflies are
visible at night, with none visible by day. No review animal or terrain fixtures
were inserted for these two captures.

The [native animal and cage sheet](native-animals-cages.png) shows all six species,
their four poses, native portraits/buckets, and three cage sizes. Moles and worms
read against rich soil; birds and butterflies have distinct silhouettes. Firefly
light uses a small gold/cream body cluster. The large cage has a timber shelf at
the upper-row occupant anchor. All icons are separately authored 32px canvases.

The cage review includes desktop, 320/390/430px portrait, and 844px landscape.
Controls remain attached to Structures; portraits keep native dimensions, icons
remain 32px, and long occupant lists scroll. Phone rows wrap into readable 44px
buttons. Escape and Close return focus to Structures. These are automated browser
and screenshot checks, not physical-device testing.

New suites:

- `biomes.test.cjs`: seeded geography, large regions, mountain spawn, border
  continuity, native integer drawing, atmosphere and clipping.
- `biomes-browser.test.cjs`: actual loader, parallax, saved seed, render purity,
  four day/twilight/night views, responsive native gallery.
- `buttonwood-wildlife-art.test.cjs`: 76 native canvases, palette and alpha,
  mirrored anchors, poses, independent miniatures, and layered cages.
- `biome-audio.test.cjs`: gradual biome mix, varied arrangements, unchanged
  72 BPM and night mix, bounded animal cues, and SFX mute.
- `wildlife-browser.test.cjs`: all-species mouse/touch sound and bucket roundtrips,
  exact cage costs/capacity, full-cage rejection, saved occupants and crafting,
  finite habitats, nocturnal plains fireflies, large-save retention, responsive
  cage controls, keyboard focus, and drag/cancel/pinch safety.
- `wildlife-ground-browser.test.cjs`: gravity after release, actual terrain and
  placed-block support, excavation, unchanged terrain/flyers, and saved positions.

Existing regression suites passed: background (300 complete frames across zoom,
DPR, lighting, phone/desktop and underground), Hotbar, Structures, Player crafting,
Crafting inventory, Buttonwood, Mobile UI, Disclosures, Extraction, liquids,
connected terrain, sky, Worker rhythm, extraction network/integration, and
night/automation audio. The audio review verifies oscillator scheduling and
browser execution; it does not claim a human listening session.

The optional review sample retains its separate save and fixtures. Wildlife uses
an additive field under the ordinary structure save; captured animals cannot
regenerate by revisiting a recorded habitat. Natural generation's population cap
never truncates saved animals or prevents release of a filled bucket.
