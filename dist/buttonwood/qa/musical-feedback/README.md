# Musical feedback review

Applies ART-BIBLE §§3–4 (native sprites, shared named palette), §6 (fixed
character identity), §9 (cream nonmodal controls, readable labels, 44px targets),
and §10 (truthful death state, sparse renderer fade, no flashes).

Run `?demo=sound`. Creature, Fey and Worker buttons create real disposable actors
and invoke their death paths. Compare Instant, Quarter, Half and Whole note.
The silhouette holds until the next 1, then departs for the selected duration.
Locked stone and Buried earth invoke actual mining checks. Use the pickaxe in the
world to compare successful hits. Day / night compares both musical arrangements.
The save key is `tower.sound.demo.v1`; Restart World affects only this fixture.

Verified: mocked Web Audio onset/end times, simultaneous-event cap, mining
quarter-note debounce, Effects mute and pause; existing nocturne and automation
checks; desktop and phone browser controls with normal-save sentinel unchanged.
