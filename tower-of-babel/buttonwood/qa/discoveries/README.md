# First-discovery review

ART-BIBLE §§3–4: integer 4px mask cells, 2px firework clusters, named shared
palette, native canvas dimensions. §9: existing attached cream bubble, semantic
name/fact, short “New discovery,” viewport clamping and screen-reader unknown
state until reveal completes. §10: one local reward per discovered kind; no
screen flash, blur, shake or routine-hover confetti. The v90 bible entry explicitly
authorizes the tiny discovery fireworks. Existing native lens and sprite family
remain unchanged from the approved concept/gallery.

At the first half-note entry show ???. At entry +2 quarter beats start revealing;
at +4 complete and reward. The sound is scheduled ahead on the audio clock and
cancelled if the target is left. Chord, register and sine/triangle timbre vary;
three filtered crackles stay quieter than the notes. Four deterministic variants
avoid random pitch clashes. Pausing or disabling inspection cancels unfinished
reveals; Effects mute never prevents saving the discovery.

Checks:
- `node tower-of-babel/tests/discoveries-audio.test.cjs`
- `node tower-of-babel/tests/discoveries-browser.test.cjs` with Playwright available.
- Browser coverage: initial empty catalogue; all three half-note stages; type
  deduplication; cancellation; save/restore; reduced motion; phone clamping.
- Existing night, biome, automation and inspector regressions remain applicable.

Evidence: reveal.png, discovered.png, phone.png. The deterministic browser test
uses a fixed target/clock to inspect each stage, while audio tests inspect exact
scheduled oscillator times, chord variants, guards and bus cancellation.
