# Inventory and nail item review — v78

Applies Buttonwood art bible §§3–4 (shared scale, native 32px equipment, palette),
§9 (attached inventories, icon grammar, short text and 44px controls), §10 (contact
animation and truthful audio), and the v78 inventory amendment. Compared against
`reference/buttonwood-approved.png`, native gallery and `qa/v68-native-items.png`.

[Creative desktop](creative-desktop.png), [390px](creative-390.png),
[320px](creative-320.png), [landscape](creative-844.png),
[normal owned items](normal-owned.png), [grid nail contact](nail-cell.png), [live simulation pin](live-pin.png),
[native equipment strip](native-equipment.png).
Native gallery’s Tower & Bells section includes the replacement nail bundle,
ladder, search/grid and ore/metal equipment miniatures.

The shared categories and stable item grid follow the organizing principle of
Minecraft’s Creative inventory, using Buttonwood’s palette, miniatures and item
families. Normal play hides zero stock. Creative shows all entries with unlimited
quantities and keeps real supplies separate from saved virtual access. The
searchable panel remains beside its hotbar slot; the world stays usable. UI art
has native 32px source/display pixels, binary alpha and named palette colors.

A nail tap pins the existing physical body at its closest cell center. One pin
per square, including different cells of one larger body; no new block or changed
collision envelope is created. Duplicate, empty and invalid taps spend nothing.
Four hammer contact poses and a small bright strike accompany the quarter-note
sound. The pin stays until the body is removed or loses its anchored support.

`tests/inventory-nails-browser.test.cjs` exercises normal/Creative search and
ownership, all catalog entries, persistent mode/normal balances, building/ladder
and bucket usage, native dimensions/colors, viewport bounds, mouse/touch pinning,
duplicates, dragging/cancellation, pause queues, save/reload and pin removal.
Web Audio debug events verify timing against the live score beat and Effects mute.
The wider toolbar/keyboard/mobile/pause, crafting, Fey and Buttonwood integration
checks cover the unchanged interaction and save contracts. Screenshots freeze the
frame scheduler and explicitly render test fixtures; ordinary gameplay remains
separate from the isolated Buttonwood sample.

Live smoke check: a real canvas tap pinned the block at (4, −1), spent one of
two nails, and played one hammer cue while physics advanced; no runtime errors.
