# Defending the tower — v93

Open the shield beside the Worker roster for Defense. Raids are opt-in: existing worlds remain peaceful until **Sound the alarm**. A crafted Armory is required. Each alarm gives 12 active seconds to take positions, followed by one attack. Pause and hidden tabs stop combat with the settlement clock.

## Prepare

1. Craft an Armory and defenses in Structures; drag finished buildings onto fixed terrain or nailed foundations. Keep routes to both ends clear. Trebuchets need stone, deepslate or obsidian foundations and clear arm space. Droppers need an open edge below the cauldron.
2. At a Blacksmith, craft weapons, ammunition, staffs, seed pods and sticky sap. Manual recipes spend your inventory; automatic primary/secondary recipes spend building inventory. Finished items stay in building inventory until taken.
3. STORE equipment in an Armory. One sword plus one shield equips one swordfighter; one bow or staff equips one ranged defender. Reservations protect equipment assigned to another Fey before collection. Stock is deducted only at physical collection. Assignments never duplicate gear.
4. In Defense, choose any Fey and its equipment. Choose a guard position or a mounted weapon. **Set guard position** takes a single world tap; dragging/pinching cancels that pick. Mark **Reload helper** for a station's second crew member.
5. Leave **Respond to alarm** checked for a helper to continue normal work until danger. Uncheck it for a permanent post. Assign Workers or Fey to Supply or Repair for support work.

Each mounted defense needs an equipped Fey operator who can actually reach either end of its platform. One reload helper adds 35% reload progress; extra helpers do not stack. A missing route produces a route/ladder status. Build ladders and access paths rather than expecting teleportation through the tower.

## Weapons

| Weapon | Role | Cost per shot | Reload | Base reach |
| --- | --- | --- | --- | --- |
| Ballista | Large/armored targets; pierces up to three enemies | 1 bolt | 4.2 s | 640 units; 40 minimum |
| Catapult | Arcing splash against groups | 1 stone | 5.5 s | 650; 150 minimum |
| Trebuchet | Distant siege engines and giants | 3 stone | 10 s | 1,200; 300 minimum |
| Oil dropper | Burns attackers below an exposed edge | 1 oil load | 6.5 s | 250 downward |
| Rock chute | Cheap downward impacts and climber defense | 1 stone | 4 s | 320 downward |
| Repeating crossbow | Rapid swarm/flyer defense; poor against armor | 1 bolt | 0.65 s | 440; 20 minimum |
| Hanging ram | Close impact and knockback | None | 3.5 s | 100 |
| Bramble launcher | Temporary slowing tangles | 1 seed pod | 4.5 s | 450; 80 minimum |
| Storm crystal | Lightning jumps to up to four distinct targets | 30 charge | 3 s | 380 |
| Ward lantern | Protects nearby defenders and tower blocks | 40 charge | 6 s | 180 protection radius |

Reach uses world units; one terrain block is 32 units. Elevated shots gain up to 0.4 units of reach per unit of drop. World geometry obstructs shots and the full predicted siege arc. Turning a weapon changes its firing side. Target preferences are Auto, Nearest, Large / armored, Groups and Flyers. Placement/selection guides show forward reach, minimum range and access ends; placement notices report clearance failures.

Magic devices hold at most 100 charge and recover four charge per second. Ward protection lasts 6.5 seconds per activation, reduces ordinary combat damage by 60%, and intercepts storm impacts inside its radius. Nails retain their separate one-hit protection. Wards need a present operator even between raids.

## Fey equipment

Every one of the 31 existing Fey animal forms can use every role. Existing sprites and anchors remain intact; equipment sits beside their silhouettes at the shared world-pixel scale.

| Equipment | Behavior |
| --- | --- |
| Sword + shield | Intercepts threats near its post; shield reduces incoming combat damage |
| Bow | Uses real arrows; carries at most twelve before returning to its source Armory |
| Fire staff | Damage and a short burn |
| Frost staff | Lower damage and a slowing effect |
| Lightning staff | Chains between up to three distinct nearby enemies |
| Healing staff | Heals wounded assigned allies, capped at their maximum health |

Staffs hold 100 charge, recover six per second, and spend twenty per cast. Charges and cooldowns persist across reload. A Fey defeated in combat rests for twelve active seconds, recovers, and returns borrowed gear. Combat recovery produces no fairy blood and changes no existing environmental death/ghost rules. Capture or explicit Release immediately returns borrowed equipment and cargo; caged/bucketed Fey do not continue fighting.

## Supply and repair

Put arrows, bolts, stone, seed pods or sap in building inventory, or load a weapon directly through its inventory controls. Supply helpers physically collect up to twelve units and carry them to a station with low stock. They cannot issue the same stored supply twice. Source/destination removal and cancellation preserve carried goods.

One full oil or water bucket becomes four cauldron loads and returns one empty bucket. Supply helpers can also draw those measured quarter-block loads from a Tank, reducing its actual volume. They can carry the loads to a cauldron; an interrupted delivery restores Tank volume when compatible space remains, otherwise its conserved loads return to your inventory. A cauldron can select hot oil, sticky sap or water. Sap slows enemies; water targets and extinguishes the temporary fires created by combat oil impacts. This is distinct from the existing storm explosions.

Repair helpers collect one matching block material per repair, restoring up to two block durability points. Building repairs cost one wood and restore four of the building's twenty damage points. Destroyed buildings require replacement; their saved stock and reserved crafting inputs are recovered. Helpers need real access and materials. Packing an Armory or a weapon retains the existing inventory/refund behavior; borrowed goods return to player inventory if their source no longer exists.

## Attacks and recovery

The first attack contains ground raiders. Wave two adds climbers and flyers; wave three adds armor; wave four adds giants and siege engines. Waves grow to at most 36 spawned enemies. Raiders cannot pass through solid terrain; climbers seek high exposed targets; flyers obey world collision and stay airborne. Large siege engines launch saved ballistic shots from a minimum distance.

Defenders automatically select appropriate targets. Uninvolved wild animals are not combat targets. A completed defense awards five Bells per wave number exactly once. Losing the Armory or reaching the three-minute battle limit ends the attack as a retreat without that award. Remaining enemy bodies and shots are cleaned up. Recovery releases normal alarm defenders to their previous tasks after equipment return, while permanent guards remain on duty. Supply and Repair helpers finish available work and resume their previous tasks. A blocked return does not prevent the next alarm indefinitely.

There are no automatic follow-up waves or offline battles. Sound the next alarm when ready. Damage, equipment ownership, reservations, cargo, posts, enemy health, projectiles, charge and reloads save with the existing world. The normal world, Buttonwood art sample, moonfire demo and sound playground retain separate save keys and no free combat fixtures are added to ordinary play.

## Implementation and checks

- `defense-core.js`: shared definitions, combat rules, ballistic collision, ownership, logistics, raid phases and bounded save data; also directly testable in Node.
- `game-v93-defense.txt`: Matter/settlement adapters, saved state, attached controls, native render passes and guarded world gestures.
- `buttonwood/defense-art.js`: native machinery, separate 32px miniatures, equipment and enemies. [Fortress gallery](buttonwood/combat.html).
- `tests/defense.test.cjs`, `tests/defense-browser.test.cjs`, `tests/defense-battle-browser.test.cjs`: rule tests, production inventory/UI/persistence and actual firing/raid/physics/stress checks.

See the [visual and verification record](buttonwood/qa/defense/README.md) and [implementation checklist](../TOWER-DEFENSE-TODO.md). These browser checks cover automated Chromium on this host; they are not physical-device certification or a guarantee that every possible player-built maze is reachable.
