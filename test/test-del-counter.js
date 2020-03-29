let assert = require('assert');

const DelCounter = require('../del-counter.js');

describe('DelCounter', ()=>{
	describe('class', ()=>{
		it('exist', ()=>{
			assert.ok(DelCounter);
		});
		it('instance', ()=>{
			let a = new DelCounter(1, ['a', 'b', 'c']);
			assert.ok(a instanceof DelCounter);
			assert.ok(a instanceof Set);
		});
	});
	describe('initialize', ()=>{
		it('1', ()=>{
			let a = new DelCounter(1, ['a', 'b', 'c']);
			assert.equal(a.size, 3);
			assert.equal(a.count, 1);
		});
		it('2', ()=>{
			let a = new DelCounter(1, ['a', 'b', 'c']);
			assert.equal(a.size, 3);
			assert.equal(a.count, 1);
		});
	});
	describe('behaviour', ()=>{
		it('contorl', ()=>{
			let a = new DelCounter(1, ['a', 'b', 'c']);
			assert.ok(!a.control('a'));
			assert.ok(a.control('b'));
		});
		it('controlByFilter ok', ()=>{
			let a = new DelCounter(1, ['a', 'b', 'c']);
			assert.ok(a.controlByFilter((item)=>(item!='a')));
		});
		it('controlByFilter not ok', ()=>{
			let a = new DelCounter(1, ['a', 'b', 'c']);
			assert.ok(!a.controlByFilter((item)=>(item=='a')));
		});
		
		it('control with callback', ()=>{
			let a = new DelCounter(
				(a)=>(a.has('a') && a.size==1 || a.size==2 && a.has('b') && a.has('c')),
				['a', 'b', 'c']
			);
			assert.ok(a.control('a'));
		});
		it('control with callback', ()=>{
			let a = new DelCounter(
				(a)=>(a.has('a') && a.size==1 || a.size==2 && a.has('b') && a.has('c')),
				['a', 'b', 'c']
			);
			assert.ok(!a.control('b'));
			assert.ok(a.control('c'));
		});
	});
});