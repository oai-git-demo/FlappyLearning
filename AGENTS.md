# Repository guide

## Overview
- Browser-only Flappy Bird simulation that evolves neural-network controllers.
- Plain JavaScript and HTML5 Canvas; no backend, build step, or package dependencies.
- `index.html`: canvas, speed controls, and script loading order.
- `game.js`: physics, rendering, scoring, and training integration.
- `Neuroevolution.js`: feedforward networks, fitness ranking, crossover, and mutation.
- `img/`: game sprites; `README.md`: usage and algorithm options.

## Run locally
From the repository root, run `python3 -m http.server 8000` and open
`http://localhost:8000`. Training starts automatically; refreshing resets it.

## Editing conventions
- Keep changes focused and match the existing tab-indented, plain JavaScript style.
- Preserve browser compatibility and script order: `Neuroevolution.js` before `game.js`.
- Avoid introducing dependencies or a build system unless the task requires them.
- The game uses 50 networks with a 2 → 2 → 1 topology. Inputs are normalized bird
  height and the next gap's upper edge; output above 0.5 triggers a flap.
- Fitness is survival ticks. Keep game-specific settings in `game.js` and reusable
  evolution logic in `Neuroevolution.js`.

## Validation
- No automated test suite or lint configuration is provided.
- For code changes, serve the app and check the browser console, sprite loading,
  bird movement, collisions, generation transitions, and speed controls.
- For learning changes, observe several generations; results are stochastic.
- If Node.js is available, run `node --check game.js` and
  `node --check Neuroevolution.js` for syntax checks.
- Report which checks ran and any validation that could not be performed.
