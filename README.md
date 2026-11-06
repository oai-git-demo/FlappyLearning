# Flappy Learning ([Demo](http://xviniette.github.io/FlappyLearning/))

Program that learns to play Flappy Bird by machine learning ([Neuroevolution](http://www.scholarpedia.org/article/Neuroevolution))

![alt tag](https://github.com/xviniette/FlappyLearning/blob/gh-pages/img/flappy.png?raw=true)

### Orbital Flight presentation

Open `index.html` directly, or serve this directory with `python3 -m http.server 8000`.
The responsive cockpit scales the 500 × 512 canvas without changing simulation coordinates.
Score, maximum score, generation, and surviving pilots appear above the play area;
use x1, x2, x3, x5, or MAX to select the simulation speed.

`art.js` prepares local canvas sprites once at startup: gold mechanical pilots,
station towers, and a repeating orbital city background. No remote assets or fonts
are needed. The original PNGs remain in `img/`. Background motion follows the
simulation's `backgroundx`; artwork uses no random numbers or independent animation.
The simulation still uses 50 birds and a 2 → 2 → 1 neural network.

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
