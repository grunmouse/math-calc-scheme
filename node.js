const {
	UNKNOWN,
	VARIABLE,
	CALCULATE,
	SOURCE
}  = require('./const.js');

const Edge = require('./edge.js');

/**
 * human-readable key 
 * человекочитаемый ключ
 * @typedef {(number|string)} HRK
 */
 
/**
 * Именованый набор переменных
 * @typedef {(Array<VarNode>|Object<HRK.VarNode>|Map<HRK.VarNode>)} NamedVars
 */


/**
 * @abstract
 * @class
 * @field {string} name - имя узла, для человекочитаемости
 * @field {Iterable<Edge>} edges - набор рёбер, связанных с узлом
 */
class Node{
	/**
	 * @constructor
	 * @param {string} name - имя узла, для человекочитаемости
	 */
	constructor(name){
		this.name = name;
		this.edges = new Set();
		this.known = UNKNOWN;
	}
	
	get dotName(){
		return this.name;
	}
	
	get description(){
		return this._description || this.name;
	}
	
	set description(value){
		this._description = value;
	}
	
	/**
	 * @friend
	 * @method addEdge
	 * @param {Edge} edge
	 * Метод для добавления ребра к узлу. Используется в конструктором ребра
	 */
	addEdge(edge){
		if(!this.edges.has(edge)){
			this.edges.add(edge);
			edge.onType((evname, ev)=>(this._onEdgeType(ev)));
		}
	}
	
	/**
	 * @protected
	 * @method
	 * @param {Boolean} recursive - нужно ли вызывать событие рекурсивно
	 * вызывает событие onType во всех рёбрах узла
	 */
	_fireEdges(recursive){
		if(!recursive){
			throw new Error('not recursive');
		}
		for(let edge of this.edges){
			edge.fire(recursive);
		}
	}
	
	/**
	 * @abstract
	 * @protected
	 * Обработчик события изменения type в одном из связанных рёбер
	 */
	_onEdgeType(ev){
		throw new Error('Call Abstract method');
	}
}


module.exports = Node;