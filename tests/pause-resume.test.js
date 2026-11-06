// Run with: node tests/pause-resume.test.js
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');
var root = path.join(__dirname, '..');
var passed = 0;

function fixture(fps){
	var callbacks = [];
	var now = 0;
	var seed = 7;
	var math = Object.create(Math);
	math.random = function(){
		seed = (seed * 16807) % 2147483647;
		return seed / 2147483647;
	};
	var context = vm.createContext({
		Math: math,
		window: {addEventListener: function(){}},
		document: {querySelectorAll: function(){ return []; }, querySelector: function(){
			return {width: 500, height: 512, getContext: function(){ return {}; }};
		}},
		setTimeout: function(fn, delay){
			var callback = {fn: fn, due: now + delay, delay: delay, active: true};
			callbacks.push(callback);
			return callback;
		},
		clearTimeout: function(callback){ if(callback){ callback.active = false; } }
	});
	vm.runInContext(fs.readFileSync(path.join(root, 'Neuroevolution.js'), 'utf8'), context,
		{filename: path.join(root, 'Neuroevolution.js')});
	vm.runInContext(fs.readFileSync(path.join(root, 'game.js'), 'utf8'), context,
		{filename: path.join(root, 'game.js')});
	context.setZeroTimeout = function(fn){
		callbacks.push({fn: fn, due: now, delay: 0, active: true});
	};
	context.Neuvol = new context.Neuroevolution({population: 50, network: [2, [2], 1]});
	context.game = new context.Game();
	context.speed(fps);
	context.game.start();
	context.game.update();
	return {
		context: context,
		game: context.game,
		pending: function(){ return callbacks.filter(function(c){ return c.active; }); },
		tick: function(){
			var callback = this.pending()[0];
			assert.ok(callback, 'an update must be scheduled');
			callback.active = false;
			now = Math.max(now, callback.due);
			callback.fn();
		},
		advance: function(ms){
			var end = now + ms;
			var callback;
			var limit = 10000;
			while((callback = this.pending().find(function(c){ return c.due <= end; }))){
				assert.ok(limit-- > 0, 'bounded callback processing');
				callback.active = false;
				now = Math.max(now, callback.due);
				callback.fn();
			}
			now = end;
		},
		snapshot: function(){
			return JSON.stringify({
				birds: context.game.birds, pipes: context.game.pipes,
				score: context.game.score, maxScore: context.game.maxScore,
				globalMaxScore: context.maxScore, generation: context.game.generation,
				alives: context.game.alives, interval: context.game.interval,
				spawnInterval: context.game.spawnInterval, backgroundx: context.game.backgroundx,
				networks: context.game.gen, evolution: context.Neuvol
			});
		}
	};
}

function check(name, fn){
	fn();
	passed++;
	console.log('PASS ' + name);
}

[60, 120, 180, 300, 0].forEach(function(fps){
	check('complete state freezes and resumes exactly at ' + fps + ' FPS', function(){
		var f = fixture(fps);
		for(var i = 0; i < 12; i++){ f.tick(); }
		f.game.pause();
		var before = f.snapshot();
		f.game.pause();
		f.game.update();
		f.advance(3500);
		assert.equal(f.snapshot(), before);
		var bird = f.game.birds[0];
		var network = f.game.gen[0];
		var background = f.game.backgroundx;
		f.game.resume();
		f.game.resume();
		assert.equal(f.snapshot(), before, 'resume must not advance simulation');
		assert.equal(f.pending().length, 1);
		assert.equal(f.pending()[0].delay, fps ? 1000/fps : 0);
		f.tick();
		assert.equal(f.game.backgroundx, background + f.game.backgroundSpeed);
		assert.equal(f.game.birds[0], bird);
		assert.equal(f.game.gen[0], network);
		assert.equal(f.pending().length, 1);
	});
});

[60, 0].forEach(function(fps){
	check('stale callbacks and ten repeated toggles at ' + fps + ' FPS', function(){
		var f = fixture(fps);
		for(var i = 0; i < 10; i++){
			var stale = f.pending()[0];
			f.game.pause();
			f.game.resume();
			var before = f.snapshot();
			stale.active = false;
			stale.fn(); // Execute even cancelled timeouts, after resume.
			assert.equal(f.snapshot(), before);
			assert.equal(f.pending().length, 1);
			f.tick();
			assert.equal(f.pending().length, 1);
		}
	});
});

check('every paused speed change applies on resume', function(){
	var f = fixture(60);
	[0, 300, 180, 120, 60].forEach(function(fps){
		f.game.pause();
		// Drain a queued MAX callback while still paused.
		f.advance(3500);
		var before = f.snapshot();
		f.context.speed(fps);
		assert.equal(f.snapshot(), before);
		assert.equal(f.pending().length, 0);
		f.game.resume();
		assert.equal(f.pending().length, 1);
		assert.equal(f.pending()[0].delay, fps ? 1000/fps : 0);
		f.tick();
	});
});

check('running speed change applies to the successor', function(){
	var f = fixture(60);
	f.context.speed(0);
	assert.equal(f.pending()[0].delay, 1000/60);
	f.tick();
	assert.equal(f.pending()[0].delay, 0);
	f.context.speed(120);
	f.tick();
	assert.equal(f.pending()[0].delay, 1000/120);
});

check('learning continues through multiple generations after resume', function(){
	var f = fixture(0);
	f.game.pause();
	f.advance(3500);
	f.game.resume();
	var limit = 10000;
	while(f.game.generation < 4 && limit-- > 0){ f.tick(); }
	assert.equal(f.game.generation, 4);
	assert.equal(f.game.birds.length, 50);
	assert.equal(f.pending().length, 1);
});

check('combined startup binds pause button and updates telemetry', function(){
	var f = fixture(60);
	var nodes = {};
	['score', 'max-score', 'generation', 'alive', 'flight-status', 'pause-toggle'].forEach(function(id){
		nodes[id] = {textContent: '', disabled: true, attributes: {},
			setAttribute: function(name, value){ this.attributes[name] = value; },
			addEventListener: function(name, handler){ this[name] = handler; }};
	});
	var canvas = {width: 500, height: 512, getContext: function(){
		return {clearRect: function(){}, drawImage: function(){}, save: function(){},
			translate: function(){}, rotate: function(){}, restore: function(){}};
	}};
	f.context.document.querySelector = function(selector){
		return selector == '#flappy' ? canvas : nodes[selector.slice(1)];
	};
	f.context.prepareImages = function(){
		return {background: {width: 500}, bird: {}, pipetop: {height: 512}, pipebottom: {height: 512}};
	};
	f.context.requestAnimationFrame = function(){};
	f.context.window.onload();
	var game = f.context.game;
	var button = nodes['pause-toggle'];
	assert.equal(button.disabled, false);
	assert.equal(nodes.generation.textContent, 1);
	button.click();
	game.display();
	assert.equal(game.paused, true);
	assert.equal(button.textContent, 'Resume');
	assert.equal(button.attributes['aria-pressed'], 'true');
	assert.equal(nodes['flight-status'].textContent, '● SIMULATION PAUSED');
	button.click();
	game.display();
	assert.equal(game.paused, false);
	assert.equal(button.textContent, 'Pause');
	assert.equal(button.attributes['aria-pressed'], 'false');
	assert.equal(nodes['flight-status'].textContent, '● SIMULATION ACTIVE');
});

console.log(passed + ' checks passed');
