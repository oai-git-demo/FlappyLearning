(function() {
	var timeouts = [];
	var messageName = "zero-timeout-message";

	function setZeroTimeout(fn) {
		timeouts.push(fn);
		window.postMessage(messageName, "*");
	}

	function handleMessage(event) {
		if (event.source == window && event.data == messageName) {
			event.stopPropagation();
			if (timeouts.length > 0) {
				var fn = timeouts.shift();
				fn();
			}
		}
	}

	window.addEventListener("message", handleMessage, true);

	window.setZeroTimeout = setZeroTimeout;
})();

var Neuvol;
var game;
var FPS = 60;
var maxScore=0;

var images = {};

var speed = function(fps){
	FPS = parseInt(fps);
}

var loadImages = function(sources, callback){
	var nb = 0;
	var loaded = 0;
	var imgs = {};
	for(var i in sources){
		nb++;
		imgs[i] = new Image();
		imgs[i].src = sources[i];
		imgs[i].onload = function(){
			loaded++;
			if(loaded == nb){
				callback(imgs);
			}
		}
	}
}

var Bird = function(json){
	this.x = 80;
	this.y = 250;
	this.width = 40;
	this.height = 30;

	this.alive = true;
	this.gravity = 0;
	this.velocity = 0.3;
	this.jump = -6;

	this.init(json);
}

Bird.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Bird.prototype.flap = function(){
	this.gravity = this.jump;
}

Bird.prototype.update = function(){
	this.gravity += this.velocity;
	this.y += this.gravity;
}

Bird.prototype.isDead = function(height, pipes){
	if(this.y >= height || this.y + this.height <= 0){
		return true;
	}
	for(var i in pipes){
		if(!(
			this.x > pipes[i].x + pipes[i].width ||
			this.x + this.width < pipes[i].x || 
			this.y > pipes[i].y + pipes[i].height ||
			this.y + this.height < pipes[i].y
			)){
			return true;
	}
}
}

var Pipe = function(json){
	this.x = 0;
	this.y = 0;
	this.width = 50;
	this.height = 40;
	this.speed = 3;

	this.init(json);
}

Pipe.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Pipe.prototype.update = function(){
	this.x -= this.speed;
}

Pipe.prototype.isOut = function(){
	if(this.x + this.width < 0){
		return true;
	}
}

var Game = function(){
	this.pipes = [];
	this.birds = [];
	this.score = 0;
	this.canvas = document.querySelector("#flappy");
	this.ctx = this.canvas.getContext("2d");
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.spawnInterval = 90;
	this.interval = 0;
	this.gen = [];
	this.alives = 0;
	this.generation = 0;
	this.backgroundSpeed = 0.5;
	this.backgroundx = 0;
	this.maxScore = 0;
	this.paused = false;
	this.updateTimeout = null;
	this.scheduleToken = 0;
}

Game.prototype.start = function(){
	this.interval = 0;
	this.score = 0;
	this.pipes = [];
	this.birds = [];

	this.gen = Neuvol.nextGeneration();
	for(var i in this.gen){
		var b = new Bird();
		this.birds.push(b)
	}
	this.generation++;
	this.alives = this.birds.length;
}

// Only the newest scheduled callback may advance the simulation. MAX callbacks
// cannot be cancelled, so the token also invalidates queued postMessage work.
Game.prototype.scheduleUpdate = function(){
	clearTimeout(this.updateTimeout);
	this.updateTimeout = null;
	var token = ++this.scheduleToken;
	if(this.paused){
		return;
	}
	var self = this;
	var next = function(){
		if(token != self.scheduleToken || self.paused){
			return;
		}
		self.updateTimeout = null;
		self.update();
	};
	if(FPS == 0){
		setZeroTimeout(next);
	}else{
		this.updateTimeout = setTimeout(next, 1000/FPS);
	}
}

Game.prototype.setPaused = function(paused){
	if(this.paused == paused){
		return;
	}
	this.paused = paused;
	this.scheduleUpdate();
	document.querySelector("#pause-resume").textContent = paused ? "Resume" : "Pause";
	document.querySelector("#simulation-status").textContent = paused ? "SIMULATION PAUSED" : "SIMULATION ONLINE";
}

Game.prototype.update = function(){
	if(this.paused){
		return;
	}
	this.backgroundx += this.backgroundSpeed;
	var nextHoll = 0;
	if(this.birds.length > 0){
		for(var i = 0; i < this.pipes.length; i+=2){
			if(this.pipes[i].x + this.pipes[i].width > this.birds[0].x){
				nextHoll = this.pipes[i].height/this.height;
				break;
			}
		}
	}

	for(var i in this.birds){
		if(this.birds[i].alive){

			var inputs = [
			this.birds[i].y / this.height,
			nextHoll
			];

			var res = this.gen[i].compute(inputs);
			if(res > 0.5){
				this.birds[i].flap();
			}

			this.birds[i].update();
			if(this.birds[i].isDead(this.height, this.pipes)){
				this.birds[i].alive = false;
				this.alives--;
				//console.log(this.alives);
				Neuvol.networkScore(this.gen[i], this.score);
				if(this.isItEnd()){
					this.start();
				}
			}
		}
	}

	for(var i = 0; i < this.pipes.length; i++){
		this.pipes[i].update();
		if(this.pipes[i].isOut()){
			this.pipes.splice(i, 1);
			i--;
		}
	}

	if(this.interval == 0){
		var deltaBord = 50;
		var pipeHoll = 120;
		var hollPosition = Math.round(Math.random() * (this.height - deltaBord * 2 - pipeHoll)) +  deltaBord;
		this.pipes.push(new Pipe({x:this.width, y:0, height:hollPosition}));
		this.pipes.push(new Pipe({x:this.width, y:hollPosition+pipeHoll, height:this.height}));
	}

	this.interval++;
	if(this.interval == this.spawnInterval){
		this.interval = 0;
	}

	this.score++;
	this.maxScore = (this.score > this.maxScore) ? this.score : this.maxScore;
	this.scheduleUpdate();
}


Game.prototype.isItEnd = function(){
	for(var i in this.birds){
		if(this.birds[i].alive){
			return false;
		}
	}
	return true;
}

Game.prototype.display = function(){
	var ctx = this.ctx;
	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, this.width, this.height);
	// All scenery uses simulation-owned distance: rendering never advances time.
	var offset = Math.floor(this.backgroundx * 0.3) % images.background.width;
	for(var x = -offset; x < this.width; x += images.background.width){
		ctx.drawImage(images.background, x, 0);
	}
	// A nearer station layer travels faster than the distant starfield.
	var stationOffset = Math.floor(this.backgroundx * 0.7) % images.background.width;
	for(var x = -stationOffset; x < this.width; x += images.background.width){
		ctx.drawImage(images.background, 0, 448, images.background.width, 64,
			x, 476, images.background.width, 36);
	}

	for(var i in this.pipes){
		var pipe = this.pipes[i];
		var sprite = i % 2 == 0 ? images.pipetop : images.pipebottom;
		// Clip tiled metal to the exact collision rectangle; no external glow.
		ctx.save();
		ctx.beginPath();
		ctx.rect(pipe.x, pipe.y, pipe.width, pipe.height);
		ctx.clip();
		var end = Math.min(pipe.y + pipe.height, this.height);
		for(var y = pipe.y; y < end; y += sprite.height){
			ctx.drawImage(sprite, pipe.x, y, pipe.width, sprite.height);
		}
		// Flush cap makes the gap's exact collision edge easy to read.
		var capY = i % 2 == 0 ? pipe.y + pipe.height - 8 : pipe.y;
		ctx.fillStyle = "#284255";
		ctx.fillRect(pipe.x, capY, pipe.width, 8);
		ctx.fillStyle = "#55DDF2";
		ctx.fillRect(pipe.x + 3, i % 2 == 0 ? capY + 5 : capY + 1, pipe.width - 6, 2);
		ctx.restore();
	}

	for(var i in this.birds){
		if(this.birds[i].alive){
			var bird = this.birds[i];
			// Keep the sprite within the unchanged, axis-aligned 40 x 30 hitbox.
			ctx.drawImage(images.bird, bird.x, bird.y, bird.width, bird.height);
		}
	}

	ctx.fillStyle = "#07111F";
	ctx.fillRect(8, 8, this.width - 16, 58);
	ctx.strokeStyle = "#284255";
	ctx.strokeRect(8.5, 8.5, this.width - 17, 57);
	var labels = ["SCORE", "BEST", "GENERATION", "ALIVE"];
	var values = [this.score, this.maxScore, this.generation, this.alives + "/" + Neuvol.options.population];
	for(var i = 0; i < labels.length; i++){
		var x = 20 + i * 121;
		ctx.fillStyle = "#9BB3C6";
		ctx.font = "12px ui-monospace, monospace";
		ctx.fillText(labels[i], x, 26);
		ctx.fillStyle = i == 3 ? "#55DDF2" : "#E6F5FF";
		ctx.font = "bold 22px ui-monospace, monospace";
		ctx.fillText(values[i], x, 51, 106);
	}

	var self = this;
	requestAnimationFrame(function(){
		self.display();
	});
}

window.onload = function(){
	var sprites = {
		bird:"./img/bird.png",
		background:"./img/background.png",
		pipetop:"./img/pipetop.png",
		pipebottom:"./img/pipebottom.png"
	}

	var start = function(){
		Neuvol = new Neuroevolution({
			population:50,
			network:[2, [2], 1],
		});
		game = new Game();
		game.start();
		var pauseButton = document.querySelector("#pause-resume");
		pauseButton.addEventListener("click", function(){
			game.setPaused(!game.paused);
		});
		pauseButton.disabled = false;
		game.update();
		game.display();
	}


	loadImages(sprites, function(imgs){
		images = imgs;
		start();
	})

}
