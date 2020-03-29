const VarNode = require('./var-node.js');



/**
 * Создаёт массив, содержащий новые экземпляры VarNode
 * @param {Array<(number|string)>|number} arr - 
 *		Если передан массив, то будет создано столько VarNode, сколько элементов в переданном массиве, а значения элементов станут именами
 *		Если передано число, то оно трактуется как количество создаваемых VarNode, а их именами будут номера [0, arr-1]
 * @return {Array<VarNode>}
 * @throws {TypeError}
 */
function manyVarNodes(arr){
	if(Array.isArray(arr)){
		return arr.map((name)=>{
			return new VarNode(name);
		});
	}
	else if(!isNaN(arr)){
		let result = [];
		arr = +arr;
		for(let i=0; i<arr; ++i){
			result[i] = new VarNode(i);
		}
		return result;
	}
	else{
		throw new TypeError();
	}
}

module.exports = manyVarNodes;