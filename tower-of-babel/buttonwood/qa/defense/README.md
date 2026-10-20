# Fortress defense review — October 19, 2026

Implemented the complete proposed equipment family through the production v93 loader. No combat fixtures or free equipment are added to ordinary play. Existing worlds remain peaceful until their player sounds an alarm.

## Visual review

Direction: ART-BIBLE §§3–4 (native pixels and named palette), §5 (honest support and clearance), §6 (species silhouette and grip), §7 (machine identity and separate miniatures), §9 (attached readable controls), §10 (real-state effects and motion), §12 (native/context review), and the v93 fortress section.

Compared the approved Buttonwood concept and existing native building scale before authoring. Machinery uses timber beams, stone footing and restrained metal/cord highlights. The Armory retains the coral/cream/mint family. Machine portraits are native world dimensions; icons are separate 32 × 32 drawings. Equipment tests check binary alpha and shared-palette colors.

- [Native gallery](gallery.png): all eleven new structures, equipment and hostile types at native size. The giant is separately drawn at 48 × 64; no world art is independently enlarged.
- [World battle](battle.png): native machinery and equipped animal silhouettes against ground and flying enemies, in the current nighttime world presentation.
- [Equipment on every Fey form](fey-equipment.png): columns are sword/shield, bow, fire, frost, lightning, healing; rows follow the existing 31-form roster. Review caught shield overlap on small faces; shields were moved outside the silhouettes. Staff heads gained separate flame, ice, lightning and leaf shapes.
- [Desktop orders](orders-desktop.png) and [320px phone](orders-phone.png): attached pane, scrollable content, world retained behind it, native trigger and 44px controls. Browser tests also cover 390px portrait and 844px landscape.

The working native gallery is [combat.html](../../combat.html), linked from the main gallery. Technical/visual review is not a claim of new player art approval; difficulty and visual taste can be refined after play.

## Verification

`defense.test.cjs` verifies ballistic arrival/segment obstruction; all ten weapons;
exclusive equipment and named reservations; finite arrows/bolts; blocked and
wrong-facing shots; saved cooldowns; cargo conservation; repairs; one reload
helper; wards; ordered piercing and armor; splash, fire/slow/healing, extinguishing;
raid phases/reward-once/recovery; Pause; 30/60/120/144 Hz timing; malformed saves.

`defense-browser.test.cjs` runs the real production loader and checks Blacksmith
crafting, equipment checkout, actual crew travel and ballista firing, save/reload,
Pause, capture return, all 31 species × six roles, native pixels, filled-bucket
transactions, exact Tank volume for interrupted deliveries, and desktop/touch UI.

`defense-battle-browser.test.cjs` fires every mounted defense with real Matter
actors and finite building inventory, completes the first real finite-arrow raid
through victory/reward/recovery, exercises actual grounded/climbing/flying bodies,
and reloads active siege projectiles. A bounded stress case uses 120 assigned
defenders and 64 spawned hostiles; on this host, 500ms of simulation took about
85ms in the recorded isolated run. That is a local regression measurement, not
an advertised frame-rate guarantee. Actor/projectile/effect limits remain bounded.

Relevant existing suites cover Fey and Worker tasks, Structures, crafting inventories,
Storehouses, player crafting, hotbar, inventory/nails, oil/extraction, moonfire and
brimstone, inspection, mobile layouts, Buttonwood save/collision invariance,
scheduling and spatial-query performance. Full result manifest is saved alongside
this record after the final run.

## Integration corrections

- Retained the original ordering of settlement buildings ahead of the new defense
  rows, so the expanded Structures catalog does not disrupt existing drag access.
- Kept the existing successful placement return value (`''`) for old integrations.
- Guarded obsolete/duplicate obsidian product restoration when its current creator
  returns no body. Combat mid-battle reload exposed that pre-existing null-body
  path; the normal liquid and saved-world suites verify the surrounding behavior.
- Packing, capture, failed supply routes, sleeping support Workers, and demolished
  Armories preserve the equipment/cargo ledger. Ordinary environmental death and
  blood/ghost rules are unchanged.

## Scope and practical limits

Enemies and effects have explicit caps (64 hostiles, 160 projectiles, 160 effects).
Raids time out after three active minutes; no offline damage or unattended waves.
A defense still needs a reachable post, fixed support, an unobstructed firing/drop
lane, crew and supplies. Arbitrary player-built mazes can require ladders or a
changed position. Automated Chromium checks are not physical iPhone/Android QA.
