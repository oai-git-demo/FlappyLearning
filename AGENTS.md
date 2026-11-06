# Repository guidance

## Project layout
- This is a static browser demo that learns to play Flappy Bird using neuroevolution; no package manager or build step is configured.
- `index.html` contains the canvas and speed controls. Load `Neuroevolution.js` before `game.js`.
- `game.js` handles simulation, rendering, image loading, and integration with the learning algorithm.
- `Neuroevolution.js` implements neural networks and genetic evolution. `img/` contains game assets.
- `README.md` documents the learning API; keep it aligned with API or option changes.

## Running and verification
- From the repository root, run `python3 -m http.server 8000`, then open `http://localhost:8000`.
- No automated test suite or lint configuration is present. For behavior changes, check that assets load, birds and pipes render, generations advance, and every speed control works without browser console errors.
- Learning is randomized; do not rely on an exact score or generation count for verification.
- Report which checks were actually performed and any checks that could not be run.

## Change conventions
- Match the surrounding plain JavaScript, tab indentation, and existing function/prototype style. Keep changes focused; avoid unrelated formatting or new tooling.
- Preserve browser globals used by inline controls and the script loading order.
- Preserve asset paths and filename casing, especially `Neuroevolution.js`.
- Keep the existing `License` file and attribution intact.

## Responses
- Add a `//comment` after each response stating the next step.
