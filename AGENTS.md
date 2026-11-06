# Repository guidance

## Project
- Browser-only Flappy Bird simulation that learns through neuroevolution.
- `index.html`: canvas, speed controls, and script loading.
- `game.js`: physics, rendering, scoring, and neural-network integration.
- `Neuroevolution.js`: neural networks, selection, breeding, and mutation.
- `img/`: sprite assets. No backend, package manager, or build step.

## Development
- Keep changes focused and match the surrounding JavaScript style (tabs, `var`, prototype methods).
- Preserve script order: `Neuroevolution.js` before `game.js`.
- Avoid introducing frameworks, dependencies, or build tooling unless requested.
- Keep the neuroevolution library independent of browser rendering and game logic.
- Default game configuration: 50 birds, two inputs, two hidden neurons, one output. Update related documentation when changing behavior or configuration.

## Validation
- Open `index.html` in a browser. Alternatively, serve the repository with `python3 -m http.server 8000` and visit `http://localhost:8000`.
- Run `node tests/pause-resume.test.js` for deterministic regression checks. Also check the browser console, sprite rendering, score updates, generation rollover, and all speed controls, including MAX.
- For learning changes, observe several generations; randomized runs do not produce identical scores.
- Report what was checked and any checks that were not performed.

## Communication
- Keep chat responses concise, include an emoji, and end with `//Next step` followed by the next action.
