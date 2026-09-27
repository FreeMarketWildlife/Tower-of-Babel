# Extraction review — 2026-09-27

These are review fixtures, not free equipment added to ordinary gameplay.
The [connected day/night study](connected-day-night.png) compares the new family
with the approved Worker and Forge at one shared world scale. The
[phone Tank panel](tank-phone.png) is captured from the real game loader, with
fixture inventory and contents. Native UI icons remain 32 px; the Tank portrait
is 96 × 96 px and the Pumpjack portrait is 128 × 96 px.

Art review references: [bible](../../ART-BIBLE.md) §§3–5 (grid, palette, pixels),
§7 (extraction family), §8 (liquids and lighting), §9 (UI and accessibility), and
§10 (motion). Port locations, palette roles, and sprite APIs are recorded in the
[native art guide](../../ART-GUIDE.md). The [gallery](../../index.html) includes
six-pose Pumpjack motion, tank fill/type states, pipe masks, and miniature icons.

Verified in this revision:

- Native canvases use palette colors and binary alpha: 266 combinations checked.
- All 16 pipe masks and 68 connector-edge checks align with the documented ports.
- The six walking-beam poses retain a fixed foundation; the resting pose is stable.
- A Tank's 20-step artwork gauge is distinct from its precise numeric contents.
- World equipment retains the shared camera scale; portraits and icons do not
  inherit the game canvas's full-screen CSS.
- Phone UI keeps the world visible, uses an attached nonmodal panel, and exposes
  Pause, Fill bucket, Add liquid, Drain outlet, and Pack away with accessible names.
- Desktop and touch input tests cover continuous pipe runs, full refunds on
  removal, canceled gestures, and pinch without accidental placement.
- Pumping all three liquids conserves actual solver volume. Full, disconnected,
  paused, dry, mixed, and looped systems retain their contents. Blocked or
  incompatible drain outlets retain stored liquid. Fractional remainders can drain.
- Crafting costs and times, pipe/building occupancy, bedrock protection, exact
  stored fractions, pipe layout, and pause state pass real-loader save/reload tests.

Reproduce with `tests/buttonwood-extraction-art.test.cjs`,
`tests/extraction-network.test.cjs`, `tests/oil.test.cjs`,
`tests/oil-browser.test.cjs`, and `tests/extraction-browser.test.cjs` from the game
root. Browser checks use `SKY_TEST_URL` and an HTTP-served checkout. Set
`EXTRACTION_SCREENSHOT_DIR` for responsive panel captures.

## September 27 follow-up: direct ports and renewable pumping

Per the user's updated rules, touching opposite Pumpjack/Tank faces now connect
without an intervening pipe. The sprite boundaries/ports stay unchanged (bible §7).
Status/help text explains direct connections and renewable pumping (bible §9).
Source pools do not lose volume while pumping; tanks retain finite capacity and
bucket transfers still move real liquid. The original finite-pumping assertions
above record the initial release and are superseded for pump transfers.

`extraction-network.test.cjs` covers exact faces, gaps, orientation, capacity,
mixing, multiple pumps and unlimited shallow sources.
`extraction-integration.test.cjs` executes the production adapter, port calculation,
and save/restore helpers against actual solver cells. Repeated pumping fills each
liquid's Tank while preserving every source cell, survives reload, and stops after
the actual water–lava reaction destroys the source. No new art assets or dimensions.
