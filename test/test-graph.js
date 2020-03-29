let {
	KNOWN_ENUM,
	VarNode,
	CalcNode,
	Edges,
	
	getGraph,
	getUsed,
	getAllGraph
} = require('../graph.js');

const manyVarNodes = require('../many-var-nodes.js');	

let assert = require('assert');


describe('graph', ()=>{
	
	describe('calc', ()=>{
		let alpha = new VarNode('alpha');
		let beta = new VarNode('beta');
		let gamma = new VarNode('gamma');
		
		let angleSum = new CalcNode('alpha+beta+gamma=PI', [alpha, beta, gamma]);
	
		it('edges', ()=>{
			assert.equal(angleSum.edges.size, 3);
			assert.equal(alpha.edges.size, 1);
			assert.equal(beta.edges.size, 1);
			assert.equal(gamma.edges.size, 1);
		});
		alpha.asSource();
		beta.asSource();
		
		it('calc node', ()=>{
			assert.ok(angleSum.result.every(a=>angleSum.edges.has(a)), 'result contained in edges');
			assert.ok(angleSum.known.every(a=>(a.source === angleSum)), 'every results definite with this as source');
			assert.ok(angleSum.isUsed, 'calcualtor is used');
		});
		
		it('var node', ()=>{
			assert.equal(alpha.known, KNOWN_ENUM.SOURCE);
			assert.equal(beta.known, KNOWN_ENUM.SOURCE);
			assert.equal(gamma.known, KNOWN_ENUM.CALCULATE);
		});
		
		//console.log([...getUsed(getGraph(beta)).edges].map(a=>a.toDOT()).join('\n'))
	});
		
	describe('triangle', ()=>{
		function Triangle(a, b, c, alpha, beta, gamma){
			let angleSum = new CalcNode('alpha+beta+gamma=PI', [alpha, beta, gamma]);
			let sinAB = new CalcNode('a/sin(alpha)=b/sin(beta)', [a, b, alpha, beta]);
			let sinAC = new CalcNode('a/sin(alpha)=c/sin(gamma)', [a, c, alpha, gamma]);
			let sinBC = new CalcNode('b/sin(beta)=c/sin(gamma)', [b, c, beta, gamma]);
			let cosC = new CalcNode('c**2 = a**2+b**2 - 2*a*b*cos(gamma)', [a, b, c, gamma]);
			let cosB = new CalcNode('b**2 = a**2+c**2 - 2*a*c*cos(beta)', [a, b, c, beta]);
			let cosA = new CalcNode('a**2 = b**2+c**2 - 2*b*c*cos(alpha)', [a, b, c, alpha]);
			return getGraph(angleSum);
		}
		let a = new VarNode('a');
		let b = new VarNode('b');
		let c = new VarNode('c');
		let alpha = new VarNode('alpha');
		let beta = new VarNode('beta');
		let gamma = new VarNode('gamma');
		
		let graph = Triangle(a, b, c, alpha, beta, gamma);
		
		a.asSource();
		b.asSource();
		gamma.asSource();
		//console.log([...getUsed(graph).edges].map(a=>a.toDOT()).join('\n'))
	
	});
	
	describe('system', ()=>{
		let a = new VarNode('a');
		let b = new VarNode('b');
		let p = new VarNode('p');
		let q = new VarNode('q');
		
		let system = new CalcNode('a+b=p; a-b=q', 2, [a, b, p, q]);
		p.asSource();
		q.asSource();
		
		it('calc node', ()=>{
			assert.ok(system.result.every(a=>system.edges.has(a)), 'result contained in edges');
			assert.equal(system.known.size, 2);
			assert.ok(system.known.every(a=>(a.source === system)), 'every results definite with this as source');
			assert.ok(system.isUsed, 'calcualtor is used');
		});

		it('var node', ()=>{
			assert.equal(p.known, KNOWN_ENUM.SOURCE);
			assert.equal(q.known, KNOWN_ENUM.SOURCE);
			assert.equal(a.known, KNOWN_ENUM.CALCULATE);
			assert.equal(b.known, KNOWN_ENUM.CALCULATE);
		});
		
		let graph = getGraph(system);
		//console.log([...getUsed(graph).edges].map(a=>a.toDOT()).join('\n'))
	
	});

});

