# v79 lens, jingle Bells and helper roster

Reviewed against the approved Buttonwood reference and native equipment gallery.
Bible §§3–4: named palette, independent 32px UI assets at native size, 12px world
pickup, nearest-neighbor lens. §6: broad cream hat, mint band, warm face and clear
eyes. §9: icon-and-number main HUD, attached nonmodal roster, 44px controls, readable
semantic text. §10: calm stepped entry, chord-aware half-note chime, reduced motion.

`inspector-crew-browser.test.cjs` checks corner ordering at desktop, 390px, 320px
and landscape widths; Worker/resting/young/Fey roster, retained Worker/Fey controls,
selection switches, moving camera follow, navigation lock, release on close and
removal, and independent wild-animal panels. Lens checks confirm no camera zoom
or mining/interaction side effects, short descriptions for animals, Workers,
buildings, flowers, eggs, ghosts, pipes, ladders and water, half-note gating and
actual Web Audio cue times, half-second dismissal and pause/mute behavior.

Screenshots use an isolated deterministic fixture, not the player's save. The
lens capture shows a Worker magnified at 2×, not a rescaled world model. The roster
captures use ordinary controls and no changed collision envelopes. The half-second
exit delay is the current interpretation of the user's “more than a 1/2”; new
popups unequivocally use musical half notes (about 1.67 seconds at 72 BPM).
