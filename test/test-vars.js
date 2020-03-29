	
let assert = require('assert');
	
assert.toleranceEqual = function(actual, expected, message){
	assert.ok(Math.abs(actual - expected) < Number.EPSILON, message)
};

describe('vars', ()=>{
let {
	KNOWN_ENUM,
	VarNode,
	CalcNode,
	Edges,
	
	getGraph,
	getUsed,
	
	resolveEdges,
	
	createVariables
} = require('../index.js');

const {
	Calculated,
	Stub,
	Setable
} = require('@grunmouse/variable');

describe('angle sum', ()=>{
	let alpha = new VarNode('alpha');
	let beta = new VarNode('beta');
	let gamma = new VarNode('gamma');
	
	let angleSum = new CalcNode(
		'alpha+beta+gamma=PI', 
		[alpha, beta, gamma],
		(key)=>{
			let index = +key;
			return (data)=>([0,1,2].reduce((akk, i)=>(i==index ? akk : akk - data[i]), Math.PI));
		}
	);
	
	let al = new Setable();
	let bet = new Setable();
	
	alpha.asSource(al, false);
	beta.asSource(bet, false);
	let graph = getGraph(alpha);
	resolveEdges(graph.edges);
	
	it('var node', ()=>{
		assert.equal(alpha.known, KNOWN_ENUM.SOURCE);
		assert.equal(beta.known, KNOWN_ENUM.SOURCE);
		assert.equal(gamma.known, KNOWN_ENUM.CALCULATE);
	});
	
	it('calc node', ()=>{
		assert.ok(angleSum.result.every(a=>angleSum.edges.has(a)), 'result contained in edges');
		assert.ok(angleSum.known.every(a=>(a.source === angleSum)), 'every results definite with this as source');
		assert.ok(angleSum.isUsed, 'calcualtor is used');
	});
	
	it('report', ()=>{
		let report = angleSum.report();
		assert.equal(report.keys, '2');
		assert.equal(report.output.length, 1);
		assert.equal(report.output[0][0], gamma);
		assert.equal(report.input.length, 2);
		let input = report.input.map(a=>(a[0]));
		assert.ok(input.includes(alpha) && input.includes(beta))
	});
	
	//let graph = getGraph(angleSum);
	
	let vars = createVariables(graph);
	
	it('vars', ()=>{
		assert.ok(vars.input instanceof Set);
		assert.equal(vars.input.size, 2, 'input size');
		assert.ok(vars.all instanceof Set);
		assert.equal(vars.all.size, 3, 'all size');
		
		let map = new Map([...vars.all].map(variable=>([variable.node, variable])));
		assert.ok(map.get(gamma) instanceof Calculated);
	});
	
	al.set(Math.PI/2);
	bet.set(Math.PI/3);
	it('calculate', ()=>{
		let map = new Map([...vars.all].map(variable=>([variable.node, variable])));
		assert.toleranceEqual(map.get(gamma).get(), Math.PI/6);
	});

});

describe('system', ()=>{
	/*
		x + y = a,
		x - y = b;
	*/

	function system(){
		let s = {
			x: new VarNode('x'),
			y: new VarNode('y'),
			a: new VarNode('a'),
			b: new VarNode('b')
		};
		
		const funcs = {
			"a,b":({x, y})=>({a:x+y, b: x-y}),
			"a,x":({b, y})=>({x:b+y, a:b+y+y}),
			"a,y":({b, x})=>({y:x-b, a:x+x-b}),
			"b,x":({a, y})=>({x:a-y, b:a-y-y}),
			"b,y":({a, x})=>({y:a-x, b:x-(a-x)}),
			"x,y":({a, b})=>({x:(a+b)/2, y:(a-b)/2})
		};
		
		let system = new CalcNode('system', 2, s, function(key){
			return funcs[key];
		});
		
		let graph = getGraph(system);
		
		return {
			a:s.a, b:s.b, x:s.x, y:s.y,
			system,
			graph
		};
	}
	
	
	function values(x, y){
		return {
			X:x,
			Y:y,
			A:x+y,
			B:x-y
		};
	}
	
	describe("a,b", ()=>{
		const s = system();
		let x = new Setable(), y = new Setable();
		s.x.asSource(x);
		s.y.asSource(y);
		let vars = createVariables(s.graph);
		
		it('calc', ()=>{
			let {X, Y, A, B} = values(1, 2);
			x.set(X); y.set(Y);
			assert.equal(vars.bynode.get(s.a).get(), A);
			assert.equal(vars.bynode.get(s.b).get(), B);
		});
	});
	describe("a,x", ()=>{
		const s = system();
		let b = new Setable(), y = new Setable();
		s.b.asSource(b);
		s.y.asSource(y);
		let vars = createVariables(s.graph);
		
		it('calc', ()=>{
			let {X, Y, A, B} = values(1, 2);
			b.set(B); y.set(Y);
			assert.equal(vars.bynode.get(s.a).get(), A);
			assert.equal(vars.bynode.get(s.x).get(), X);
		});
	});
	describe("a,y", ()=>{
		const s = system();
		let b = new Setable(), x = new Setable();
		s.b.asSource(b);
		s.x.asSource(x);
		let vars = createVariables(s.graph);
		
		it('calc', ()=>{
			let {X, Y, A, B} = values(1, 2);
			b.set(B); x.set(X);
			assert.equal(vars.bynode.get(s.a).get(), A);
			assert.equal(vars.bynode.get(s.y).get(), Y);
		});
	});
	describe("b,x", ()=>{
		const s = system();
		let a = new Setable(), y = new Setable();
		s.a.asSource(a);
		s.y.asSource(y);
		let vars = createVariables(s.graph);
		
		it('calc', ()=>{
			let {X, Y, A, B} = values(1, 2);
			a.set(A); y.set(Y);
			assert.equal(vars.bynode.get(s.b).get(), B);
			assert.equal(vars.bynode.get(s.x).get(), X);
		});
	});
	describe("b,y", ()=>{
		const s = system();
		let a = new Setable(), x = new Setable();
		s.a.asSource(a);
		s.x.asSource(x);
		let vars = createVariables(s.graph);
		
		it('calc', ()=>{
			let {X, Y, A, B} = values(1, 2);
			a.set(A); x.set(X);
			assert.equal(vars.bynode.get(s.b).get(), B);
			assert.equal(vars.bynode.get(s.y).get(), Y);
		});
	});
	describe("x,y", ()=>{
		const s = system();
		let b = new Setable(), a = new Setable();
		s.b.asSource(b);
		s.a.asSource(a);
		let vars = createVariables(s.graph);
		
		it('calc', ()=>{
			let {X, Y, A, B} = values(1, 2);
			b.set(B); a.set(A);
			assert.equal(vars.bynode.get(s.x).get(), X);
			assert.equal(vars.bynode.get(s.y).get(), Y);
		});
	});
	
});
});