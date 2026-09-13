# Art direction

- Use pixel-art assets for all icons; do not introduce emoji or font-symbol icons.
- Author UI icons and miniature building illustrations on a 32 × 32 pixel canvas
  and display them at native size. Draw miniature versions rather than shrinking
  world sprites. Use the existing game palette and crisp nearest-neighbor rendering.
- World sprites use one art pixel per world unit; camera zoom applies uniformly.
  Preserve that shared scale. Do not independently stretch art or use fractional
  scaling for UI assets. Building portraits use their native sprite dimensions.
- Inventory/category panels should open adjacent to their toolbar trigger rather
  than as centered modal windows. Keep the world visible and usable.
- Keep UI text as short as possible. Prefer pixel-art icons and numbers over
  words where they communicate clearly; retain accessible labels and tooltips.

# Game terminology

- Use “Worker” and “Workers” in all player-facing UI, help, documentation, and
  new code comments. “Miner” is a legacy internal identifier retained only for
  save compatibility, stable DOM hooks, and existing integration tests.
- Use “Home” for the residential building and “bed” for its two adult slots.
  Each Home also has one baby slot and one kid slot.
- Use “building inventory” for resources stored inside one building. Use
  “primary” and “secondary” for its ordered automatic crafting recipes.
- Use “ladder” for the placeable mine-exit item. One Workshop batch costs five
  wood and makes ten ladders; a Worker buys a batch for one pocketed gold.
