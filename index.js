
const KNOWN_ENUM = require('./const.js');


const Edge = require('./edge.js');
const VarNode = require('./var-node.js');
const CalcNode = require('./calc-node.js');


const {

	fireEdges,
	resolveEdges,
	
	getGraph,
	getUsed,
	getAllGraph,
	joinGraphs,
	toDOT
} = require('./graph.js');

const {Setable} = require('@grunmouse/variable');

const createVariables = require('./create-variables.js');

/*
{
	VarNode,
	
	getGraph,
	getUsed,
	getAllGraph,
	joinGraphs,

	Setable,
	createVariables
}
*/

module.exports = {
	KNOWN_ENUM,
	VarNode,
	CalcNode,
	Edge,
	
	getGraph,
	getUsed,
	getAllGraph,
	joinGraphs,
	toDOT,
	fireEdges,
	resolveEdges,

	Setable,
	createVariables
}