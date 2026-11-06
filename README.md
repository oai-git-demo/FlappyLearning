# Flappy Learning ([Demo](http://xviniette.github.io/FlappyLearning/))

Program that learns to play Flappy Bird by machine learning ([Neuroevolution](http://www.scholarpedia.org/article/Neuroevolution))

![alt tag](https://github.com/xviniette/FlappyLearning/blob/gh-pages/img/flappy.png?raw=true)

### [NeuroEvolution.js](http://github.com/xviniette/FlappyLearning/blob/gh-pages/Neuroevolution.js) : Utilization
```javascript
// Initialize
var ne = new Neuroevolution({options});

//Default options values
var options = {
    network:[1, [1], 1],    // Perceptron structure
    population:50,          // Population by generation
    elitism:0.2,            // Best networks kepts unchanged for the next generation (rate)
    randomBehaviour:0.2,    // New random networks for the next generation (rate)
    mutationRate:0.1,       // Mutation rate on the weights of synapses
    mutationRange:0.5,      // Interval of the mutation changes on the synapse weight
    historic:0,             // Latest generations saved
    lowHistoric:false,      // Only save score (not the network)
    scoreSort:-1,           // Sort order (-1 = desc, 1 = asc)
    nbChild:1               // number of child by breeding
}

//Update options at any time
ne.set({options});

// Generate first or next generation
var generation = ne.nextGeneration();

//When an network is over -> save this score
ne.networkScore(generation[x], <score = 0>);
```

You can see the NeuroEvolution integration in Flappy Bird in [Game.js](http://github.com/xviniette/FlappyLearning/blob/gh-pages/game.js).


### Local verification

Run `node tests/regression.cjs` (no packages required) for deterministic pause/resume, speed, callback, learning and collision regression checks.

Serve the repository with `python3 -m http.server 8000` and open `http://localhost:8000/tests/browser.html`. The browser harness checks the combined assets, controls, five-second state/render freezes at x1 and MAX, same-state resume and generation progression. It reports PASS or FAIL; it does not replace manual checks of the game page.

On `http://localhost:8000`, use Tab to reach Pause/Resume, check the visible focus outline, and toggle it with Enter and Space. Inspect the scene and HUD, try every speed, and check the browser console. Cross-browser and long-duration performance checks remain manual.
