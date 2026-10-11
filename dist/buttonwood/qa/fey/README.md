# Fairy Workers and Fey review

Visual review: ART-BIBLE §§3–4 (native pixels/palette), §6 (Worker identity/anchors),
§8 (real liquid geometry/shared lighting), §9 (32px inventory art), §10 (quiet
meaningful effects), and the October 10 Fey direction amendment.

[Gameplay/task panel](tasks.png) shows a winged Worker, unchanged wild/Fey animal
models, tainted water, a Home, and the adjacent task panel. [Defeat pose strip](defeat-poses.png)
is native 160 × 64, four Stab contact poses above four Slice contact poses. These
are stylized, non-graphic effects; sprites stay intact and fade. Blood consists of
small coral pixels; on dry ground it disappears after three seconds.

Validated with `tests/fey-browser.test.cjs`:

- Fairy wing pixels and original 40 × 32 canvas.
- Both player knife choices release gold once, make no ghost, and taint water.
- Drowning, lava and impact deaths make their normal ghosts and never taint water.
- Dry-ground blood creates no liquid; tainted-water contact converts animals.
- Tainted buckets conserve the full block, pour successfully and persist liquid kind.
- Fey survive save/reload and animal bucket transfers with their held gold/tasks.
- Collect transfers ghost/animal gold while leaving living Worker gold unchanged.
- Mine strikes once per three eligible Worker beats, without a pickaxe model; all found gold stays on the animal.
- Older animal Workers migrate to wild animals with their gold; ordinary Workers retain their identities.
- Work progresses actual Workshop production with building inventory.
- Tallest supported tower selection, widening before height, nails and dynamic blocks.
- Storehouse resupply reserves 100 nails and prefers stocked obsidian.
- With no nails, five Workshop wood makes ten actual ladders in five seconds.
- Base travel moves animals through real Matter physics; all 31 forms convert/reload.
- MIDI sparkle notes use the score and obey music mute.

`tests/tainted-water.test.cjs` verifies flow, conservation and identical results at
30/60/144Hz. Expanded all-liquid save tests include type 3. Existing wildlife,
flowers, production/sample, eggs, ground-support, ordinary liquid and oil regressions
cover preserved systems. Egg tests now expect wild hatchlings rather than Workers.

Supplies are finite: Tower waits when it cannot find materials or a clear supported
route. It never draws fake supports, creates free nails, or teleports to a job.
