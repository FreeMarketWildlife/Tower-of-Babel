# Biomes and wildlife

Mountains surround the starting area. The saved sky seed determines broad regions
to either side, with randomized widths, boundaries, and biome order. Every group
of four regions contains mountains, plains, jungle, and ocean in shuffled order.
Regions are roughly 72–120 blocks across; neighboring scenery and musical colors
blend over a 12-block boundary.

Only parallax scenery, wildlife distribution, and music depend on the biome.
Playable ground, trees, ores, liquids, crafting, building support, and Worker rules
are unchanged. The ocean is a distant view behind the playable land.

## Animals and buckets

- Tap an animal to hear its sound. Butterflies, worms, and fireflies use gentle
  stylized flutter or rustle sounds.
- Use an empty bucket on any animal to collect it.
- Use a **Bucket of Bird**, **Bucket of Mole**, or other animal bucket to put its
  inhabitant at the chosen world position. The empty bucket is returned.
- Use an animal bucket on a cage to put the animal inside. Use an empty bucket to
  take an inhabitant out, or open the cage to choose an inhabitant.
- Full cages and blocked placements leave your inventory intact.
- Filled liquid buckets retain their original one-block liquid transfer rules.

Birds, butterflies, worms, moles, rabbits, and fireflies each have their own native
sprites and movement. Worms and moles move through the dirt cutaway without mining
terrain. Natural habitats are remembered, so collecting an animal and revisiting
the area cannot duplicate it. Released animals remain where you put them as they
move about their new home range.

Ground animals released in the air fall onto the actual terrain or placed blocks.
Rabbits drop when their support is excavated; worms and moles settle into dirt and
continue burrowing. Animal movement never mines or adds a block.

Fireflies come out over the plains and in jungles at night. Their small warm
pixel lights brighten the dusk without covering nearby animals or terrain.
Once collected, a firefly you release or keep in a cage stays visible by day too.

## Cages

Craft all three sizes from **Structures**, using wood and iron ingots. A small
cage holds one animal, a medium cage three, and a large cage six. All six species
fit in every cage size. Place cages on a supported foundation, like other
structures. Empty a cage before packing it.

| Cage | Wood | Iron ingots | Capacity | Footprint |
|---|---:|---:|---:|---|
| Small | 5 | 2 | 1 animal | 2 × 2 blocks |
| Medium | 10 | 4 | 3 animals | 3 × 2 blocks |
| Large | 18 | 8 | 6 animals | 4 × 3 blocks |

Cage crafting uses the existing active-play crafting timer. Cages, occupants,
animals in the world, buckets, and unfinished crafting save with your world.
The optional Buttonwood art sample still uses its own separate save slot.

## Implementation and review

`biomes.js` owns deterministic geography; `buttonwood/biomes.js` owns native
parallax scenery. `buttonwood/wildlife.js` owns animal poses, layered cage art,
and separately composed 32px bucket/cage icons. `game-v71-wildlife.txt` connects
animal state and interaction to the existing inventory, crafting, and saves.
`audio.js` blends biome voicing while preserving the shared 72 BPM rhythm and
independent day/night mix. It also supplies the animal sound responses.

Art follows Buttonwood bible sections 3–4 and 7–12, with the approved Worker,
Home, Workshop, connected meadow, and existing bucket family as visual neighbors.
All world art uses one art pixel per world unit; UI miniatures remain 32 × 32.
Native compositing retains fractional-zoom seam protection. The gallery includes
biome previews using its shared Time and Pause controls, all six animal pose
families, three cage sizes, and the new icons.
