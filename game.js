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
	this.updateTimer = null;
	this.updateScheduled = false;
	this.updateEpoch = 0;
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

Game.prototype.setPaused = function(paused){
	if(this.paused == paused){
		return;
	}
	this.paused = paused;
	this.updateEpoch++;
	clearTimeout(this.updateTimer);
	this.updateTimer = null;
	this.updateScheduled = false;
	if(!this.paused){
		this.scheduleUpdate();
	}
}

Game.prototype.scheduleUpdate = function(){
	if(this.paused || this.updateScheduled){
		return;
	}
	var self = this;
	var epoch = this.updateEpoch;
	this.updateScheduled = true;
	var tick = function(){
		// MAX callbacks cannot be cancelled; ignore callbacks from before a pause.
		if(self.paused || epoch != self.updateEpoch){
			return;
		}
		self.updateTimer = null;
		self.updateScheduled = false;
		self.update();
	};
	if(FPS == 0){
		setZeroTimeout(tick);
	}else{
		this.updateTimer = setTimeout(tick, 1000/FPS);
	}
}

Game.prototype.update = function(){
	if(this.paused || this.updateScheduled){
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
	this.ctx.clearRect(0, 0, this.width, this.height);
	// The skyline stays fixed; only the seamless foreground follows simulation time.
	this.ctx.drawImage(images.background, 0, 0, this.width, this.height);
	for(var i = 0; i < Math.ceil(this.width / images.terrain.width) + 1; i++){
		this.ctx.drawImage(images.terrain, i * images.terrain.width - Math.floor(this.backgroundx%images.terrain.width), this.height - images.terrain.height);
	}

	for(var i in this.pipes){
		if(i%2 == 0){
			this.ctx.drawImage(images.pipetop, this.pipes[i].x, this.pipes[i].y + this.pipes[i].height - images.pipetop.height, this.pipes[i].width, images.pipetop.height);
		}else{
			this.ctx.drawImage(images.pipebottom, this.pipes[i].x, this.pipes[i].y, this.pipes[i].width, images.pipetop.height);
		}
	}

	this.ctx.fillStyle = "#FFC600";
	this.ctx.strokeStyle = "#CE9E00";
	for(var i in this.birds){
		if(this.birds[i].alive){
			this.ctx.save(); 
			this.ctx.translate(this.birds[i].x + this.birds[i].width/2, this.birds[i].y + this.birds[i].height/2);
			this.ctx.rotate(Math.PI/2 * this.birds[i].gravity/20);
			this.ctx.drawImage(images.bird, -this.birds[i].width/2, -this.birds[i].height/2, this.birds[i].width, this.birds[i].height);
			this.ctx.restore();
		}
	}

	this.ctx.fillStyle = "rgba(13, 30, 37, 0.94)";
	this.ctx.fillRect(10, 10, this.width - 20, 58);
	this.ctx.strokeStyle = "#647b70";
	this.ctx.strokeRect(10.5, 10.5, this.width - 21, 57);
	var telemetry = [
		["SCORE", this.score],
		["BEST", this.maxScore],
		["GENERATION", this.generation],
		["ALIVE", this.alives + " / " + Neuvol.options.population]
	];
	for(var i = 0; i < telemetry.length; i++){
		var x = 23 + i * 120;
		this.ctx.fillStyle = "#a8c4bc";
		this.ctx.font = "10px Arial, sans-serif";
		this.ctx.fillText(telemetry[i][0], x, 29);
		this.ctx.fillStyle = "#f4d495";
		this.ctx.font = "bold 19px Arial, sans-serif";
		this.ctx.fillText(telemetry[i][1], x, 53, 106);
	}

	var self = this;
	requestAnimationFrame(function(){
		self.display();
	});
}

window.onload = function(){
	var sprites = {
		bird:"./img/sci-fi-bird.svg",
		background:"./img/sci-fi-background.svg",
		terrain:"./img/sci-fi-terrain.svg",
		pipetop:"./img/sci-fi-pipetop.svg",
		pipebottom:"./img/sci-fi-pipebottom.svg"
	}

	var start = function(){
		Neuvol = new Neuroevolution({
			population:50,
			network:[2, [2], 1],
		});
		game = new Game();
		game.start();
		game.update();
		game.display();
		var pauseButton = document.querySelector("#pause-resume");
		pauseButton.addEventListener("click", function(){
			game.setPaused(!game.paused);
			pauseButton.textContent = game.paused ? "Resume" : "Pause";
		});
		pauseButton.disabled = false;
	}


	loadImages(sprites, function(imgs){
		images = imgs;
		start();
	})

}
