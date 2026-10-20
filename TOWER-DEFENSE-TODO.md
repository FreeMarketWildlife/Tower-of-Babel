# Tower defense implementation checklist

Approved scope: all tower weapons, Fey equipment roles, armory logistics, placement rules, enemies, and the defense loop proposed in this chat.

Audit date: October 19, 2026. Source baseline: `98b60ee` on `main`.
This file records implementation work; unchecked items are not shipped features.

Current status: all gameplay passes implemented and tested. Public release is being verified.

## Original audit before implementation

This is a source audit of the production loader and its active modules, not a combat playtest. `tower-of-babel/index.html` loads `game-v28.js`, which assembles modules through v92. The older `game.js` is not the production entry point. `dist/` is the hosting directory and must be synchronized for releases.

| System | Current state | Evidence and remaining work |
| --- | --- | --- |
| Building construction | Existing foundation | `game-v46-structures.txt`, `game-v61-player-crafting.txt`: costs, timed crafting, supported placement, packing and saved jobs. No Armory or mounted weapons registered. |
| Building inventory and automatic crafting | Existing foundation | `game-v56-settlement.txt`, `game-v60-storehouses.txt`: real stock, transfers, primary/secondary recipes and employee presence. Equipment, ammunition and combat reservations need integration. |
| Fey helpers | Existing foundation | `game-v75-fey.txt`: Base, Mine, Collect, Work and Tower; animal bodies, travel, carried supplies and saved state. No Defend task, combat equipment, posts or alarm response. |
| Fey travel | Partial reuse | Existing terrain/ladder travel and flying helpers can be extended. Defensive perches, intercepts, occupied stations and unreachable posts need new behavior. |
| Tower support and damage | Partial reuse | Existing support checks, nails, material durability and storm fracture in v46/v77/v78/v83. No general combat damage service, repair job, weapon weight rule or protective ward. |
| Projectile collision | Partial reuse | `game-v81-moonfire.txt`, `game-v83-brimstone.txt`: falling storm projectiles, ray checks and blast effects. No friendly targeting, ballistic launch solution, pierce or combat projectiles. |
| Oil and water supply | Existing foundation | `game-v69-oil.txt`, `game-v70-extraction.txt`, `extraction-network.js`: renewable pumping, finite tanks and volume-conserving buckets. No weapon loading, hot oil, sap or firefighting. |
| Armory and portable weapons | Missing | No active Armory definition, sword/shield/bow/staff items, checkout ledger or equipment reservations found. The fairy merchant's wand is not a combat staff system. |
| All ten mounted defenses | Missing | No ballista, catapult, trebuchet, oil dropper, rock chute, repeating crossbow, hanging ram, bramble launcher, storm crystal or ward lantern implementation found. |
| Hostile enemies and battles | Missing | No hostile roster, enemy targeting, raid director, climber attacks, siege engines or battle outcome loop found. The destructive moon storm is an environmental event. |
| Combat art, UI, audio and tests | Missing as a family | Existing Buttonwood assets, attached panels, inspection, score-aware sounds and browser suites provide patterns. No combat-specific production family or regression suite found. |
| Save/pause/performance integration | Existing foundation | Add combat to the existing validated saves and scheduling; do not run a second independent simulation clock. Equipment must survive bucket/cage transitions too. |

Baseline verification: `node tower-of-babel/tests/loader.test.cjs` passed on the audit date. It checks production compilation, module prefetch and four isolated save keys. No combat behavior is verified by that check.

Existing local inspector screenshots and untracked level-reward QA folders were present before this audit. Preserve them and keep them out of unrelated commits.

## Working agreement and completion rules

- Work directly on `main`; preserve local work; use focused commits and relevant integration checks before pushing.
- Complete tasks in dependency order. Mark a checkbox only after implementation and its acceptance checks pass; record evidence below.
- Keep the player's job centered on building, equipping, assigning and supplying. Critters select targets and fight automatically.
- Any Fey species can use sword, bow or magic. Species must not lock a critter out of a combat role.
- Reuse existing animal silhouettes, anchors, world scale, collision envelopes, economy and save compatibility.
- Read the Buttonwood art bible and relevant asset sections before creating visuals. Use §§3–4 for pixel scale/palette, §5 for placement, §6 for combat acting, §7 for weapons/buildings, §9 for attached accessible controls, §10 for effects and §12 for visual review. Consult the native art guide and approved gallery.
- Author separate 32 × 32 UI icons at native size, use the named palette, and keep world pixels at one world unit. No emoji/font-symbol icons.
- Add combat coverage to the art bible, native guide and migration inventory as it is actually implemented. The current bible explicitly identifies combat as future gameplay.
- Preserve normal-world, Buttonwood sample, moonfire demo and sound-demo save isolation. Review fixtures and free supplies stay isolated.
- Use Worker, Home, bed, building inventory, primary/secondary recipes and Bells consistently. Preserve legacy save keys and stable hooks.
- Costs, cooldowns, enemy appearances and progression thresholds below are implementation tuning choices, not established lore. Start with existing resources wherever possible and record chosen values.

## Pass 1 — first independently playable battle

Goal: a player can craft and place an Armory and ballista, equip Fey with sword, bow or a basic damage staff, assign defenders, and complete a ground attack with finite supplies. This is the first bounded implementation attempt; later passes remain part of the approved scope.

- [x] **1.1 Combat foundation.** Create a cohesive combat module with stable actor IDs, factions, health, attack timing, bounded spatial target queries and a shared damage API. Integrate with the existing simulation scheduler, Pause, hidden-tab behavior and cleanup. Avoid another chain of unrelated overrides where a small explicit integration point will work.
- [x] **1.2 Persistence.** Add validated, versioned combat state with safe defaults for old saves. Save equipment ownership, health, orders, posts, ammunition and active battle state. Reload must not duplicate equipment, reset attack cooldowns for free shots or restart a raid for rewards.
- [x] **1.3 Combat outcomes.** Implement enemy damage and defeat, Fey damage and defeat/recovery, and tower damage. Keep existing environmental death, ghost and tainted-water contracts intact; document the chosen combat recovery rule. Uninvolved wild animals are not automatic enemy targets.
- [x] **1.4 Equipment crafting.** Add sword, shield, bow, arrows, basic damage staff and ballista bolts to real crafting, inventory, labels and unlocks. Manual crafting uses player inventory; automatic crafting uses building inventory. Keep inputs/outputs conserved across interrupted jobs and packing.
- [x] **1.5 Armory.** Add a craftable, placeable Armory with building inventory, equipment checkout/return and a reservation ledger. One physical weapon equips one critter; a sword-and-shield loadout reserves both. Shared stock cannot be double-issued. Provide manual assignment and automatic available-equipment assignment.
- [x] **1.6 Fey roles.** Make every Fey species eligible for sword/shield, bow and basic offensive magic. Add melee interception, ranged attack distance, visible weapon use and sensible automatic targets. A staff must have a defined, finite charge/recovery rule rather than unlimited accidental firing.
- [x] **1.7 Orders and posts.** Add Defend, assignable posts and an optional respond-to-alarm setting. Save the interrupted task and building assignment; collect equipment, reach the post, fight, return borrowed gear and resume work. Handle missing Armories, unreachable posts, task changes and death/capture without duplicating or losing stock.
- [x] **1.8 Ballista.** Craft/place/orient it on a supported platform; reserve one Fey operator; load finite bolts; aim and fire a giant piercing bolt with a slow reload. Require a clear firing lane, maximum range and physically correct obstruction tests. Prefer large/armored threats when those enemies become available.
- [x] **1.9 Ground attackers.** Add a small hostile ground group with collision-aware movement, approach and attack behavior. Enemies threaten reachable defenders and the tower; they do not walk through solid terrain or attack through walls.
- [x] **1.10 First battle loop.** Add a readable warning, equipment collection, deployment, attack, victory/defeat and return-to-work state machine. Start the first raid through a player-controlled readiness action while tuning; do not unexpectedly attack old saves on first load. Define outcome and reward rules explicitly.
- [x] **1.11 First art/UI/audio.** Native Armory, ballista, portable equipment, enemy and attack art; separate miniatures; concise attached controls, tooltips and accessible labels. Add readable attack/reload/hurt cues using existing audio buses and score conventions. Review in ordinary gameplay and the native gallery.
- [x] **1.12 First acceptance gate.** Test actual craft/place/equip/fight/return behavior in the production browser loader, finite supplies, ownership contention, blocked shots, save/reload during each phase, pause/hidden-tab behavior, desktop/touch controls and old-save migration. Capture and inspect screenshots; verify the active URL/version. Commit the working slice with evidence.

## Pass 2 — the original medieval defense set

Depends on Pass 1's combat, inventory, projectile and assignment contracts.

- [x] **2.1 Climbers.** Enemies climb exposed tower faces, transition between supported surfaces and attack nearby defenders/blocks. Re-evaluate routes when structures fall or paths disappear.
- [x] **2.2 Flyers.** Add aerial approaches and ranged target tracking without terrain penetration or off-screen simulation exploits. Bow users and suitable turrets can prioritize them.
- [x] **2.3 Catapult.** Craftable medium platform weapon; finite stones; arcing splash attack against groups; minimum range and poor tracking of fast targets. Validate the full arc against world geometry, not just the endpoints.
- [x] **2.4 Hot oil dropper.** Craftable overhang cauldron; real oil loading, preparation/recovery and downward attack area. Damage enemies below and climbers; define burn duration and stacking. Leave clear short-range limits.
- [x] **2.5 Placement previews.** Show facing, firing sector, range, minimum range, obstructions, crew access and invalid support/overhang. Permit valid ledge placements without weakening existing building support rules globally.
- [x] **2.6 First complete mixed battle.** Ground attackers, climbers and flyers versus sword/bow/magic Fey, ballista, catapult and oil dropper. Verify each defense has useful targets and a weakness.
- [x] **2.7 Acceptance.** Add behavioral tests, ordinary-gameplay visual evidence and regression coverage for oil/buckets/extraction, support, path changes and allied collision. Commit and update this checklist.

## Pass 3 — heavy siege and physical defenses

- [x] **3.1 Trebuchet.** Long-range arcing heavy shot; slow reload; minimum range; large platform and arm-swing clearance. Introduce an explicit supported-platform/load requirement without changing old building footprints or physics behind the player's back.
- [x] **3.2 Enemy siege engines.** Distant attackers threaten the tower, giving trebuchets a meaningful counter-target. Targetable crews/engines need clear state and destruction cleanup.
- [x] **3.3 Giants and armor.** Add large and armored enemy variants. Define armor/piercing once in the damage model; make ballistas and heavy siege useful without making bows irrelevant.
- [x] **3.4 Rock chute.** Low-cost downward stone load; explicit ammunition/reload; strong versus climbers, with no long-range reach.
- [x] **3.5 Repeating crossbow.** Rapid finite-bolt fire; useful against swarms/flyers; weak against armor; accurate reload and supply use.
- [x] **3.6 Hanging ram.** Suspended log, clear swing envelope, close-range impact and knockback. Check swept collisions and avoid applying damage every frame to the same enemy during one swing.
- [x] **3.7 Acceptance.** Test arc/swing clearance, minimum range, heavy support, obstruction, armor/pierce and mixed waves. Add native sprites/miniatures, gallery entries, sound and reviewed screenshots for each weapon. Commit with evidence.

## Pass 4 — Fey magic and alternative cauldron loads

- [x] **4.1 Staff specializations.** Add fire damage, frost slowing, chain lightning and allied healing. Any Fey can equip any staff. Define charge, regeneration/resupply, cooldowns, effect duration and stacking for each.
- [x] **4.2 Bramble launcher.** Finite seed-pod ammunition; temporary slowing tangles; bounded growth, expiration and cleanup. Control effect does little direct damage and does not become permanent terrain/save clutter.
- [x] **4.3 Storm crystal.** Magical charge, recovery and chain lightning; strong against clustered flyers. Bound chain count/range and prevent repeat hits on one target within a chain.
- [x] **4.4 Ward lantern.** Temporary protection for nearby allies and tower blocks. Define strength, radius, duration, recharge and overlap; integrate before damage/fracture so it actually protects structures. Keep nail shielding consistent.
- [x] **4.5 Sticky sap cauldron.** Add a real sap supply/recipe and selectable slowing load. Distinct from oil; no hidden conversion of oil or water to sap.
- [x] **4.6 Water cauldron and fires.** Add explicit extinguishable fire state, water loading and firefighting targeting. Preserve liquid volume and existing moonfire behavior unless an intentional extension is documented and tested; do not assume storm explosions already implement persistent fire.
- [x] **4.7 Acceptance.** Test healing limits, status expiry/stacking, charge conservation, ward damage order, fire/water interactions, save/reload and bounded effects. Add native art/audio, gallery coverage and visual review. Commit with evidence.

## Pass 5 — crew, supply and fortress management

- [x] **5.1 Crew reservations.** One operator is required per mounted weapon; one optional helper improves reload speed. Each critter has at most one active assignment. Crew must reach the station; absence stops operation and helpers cannot grant unlimited reload multipliers.
- [x] **5.2 Ammunition deliveries.** Workers/Fey carry real ammunition from available building inventory to weapons, respecting route access and capacity. Expose waiting-for-ammo/crew/path states. Avoid teleporting goods or reserving stock forever when a route fails.
- [x] **5.3 Repairs.** Add material-consuming repair jobs for damaged tower blocks and defensive equipment; define repair versus replacement and safely invalidate physics/support caches. Handle destroyed stations, interrupted work and inaccessible damage.
- [x] **5.4 Recovery and restocking.** After a battle, repair, replenish weapon magazines and return borrowed gear before resuming normal tasks. Handle shortages without trapping the entire settlement in defense mode.
- [x] **5.5 Equipment preferences.** Reserve favorite equipment for named critters; allow unreserved stock to be assigned automatically. Priorities remain understandable and cannot issue the same item twice.
- [x] **5.6 Target overrides.** Provide simple per-weapon targeting overrides alongside defaults: large/armored targets, groups, flyers or nearest threat. Handle targets dying/leaving range without wasting a full decision loop.
- [x] **5.7 Height and coverage.** Make elevation affect actual projectile reach/visibility; low defenses protect the base, middle floors cover approaches and upper platforms cover sky/distance. Test both facing directions and arbitrary terrain/tower shapes, including multiple disconnected towers.
- [x] **5.8 Management UI.** Attached Armory, turret and defender controls with native icons/counts, short status labels, keyboard focus and touch cancellation. Keep the world visible and usable at 320px portrait and landscape widths.
- [x] **5.9 Acceptance.** Stress crew contention, moving/destroyed supplies, dead/captured defenders, packing Armories/stations, work restoration and long battles. Verify conservation across every storage and ownership location. Commit with reviewed evidence.

## Pass 6 — full integration and release

- [x] **6.1 Progression and balance.** Set recipes, unlock order, ammunition batches, reloads, charge costs, damage and raid pacing in shared definitions. Start with affordable defenses and introduce enemy counters gradually. Preserve peaceful preparation and make attack timing legible.
- [x] **6.2 Battle persistence.** Verify mid-flight projectiles, mid-reload weapons, carried ammunition, checked-out equipment, active status effects and damaged structures across reload, restart and all isolated save modes. Validate malformed/stale IDs and bounded arrays.
- [x] **6.3 Performance.** Bound enemy/defender decisions, projectile/effect counts and route rebuilding. Test off-screen combat, camera movement and 30/60/120/144 Hz scheduling parity with simultaneous settlement, extraction and storm activity.
- [x] **6.4 Production behavior suites.** Add combat math and conservation tests plus browser scenarios for every weapon, each role, target priorities, obstruction, friendly targeting rules, support and the entire defense/recovery loop. Real gameplay must work without test-only commands.
- [x] **6.5 Relevant regression checks.** Run loader, scheduling, Fey, Workers, structures, player crafting, crafting inventory, storehouses, hotbar, inventory/nails, extraction/oil, brimstone/moonfire, inspection, mobile UI, Buttonwood and performance checks appropriate to changed code. Investigate failures before claiming integration is complete.
- [x] **6.6 Visual/audio review.** Inspect actual desktop/phone battles, individual equipment poses for every Fey species, native gallery and reduced-motion/mute behavior. Keep silhouettes readable; record exact art-bible sections and evidence in the combat QA notes.
- [x] **6.7 Documentation.** Update README, tests guide, art bible, native art guide and migration inventory to describe what actually ships. Include controls, supply rules and save behavior.
- [ ] **6.8 Release.** Synchronize runtime source/assets into `dist/`, verify parity, commit only intended files and reconcile remote `main` before pushing. Use the existing Sites publishing workflow for a hosting release. Verify the public URL/version and ordinary no-sign-in gameplay before calling it live.

## Autonomous execution assessment

I expect to be able to implement the full scope independently, in successive tested passes, including native code-authored pixel art, gameplay, save migration, browser tests and release preparation. No external paid service or separate manager is inherently required. This is a capability assessment, not a guarantee that all mechanics will pass testing on the first attempt.

Pass 1 is the bounded single-run target: one real ground battle, all three portable combat roles, an Armory and a ballista. Pass 2 completes the initial three-turret/three-enemy battle. Attempting all ten weapons, all magic, logistics and balancing in one unreviewed change would make completion hard to verify; the remaining passes are still approved work, not optional scope reductions.

The largest uncertainties are physical combat on arbitrary player-built towers, reachability of posts, conservation through existing animal/bucket/cage transitions, heavy siege support and final balance/art preference. Investigate and resolve technical issues autonomously; report genuine design conflicts with concrete examples rather than repeatedly requesting routine approvals. Final subjective art and difficulty preferences may still benefit from the player's review.

Eutychus can optionally use this file to track progress and review evidence. No message, handoff, recurring automation or manager setup has been authorized by the mention alone, and none is needed to begin implementation. This checklist does not schedule future work; execution occurs during active work sessions.

## Progress and evidence log

| Date | Work | Verification | Commit |
| --- | --- | --- | --- |
| 2026-10-19 | Audited production modules and created the complete implementation checklist. Gameplay implementation has not started. | Existing loader compilation/prefetch/save-isolation check passed. | See Git history for this file. |

| 2026-10-19 | Implemented all ten weapons, Armory/equipment, all Fey roles, enemy roster, raid loop, logistics, repair, magic, native art and attached controls. | 23 relevant rule/browser/regression suites passed; see `tower-of-babel/buttonwood/qa/defense/results.json`. | See implementation commit in Git history. |
