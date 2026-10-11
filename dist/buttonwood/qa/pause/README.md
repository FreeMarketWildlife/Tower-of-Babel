# Pause and Options review

Applies ART-BIBLE §§3–4 (native scale/shared palette), §9 (cream surfaces,
readable labels, focus and 44px controls), §10 (truthful motion), and the
Pause and Options amendment. Existing world art remains at shared scale.

[Menu](menu.png), [Options](options.png), [phone Options](phone-options.png).
Escape/Pause freezes the game behind the modal; only menu controls remain active.
Quit saves and returns to the paused title screen; Play resumes.

`tests/pause-browser.test.cjs` checks real frame-loop physics, Worker positions,
production timers, wildlife, eggs, Fey and settlement time remain unchanged
while paused; AudioContext time also stays frozen. Resume excludes paused-time
catch-up. Checks include Escape, Options, Dev Tools/F2, restart cancellation,
persistent sliders, Quit/save/Play, and phone layout/reflow. Existing keyboard,
Buttonwood gameplay and MIDI/biome/night audio checks cover integration.
