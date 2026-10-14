# Loose placement and inspection hints — v91

Visual review uses ART-BIBLE §§3–4 (native 32px canvases and named palette), §5
(placement truth), §9 (icon grammar, 44px controls and accessible states), and §10
(brief purposeful motion). Compared with the approved Buttonwood concept and the
native HUD family in the gallery. Grid uses warm cream/mint cells and a loose
wood block for off; selection has an inset marker as well as color. A cream,
outlined arrow points toward the existing magnifier for 2.4 seconds after a wild
animal tap. Reduced motion holds the arrow still. No visible instructional text.

Grid stays absent and disabled below earned height 25. Unlock does not switch it
on. Old global grid preferences do not opt a world in; explicit choices use a
world-save-specific v91 preference. The height-25 size increase is replaced with
grid placement; later size milestones remain and use the revised sizes.

Placement wakes all dynamic placed blocks. A polygon-contact walk propagates a
bounded downward/lateral velocity and angular push through the connected loose
pile. Distant blocks receive no injected momentum; terrain, nailed bodies and
buildings retain their anchors. Restores and non-player construction do not
receive placement pushes. Natural-world/building overlap guards remain active.

Browser regression: `tests/loose-building-browser.test.cjs`. Covers overlap without
confirmation, sleep/wake, propagated velocity, pile displacement, finite motion,
anchors and distant bodies, off-grid coordinates, height-24/25 gating, toggle,
wild tap hint and Fey menu, native palette/alpha, and 320/390/430/844/1100px HUD.

Validation: the placement suite passed against both source and `dist/`; the v87
performance suite passed exact collision-pair parity and real hailstorm checks.
The full inspector/Worker/Fey browser regression also passed.
Reviewed captured 320px HUD at native icon size: grid and arrow remain clear,
inside the viewport and beside their intended controls.
