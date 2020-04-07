
const {
	UNKNOWN,
	VARIABLE,
	CALCULATE,
	SOURCE
}  = require('./const.js');


const Edge = require('./edge.js');
const VarNode = require('./var-node.js');
const CalcNode = require('./calc-node.js');

/**
 * @typedef {Object} Graph
 * @property {Iterable<Node>} nodes - набор узлов графа
 * @property {Iterable<Edge>} edges - набор дуг графа
 */

/**
 * Находит связный граф, узлом которого является node
 * @param {Node} node - узел графа
 * @returned {Graph}
 */
function getGraph(node){
	let nodes = new Set();
	let edges = new Set();
	let queue = [node], i =0;
	nodes.add(node);
	while(i<queue.length){
		let node = queue[i];
		for(let edge of node.edges){
			if(!edges.has(edge)){
				edges.add(edge);
				for(let subnode of edge.nodes){
					if(!nodes.has(subnode)){
						queue.push(subnode);
						nodes.add(subnode);
					}
				}
			}
		}
		++i;
	}
	return {nodes, edges};
}

/**
 * Находит используемый подгаф переданного графа
 * @param {Graph} graph
 * @returned {Graph}
 */
function getUsed(graph){
	let {nodes, edges} = graph;
	
	edges = [...edges].filter(a=>(a.isUsed));
	nodes = [...nodes].filter(a=>(a.isUsed));

	return {nodes, edges};
}


/**
 * @param {Iterable<Node>} vars - набор узлов, по которым ищутся графы
 * @returned {Array<Graph>} массив связных подграфов графа, включающего все переданные узлы
 */
function getAllGraph(vars){
	let s = new Set(vars);
	let result = [];
	while(s.size){
		let first = s[Symbol.iterator].next().value;
		let graph = getGraph(first);
		for(let node of graph.nodes){
			s.delete(node);
		}
		result.push(graph);
	}
	return result;
}

/**
 * Объединяет массив графов в один несвязный граф. Механически складывая элементы в одну структуру
 * @param {Array<Graph>} graphs
 * @returned {Graph}
 */
function joinGraphs(graphs){
	return graphs.reduce((akk, graph)=>{
		let {edges, nodes} = graph;
		if(akk){
			for(let a of edges) akk.edges.add(a);
			for(let a of nodes) akk.nodes.add(a);
		}
		else{
			akk = {edges, nodes};
		}
		//console.log(akk);
		return akk;
	}, false);
}

function fireEdges(edges){
	let res = false;
	const prepared = [...edges].filter(a=>a.prepared);
	
	res = prepared.length>0;
	
	prepared.forEach(a=>a.fire());
	return res;
}

function resolveEdges(edges){
	//console.log('start fires');
	while(fireEdges(edges)) /* console.log('fire ok') */;
	//console.log('fire end');
}


function toDOT(graph, sorter){
	let result = [...graph.edges];
	
	result.sort(sorter);
	return result.map(a=>a.toDOT()).join(';\n');
}

function toTeX(graph, sorter){
	let result = [...graph.nodes];
	
	result.sort(sorter);
	
	return result.map(a=>('$$'+a.description + '$$')).join('\n');
}

module.exports = {
	KNOWN_ENUM:{
		UNKNOWN,
		CALCULATE,
		VARIABLE,
		SOURCE
	},
	VarNode,
	CalcNode,
	Edge,
	
	fireEdges,
	resolveEdges,
	
	getGraph,
	getUsed,

	getAllGraph,
	joinGraphs,
	toDOT,
	toTeX
}

