# Liquid extraction

Build a Pumpjack, drill an intake pipe into a liquid pocket, and connect its
outlet to a Tank directly or through a separate pipe. The same equipment pumps **oil, water, or lava** without reducing the source pool.
The machines use Buttonwood's timber, coral, cream, mint, and copper pixel art.

## Playing

1. Open **Structures**. Craft a Pumpjack and a Tank, then drag each onto a fully
   supported foundation. Put the Tank directly against the Pumpjack’s right side
   for a pipe-free outlet connection, or leave room for a pipe run.
2. In **Liquids**, craft pipes: one iron ingot makes four segments. Choose **Lay**.
3. Start directly below the Pumpjack's intake (the second column from its left).
   Drag down into a pocket. Pipes drill through soil and stone without removing
   supporting blocks. The tip must reach actual liquid; extend it toward the
   bottom so changes in the liquid surface do not uncover it. Pumping itself
   does not lower the surface. Bedrock cannot be drilled.
4. The Pumpjack's right outlet connects directly to a touching Tank inlet at the
   same height. A gap or height difference still needs pipes. For spaced equipment,
   start at the right outlet, one row above the base, and run a separate line to
   either side of the Tank at the same port height. Adjacent pipes join automatically.
   Keep the intake and outlet lines apart.
5. The beam moves while liquid transfers. Open the machine to see its status;
   open a Tank to see the liquid and exact stored quantity. A full Tank stops the
   pump. Add a second Tank to a branch to gain more capacity.

A drag draws a vertical run followed by a horizontal run; preview it before
releasing. **Remove** reclaims pipes one for one. **Done**, Escape, or another tool
leaves pipe mode. Dragging and tapping work on phone and desktop. Shift still
provides temporary camera movement on desktop.

Pumpjacks need no fuel or Worker. They move at most one block of liquid per second
while the game is active. Every wet intake provides unlimited pumping: the actual
source remains untouched, even while multiple tanks fill. A dry intake still stops
the pump; water destroyed by lava is not regenerated. Each Tank holds 32 blocks of one liquid. Tanks never mix
liquids: incompatible sources or tanks stop transfer, with an explanatory status.
Tanks are endpoints, not pass-through bridges between separate networks.

Buckets still move real liquid: scooping from a pool reduces it and pouring adds
liquid to the world. An empty bucket takes one block from a Tank. A filled bucket adds one block if
its type matches and space is available. **Drain outlet** releases up to one
block into the world at the Tank's right port, including any final fraction.
Blocked outlets retain their contents. Empty a Tank before packing it away.
Pipes and pumpjacks contain no stored volume, so removing them loses no liquid.

## Costs and scale

| Equipment | Player cost | Player craft time | Native world art | Function |
| --- | --- | --- | --- | --- |
| Pumpjack | 15 wood, 8 stone, 5 iron ingots | 3 seconds | 128 × 96 px / 4 × 3 blocks | Up to 1 liquid block/second |
| Tank | 8 wood, 4 stone, 6 iron ingots | 2 seconds | 96 × 96 px / 3 × 3 blocks | 32 liquid blocks |
| 4 pipes | 1 iron ingot | Immediate | 32 × 32 px each | Cardinal connection; sealed bore |

A liquid block is four full 16 × 16 solver cells. All miniature icons are separately
authored at 32 × 32 and displayed at native size. Building portraits use native
world sprite dimensions. The tank gauge has 20 visible art levels; simulation and
numeric contents retain their full precision.

## Geology and compatibility

Oil appears in finite underground pockets around rows 24–32. Generation is
repeatable from the terrain hash. It checks a whole pocket and a surrounding ring
before opening a cavity: player excavation, damage, placed blocks, Workers,
buildings, and existing liquid take precedence. An old explored world gains oil
only in untouched eligible natural rock. Checked regions and accepted deposits
are saved, so scooping or rejecting a pocket does not cause future replenishment. Infinite
pumping is a read-only source rule, not a system that refills or respawns pools.

Oil uses the existing liquid solver and flows more slowly than water. It can be
scooped, poured, displaced, and pumped. Oil immersion affects a Worker's air in the
same way as water; oil is non-burning in this release. Only water and lava produce
obsidian. Oil is stored as a liquid, not a mineable inventory ore. Refining, oil
sales, fuel consumption, pressure upgrades, and pipe costs by depth are future
features, not active mechanics.

Existing building collision masks, terrain support rules, resources, and save
keys remain in use. The ordinary save is `skyStack.save.v1`; the optional art sample
continues to use `tower.buttonwood.sample.v1`. Extraction grants no free equipment
in ordinary gameplay. Autosave callbacks resolve the current save function so
later liquid and extraction state is included.

## Implementation and review

- `extraction-network.js` is a pure, deterministic topology and transfer layer.
  It requires explicit intake and outlet cells, queries terminal cells, bounds
  production by rate/storage in renewable mode (legacy finite mode also bounds
  source volume), matches opposite touching port faces, and returns tank updates after each call.
- `game-v69-oil.txt` handles deposit migration, oil bucket registration, and exposure.
  Oil has save type code 2; existing water/lava codes 0/1 retain their meanings.
- `game-v70-extraction.txt` integrates crafting, pipes, tanks, UI, non-depleting source sampling,
  conservative outlet draining, and saves under `structuresV46.extraction`.
- `buttonwood/extraction.js` owns cached native artwork. Art review follows
  [the bible](buttonwood/ART-BIBLE.md) §§3–5 and §§7–10, the extraction-family rules,
  and [native implementation contracts](buttonwood/ART-GUIDE.md).
- The pure network tests, oil migration/solver tests, and real-browser extraction
  tests exercise unchanged source pools, bounded storage, direct joins, disconnections, branches, loops, pause/full/mixed
  states, buckets, recovery, crafting, placement, and persistence.

## Research and deliberate adaptations

[Gamious's Turmoil](https://gamious.com/portfolio/turmoil/) and its
[publisher's gameplay description](https://store.steampowered.com/app/361280/Turmoil/)
inform the core sequence of an above-ground rig, a drilled pipe network, an
underground oil pocket, and surface storage. We use that clear side-view relationship
without importing its oil-price economy, horses, upgrades, or art.

[Factorio's fluid system](https://wiki.factorio.com/Fluid_system),
[storage tanks](https://wiki.factorio.com/Storage_tank), and
[pumpjacks](https://wiki.factorio.com/Pumpjack) inform connected plumbing, legible
capacity, and stopping when storage cannot accept liquid. Our pipeline deliberately
requires real liquid at an intake but does not consume it while pumping. It uses
one type per connected transfer, tanks as sinks, and a
fixed rate. It does not claim to reproduce Factorio's pressure or resource-yield
model. All-liquid extraction is this game's explicit design choice.
