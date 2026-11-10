# Repository guidance

## Project and layout
- FlappyLearning is a static browser demo that learns Flappy Bird through genetic evolution of neural-network weights. All simulation and training run in the browser; there is no backend or build step.
- `index.html`: canvas, speed controls, and script loading. Load `Neuroevolution.js` before `game.js`.
- `game.js`: physics, collisions, rendering, scoring, and training integration. The game uses 50 networks with a 2 → 2 → 1 architecture; fitness is survival in simulation ticks.
- `Neuroevolution.js`: feedforward networks, scoring, selection, crossover, and mutation. Its generic defaults differ from the game's configuration.
- `img/`: bundled sprites. `README.md`: usage and library options.

## Run and validate
- Open `index.html` directly in a browser, or run `python3 -m http.server 8000` from this directory and visit `http://localhost:8000`.
- No dependency installation is required. Open `tests/pause-resume.html` through the same server for browser regression checks. There is no configured linter.
- For behavior changes, check the browser console, sprite rendering, score updates, generation turnover after all birds die, and speed controls including MAX. Learning is stochastic; do not require a particular score.
- If Node.js is available, run `node --check game.js` and `node --check Neuroevolution.js` for syntax checks. These do not verify browser behavior.
- State which checks were performed and any checks that could not run.

## Change conventions
- Keep changes focused and match surrounding JavaScript style (tabs, `var`, and prototype methods). Preserve standalone browser execution; avoid adding frameworks, dependencies, or build tooling without a task requirement.
- Keep simulation updates separate from rendering. Document intentional changes to network inputs, fitness, or evolution settings.
- Preserve asset paths and filename casing. Do not edit unrelated files or replace bundled assets unnecessarily.

## Communication
- Keep chat responses concise, include an emoji, and end with `//next step` followed by the next action.
