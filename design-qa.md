# Neon orbital visual QA

final result: passed

Scope: validation against the approved Neon orbital brief and existing code target, not pixel-perfect reproduction of a supplied mockup (none supplied). Product Design guidance was used with the user's explicit existing-project/approved-direction instructions. No simulation or evolution changes were authorized.

## Evidence

- [Desktop and keyboard focus](docs/ui-qa/desktop.jpg), approximately 1000 CSS px viewport.
- [320 CSS px layout](docs/ui-qa/mobile-320.jpg), 320 CSS px viewport, no horizontal overflow (document scrollWidth = innerWidth = 320).
- [Extreme geometry](docs/ui-qa/geometry.jpg), deterministic temporary browser fixture using the production display method, source sprites, and 500 × 512 canvas. Gap edges 50/170 and 342/462; bird boxes 40 × 30. Fixture removed after verification.

The in-app browser had existing zoom: viewport control 375 device units produced 320 CSS px. Screenshots are browser-captured JPEGs and visually scaled by the browser; the canvas backing size remains exactly 500 × 512.

## Findings and checks

- Typography: local system monospace, no external font request; readable hierarchy and wrapping at desktop and 320 px. Four labeled DOM counters above canvas; no live region.
- Layout: centered cockpit, two-column narrow-screen statistics, responsive canvas, wrapping speed buttons and footer. Also checked a narrower 273 CSS px layout, where MAX wraps without clipping.
- Color: prescribed navy/slate/cyan/violet/amber palette. WCAG relative-luminance calculations: muted text on panel 8.79:1; primary text on panel 14.07:1; cyan on panel 9.68:1; selected button navy on cyan 12.00:1; hover button text 10.81:1. All text pairs exceed 4.5:1.
- Assets: real ImageGen raster artwork; original runtime names/dimensions retained: bird 34 × 24, background 288 × 512, pipes 40 × 512. Alpha padding trimmed before downsampling. Compact bird fits original 40 × 30 display rectangle; pipe caps and rails stay within 50 px rendered width. Existing rotation and axis-aligned collisions remain unchanged.
- Tiling: no visible hard seam during normal scrolling or deterministic near-wrap offset 287.5. Left/right background channel difference is at most 2/255. Existing backgroundx/backgroundSpeed are the sole movement source.
- Interactions: all x1/x2/x3/x5/MAX buttons activated successfully; Tab, Enter, Space tested; visible amber focus outline and single selected aria-pressed state. Minimum CSS targets 44 × 44 px. Styling includes future #pause-toggle.
- Runtime: observed bird motion, deaths, surviving flock, score reset and generation progression at x1 (generations 1–4) and MAX (over 100 generations). All four images loaded. In-app browser console warnings/errors: none.
- JavaScript: shell `node --check` unavailable because node is not on PATH; both files parsed successfully with Node vm.Script via available Node REPL. `git diff --check` passed. Neuroevolution.js byte-for-byte unchanged from baseline.
- Source review: only game.js speed-button state and DOM HUD references/display writes changed. Physics, inputs, topology, fitness, selection, mutation, pipe placement, dimensions, rendering geometry, update scheduling and requestAnimationFrame loop preserved.

## Limitations

- Pause/Resume integration deferred to the independent feature branch; no pause logic or scheduler changes here.
- No supplied mockup existed for a pixel-perfect side-by-side comparison. Generated raster art and the approved written brief are the visual reference.
- Learning is stochastic; observed progression verifies operation, not convergence guarantees. This repository has no automated test suite.

No outstanding P0/P1/P2 visual findings within the approved scope.
