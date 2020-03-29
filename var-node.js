const Node = require('./node.js');
const {
	UNKNOWN,
	VARIABLE,
	CALCULATE,
	SOURCE
}  = require('./const.js');

/**
 * Узел, представляющий переменную
 *
 * @class VarNode extends Node
 * @field {UNKNOWN|CALCULATE|SOURCE} known - признак, что значение известно
 * @field {Edge|SOURCE|variable} source - дуга, через которую получено значение переменной, или SOURCE или переданная переменная, если переменная корневая
 */
class VarNode extends Node{
	

	/**
	 * @override
	 * Если узел не определён, а ребро определилось в CALCULATE, 
	 * устанавливает это ребро в качестве источника, а все остальные рёбра - в качестве потребителей
	 */
	_onEdgeType(ev){
		if(!this.source && ev.value === CALCULATE){
			this.known = CALCULATE;
			this.source = ev.target;
			this._setEdges(ev.recursive);
		}
	}
	
	/**
	 * @override
	 */
	addEdge(edge){
		super.addEdge(edge);
		//Обработка случаев с тривиальными уравнениями
		if(this.known !== UNKNOWN && edge.type === UNKNOWN){
			edge.type = VARIABLE;
			edge.fire(true);
		}
		else if(this.known === UNKNOWN && edge.type === CALCULATE){
			this.known = CALCULATE;
			this.source = edge;
			this._setEdges(true);
		}
	}
	
	/**
	 * @protected
	 * @method
	 * Делает все неопределённые рёбра потребителями значения переменной
	 */
	_setEdges(fire){
		for(let edge of this.edges){
			if(edge.type === UNKNOWN){
				edge.type = VARIABLE;
			}
		}
		if(fire) {
			this._fireEdges(fire);
		}
	}
	
	/**
	 * @method asSource(source) - установить данный узел в качестве первичного источника данных
	 * @param {?Variable} source - объект-переменная, которая должна быть использована в качестве источника, если опущена - будет создана заглушка
	 * @param {?Boolean = true} fire - зажечь событие в исходящих ветках
	 */
	asSource(source, fire){
		this.known = SOURCE;
		this.source = source || SOURCE;
		//console.log('SOURCE ->"' + this.name + '"');
		
		this._setEdges(fire !== false);
	}
	
	get isSource(){
		return this.known === SOURCE;
	}
	
	/**
	 * Признак того, что переменная используется
	 * @property {Boolean} isUsed
	 */
	get isUsed(){
		return this.known !== UNKNOWN;
	}
	
	/**
	 * @property {Array[2]<Integer>} level - нижняя и верхняя оценка уровня узла в порядке расчёта
	 */
	get level(){
		if(this.isUsed){
			if(!this._level){
				if(!this.isSource){
					this._level = this.source.source.level.map(a=>(a+1));
				}
				else{
					this._level = [0, 0];
				}
			}
			return this._level;
		}
		else{
			throw new Error('getting level of unused node');
		}
	}
	
}

module.exports = VarNode;