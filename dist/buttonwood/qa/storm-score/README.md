# v89 storm percussion and ice hail

Reviewed under ART-BIBLE §§3–5, 8 and 10, against the approved native material
family and existing meteor artwork. Ice hail is a separately drawn 16px crystal
with water/cream palette ramps, a cool stepped trail and eight contact shards.
No expanding blast mask, warm fire or splash damage is painted for ice. The world
pixel scale, camera, native HUD and collision envelopes remain unchanged.
[Mixed storm](mixed-storm.png) records the real survival fixture.

Fire launch impulses and caps are 1.2 times their previous linear values. Existing
core/rim damage, local fracture, whole-hit nail protection and angular impulse
remain intact. Every third existing storm launch is ice; total projectile/launch
budgets remain 24/200. Ice damages one contacted cell for one point, strips a
shield first, and delivers a bounded physical impulse without AoE.

`storm-audio.js` is isolated from death/error voices. One small transport bridge
in audio.js supplies the real MIDI clock, score chord and Effects bus. Whooshes
begin on a sixteenth note, crescendo over two sixteenths, and feed a chord-root
bass drop and metallic crash; ice ends in a short tuned percussive contact.
Physics holds a contacted projectile until the scheduled boundary. Audio is
scheduled ahead of that boundary rather than fired late from a rendering callback.
If a whoosh is still rising, its ending boundary becomes the earliest impact.
Muted/uninitialized play uses the same 72 BPM active-play grid without audio.

Camera-relative distance attenuates both whoosh and contact, with stereo pan and
far-source suppression. At most eight incoming voices, one fire crash and two ice
contacts per sixteenth slot can sound; old nodes disconnect, and histories cap at
64 entries. Effects/master volume, pause and hidden-tab suppression apply. These
are scored synthesized percussion: deterministic noise carriers supply air/crash
texture, while all cue onsets, phrase ends and tonal notes follow the score.

Pending projectiles serialize without body references; kind and bounded wait
survive save/restore. The audio cue is re-armed on the new transport after reload.
The demo's Resume click initializes audio within its trusted user gesture.

`storm-score-browser.test.cjs` checks exact 1.2 velocity, ice shield/one-cell wear
and no explosion, two-fire/one-ice mixing, attenuation, deferred boundary damage,
pause, saved pending state, real mixed storm, whoosh/crash grid alignment and mute.
Performance, native Moonfire, nail and musical-feedback regressions cover their
shared integration. Death sounds, error sounds and death animation rules belong
to the independent v88 feedback work; this change leaves those hooks in place.
