// Run with: node tests/regression.cjs (no dependencies).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function simulation() {
	let seed = 12345, nextId = 0;
	const timers = new Map(), messages = [];
	const math = Object.create(Math);
	math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
	const context = vm.createContext({
		Math: math,
		document: { querySelector: () => ({ width: 500, height: 512, getContext: () => ({}) }) },
		window: { addEventListener() {}, postMessage() {} },
		setTimeout(fn, delay) { timers.set(++nextId, { fn, delay }); return nextId; },
		clearTimeout(id) { timers.delete(id); }
	});
	for (const file of ['Neuroevolution.js', 'game.js']) {
		vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
	}
	context.setZeroTimeout = fn => messages.push(fn);
	vm.runInContext('Neuvol = new Neuroevolution({population:50,network:[2,[2],1]}); game = new Game(); game.start(); game.update();', context);
	return {
		context, timers, messages,
		state() {
			const g = context.game;
			return JSON.stringify([g.birds, g.pipes, g.gen, g.score, g.maxScore, g.backgroundx, g.interval, g.alives, g.generation, context.Neuvol]);
		},
		tick() {
			if (messages.length) return messages.shift()();
			const item = timers.entries().next().value;
			assert.ok(item, 'An update must be scheduled');
			timers.delete(item[0]); item[1].fn();
		}
	};
}

function run() {
	let passed = 0;
	function check(name, fn) { fn(); passed++; console.log('PASS: ' + name); }
	check('Pause cancels the timer and freezes full simulation and learning state', () => {
		const s = simulation(), g = s.context.game;
		g.setPaused(true); const before = s.state();
		for (let i = 0; i < 50; i++) g.update();
		assert.equal(s.state(), before); assert.equal(s.timers.size, 0);
	});
	check('All five speeds preserve state and schedule once on resume', () => {
		for (const fps of [60, 120, 180, 300, 0]) {
			const s = simulation(), g = s.context.game;
			g.setPaused(true); const before = s.state(), birds = g.birds, networks = g.gen;
			s.context.speed(fps); assert.equal(s.state(), before); assert.ok(g.paused);
			g.setPaused(false); g.setPaused(false);
			assert.equal(s.state(), before); assert.equal(g.birds, birds); assert.equal(g.gen, networks);
			assert.equal(s.timers.size + s.messages.length, 1);
			if (fps) assert.equal([...s.timers.values()][0].delay, 1000 / fps);
			s.tick(); assert.notEqual(s.state(), before);
		}
	});
	check('An already queued timeout cannot update after pause/resume', () => {
		const s = simulation(), g = s.context.game;
		const stale = [...s.timers.values()][0].fn;
		g.setPaused(true); g.setPaused(false); const before = s.state();
		stale(); assert.equal(s.state(), before); assert.equal(s.timers.size, 1);
	});
	check('200 rapid MAX toggles leave exactly one live update chain', () => {
		const s = simulation(), g = s.context.game;
		g.setPaused(true); s.context.speed(0);
		for (let i = 0; i < 200; i++) { g.setPaused(false); g.setPaused(true); }
		g.setPaused(false); const pending = s.messages.splice(0), before = g.backgroundx;
		pending.forEach(fn => fn());
		assert.equal(g.backgroundx, before + g.backgroundSpeed);
		assert.equal(s.messages.length, 1);
		g.setPaused(true); const frozen = s.state(); s.messages.splice(0).forEach(fn => fn());
		assert.equal(s.state(), frozen); assert.equal(s.messages.length, 0);
	});
	check('Interrupted and continuous learning match over 10,000 seeded ticks', () => {
		const a = simulation(), b = simulation();
		for (let i = 0; i < 10000; i++) {
			if (i % 97 === 0) {
				b.context.game.setPaused(true); b.context.game.update(); b.context.game.setPaused(false);
			}
			a.tick(); b.tick(); assert.equal(b.state(), a.state(), 'Tick ' + i);
		}
		assert.ok(b.context.game.generation > 1, 'Evolution must reach another generation');
	});
	check('Original bird and obstacle collision boundaries remain intact', () => {
		const s = simulation(), c = s.context;
		const bird = new c.Bird(), pipe = new c.Pipe({ x: 121, y: 240, height: 60 });
		assert.equal(bird.width, 40); assert.equal(bird.height, 30); assert.equal(pipe.width, 50);
		assert.equal(bird.isDead(512, [pipe]), undefined);
		pipe.x = 120; assert.equal(bird.isDead(512, [pipe]), true);
		bird.y = 512; assert.equal(bird.isDead(512, []), true);
	});
	console.log(passed + ' tests passed; 0 failed');
	return passed;
}
module.exports = run;
if (require.main === module) run();
