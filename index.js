const {
	KNOWN_ENUM,
	VarNode,
	CalcNode,
	Edge,
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

const manyVarNodes = require('./many-var-nodes.js');
/*
{
	VarNode,
	
	manyVarNodes,
	
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
	
	manyVarNodes,
	
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