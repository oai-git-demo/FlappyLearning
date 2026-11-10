# Orbital Flight Lab — design QA

final result: passed

Date: 2026-11-10
Issue: FLAP-16
Baseline: 11c67fd69701476e0be879e8cee9e9005090f7e1

## Approved target

The user-approved Orbital Flight Lab direction: midnight navy, pale text, cyan instruments, amber robotic birds, modular station bulkheads and a seamless starfield. This existing browser-only project was updated directly; no framework, build step or conceptual reselection was introduced.

## Visual and interaction checks

- Inspected the live application in the Codex in-app browser at desktop and narrow sizes (reported CSS viewport widths 1422, 400 and 320). No horizontal overflow; controls wrap at the smallest width; canvas retains its 500 × 512 logical resolution and scales only through CSS.
- Checked generated sprites, readable four-column telemetry, restrained scenery, modular pipe caps and 120px gap. Bird artwork stays within its original 40 × 30 axis-aligned collision footprint; removed visual rotation rather than changing collisions.
- Clicked x1, x2, x3, x5 and MAX. Each updates its selected/aria-pressed state; Tab exposes the amber focus outline. Native button styling also applies to a future pause control.
- Observed autonomous training and generation turnover (generation 19 reached during testing). No required score threshold: evolution remains stochastic.
- Browser console: no warnings or errors. All four game image assets loaded and rendered.
- Final desktop capture: `img/orbital-flight-lab-preview.jpg`.

## Regression checks

- Bundled Node syntax checks passed for game.js and Neuroevolution.js; git diff --check passed.
- Used a seeded Node VM harness with scheduler callbacks stubbed to compare 3,000 manual updates per speed (60, 120, 180, 300 and 0 FPS) against the baseline: all 15,000 updates matched exactly, including birds, pipes, networks, scores, background distance and generation state. Each run reached generation 13.
- Repeated display calls with fixed simulation state left simulation unchanged and emitted identical drawing operations. Parallax derives exclusively from backgroundx; no wall-clock animation, render-owned counters or per-bird glow.
- Byte comparison verified all game.js code outside Game.display and all of Neuroevolution.js are unchanged.
- Collision boundary checks retained the existing inclusive contact behavior, 40 × 30 bird and 50px pipe width. Spawn code and 120px gap are untouched.
- Pillow checks verified equal pixels across both background tile joins, 40 × 30 bird image dimensions and fully opaque 50px-wide bulkhead assets.

## Limits

This file records feature-branch QA. Combined Pause/Resume verification is recorded in `combined-qa.md`. Telemetry remains canvas text (as in the baseline); it is described to assistive technology but is not a live screen-reader feed. QA did not assert a specific learning outcome or test other browser engines.
