const Node = require('./node.js');
const Edge = require('./edge.js');
const {
	UNKNOWN,
	VARIABLE,
	CALCULATE,
	SOURCE
}  = require('./const.js');

const Callbacks = require('@grunmouse/callbacks');

const DelCounter = require('./del-counter.js');

/**
 * Создаёт и добавляет рёбра, связывающие вычисляющий узел с узлами-переменными,
 * Возвращает DelCounter, для подсчёта этих рёбер
 * @param {CalcNode} calculator - вычисляющий узел
 * @param {number|function} count - количество переменных, соответствующее порогу или функция проверки, достигнут ли порог
 * @param {Iterable<VarNode>} vars - узлы-переменные
 * @return DelCounter<Edge>
 */
function makeForCalc(calculator, count, vars){
	if(vars){
		return new DelCounter(count, [...vars].map((variable)=>(new Edge(calculator, variable))));
	}
	else{
		return new DelCounter(count);
	}
}

/**
 * Узел, представляющий связь между переменными
 * @class CalcNode extends Node
 * @field {Set<Edge>|UNKNOWN} known - множество рёбер, относительно которых разрешился узел, или символ UNKNOWN - если узел не разрешился
 * @field {?Set<Edge>} result - множество рёбер, относительно которых разрешился узел, или undefined - если узел не разрешился
 * @field {Function} factory - функция, возвращающая расчётную функцию по ключам рассчитываемых переменных
 * 
 */
class CalcNode extends Node{

	/**
	 * @constructor
	 * @param name - имя узла
	 * @param {Number|Function} count - количество переменных, относительно которых может разрешиться узел, или функция проверки, разрешился ли он
	 * @param {NamedVars} vars - переменные, относительно которых узел может разрешиться
	 * @param {NamedVars} required - переменные, относительно которых узел не может разрешиться
	 * @param {Function} factory - функция, создающая вычисляющие функции по ключам вычисляемых переменных. Только хранится.
	 */
	constructor(name, count, vars, required, factory){
		super(name);
		if(typeof count !== 'number' && !count.call){
			required = vars;
			vars = count;
			count = 1;
		}
		if(required instanceof Function){
			factory = required;
			required = undefined;
		}
		/**
		 * @var {Map<string, VarNode>} required, vars
		 */
		required = this._ensureMap(required);
		vars = this._ensureMap(vars);
		
		this.factory = factory;
		//this.known = UNKNOWN;

		/**
		 * @field {Callbacks} _onfinal - обеспечивает подписку на финализацию калькулятора
		 * @field {Map<(VarNode).(string)>} _index - карта имён переменных
		 * @field {DelCounter<VarNode>} _waithing - набор переменных, которые ожидают разрешения
		 * @field {DelCounter<VarNode>} _required - набор переменных, которые должны быть заданы
		 * @field {Boolean} _final - признак неизменяемости калькулятора
		 */
		//this._onfinal = new Callbacks();
		Object.defineProperty(this, '_onfinal', {value:new Callbacks()});
		
		this._index = new Map([...vars, ...required].map(([name, link])=>([link, name])));
		this._waithing = makeForCalc(this, count, vars.values());
		this._required = makeForCalc(this, 0, required.values());
		
		//this._final = true;
		Object.defineProperty(this, '_final', {value:true});
		
		this._onfinal.fire();
		
		this._required.controlByFilter((e)=>(e.type === VARIABLE));
		this._waithing.controlByFilter((e)=>(e.type === VARIABLE));

		if(this._waithing.control() && this._required.control()){
			this._selectSheme(this._waithing)
		}
	}
	
	/**
	 * @override
	 */
	addEdge(edge){
		if(!this._final){
			super.addEdge(edge);
		}
		else{
			throw new Error('Lifecicle error: adding edge into finalized edge set');
		}
	}
	
	/**
	 * @method keyOf(varnode) - получить имя ключа по ссылке на него
	 * @param {VarNode} varnode - ключ переменной
	 * @returned {string} - имя переменной
	 */
	keyOf(varnode){
		return this._index.get(varnode);
	}
	
	/**
	 * @method report - получить отчёт о срабатывании узла, если калькулятор не финализирован, то undefined
	 * @returned {?Object}
	 * @property {string} keys - ключ выбранной расчётной схемы, состоит из имён вычисляемых переменных
	 * @property {Array<[link, name]>} input - входные переменные
	 * @property {Array<[link, name]>} output - входные переменные
	 * @property {Function} factory === this.factory
	 */
	report(){
		if(this._report){
			return this._report;
		}
		else if(this.result){
			let result = this.result.map((edge)=>(edge.variable)),
			
				input = [...this._index].filter(([link, name])=>(!result.includes(link))),
				
				output = result.map((link)=>([link, this._index.get(link)]));
				
			let keys = output.map((a)=>(a[1])).sort().join(',');
			
			return {
				keys,
				input,
				output,
				factory:this.factory
			}
		}
		else{
			throw new Error('No result ' + this.name);
		}
	}
	
	/**
	 * Преобразует NamedVars в Map<string, VarNode>, причём числовые ключи преобразуются в строковый тип
	 * @param {?NamedVars} vars - набор переменных
	 * @param {?string} prefix - префикс ключей, если они создаются из индексов массива
	 * @returned Map<string, VarNode>
	 */
	_ensureMap(vars, prefix){
		prefix = prefix || '';
		if(!vars){
			return new Map();
		}
		else if(vars instanceof Map){
			return vars;
		}
		else if(Array.isArray(vars)){
			return new Map(vars.map((link, index)=>([prefix+index, link])));
		}
		else{
			return new Map(Object.keys(vars).map((key)=>([''+key, vars[key]])));
		}
	}
	
	/**
	 * @override
	 */
	_onEdgeType(ev){
		this._onfinal.on(()=>{
			if(this.known === UNKNOWN && ev.value === VARIABLE 
				&& this._waithing.control(ev.target) 
				&& this._required.control(ev.target)){
				
				//console.log('ev.recursive', ev.recursive);
				this._selectSheme(this._waithing, ev.recursive);
			}
		});
	}
	
	/**
	 * @protected 
	 * @method _selectSheme(edges)
	 * Реализует выбор схемы расчёта
	 * Все неопределённые рёбра устанавливает в качестве потребителей значения, устанавливает выбранный набор рёбер
	 * в качестве known и result
	 * @param {Iterable<Edge>} edges - рёбра, которые будут вычисляться
	 * @param {Boolean} fire - вызвать события в исходящих рёбрах
	 * @void
	 */
	_selectSheme(edges, fire){
		for(let edge of edges){
			if(edge.type === UNKNOWN){
				edge.type = CALCULATE;
			}
		}
		this.known = edges;
		this.result = edges;
		this._report = this.report();
		
		if(fire){
			this._fireEdges(fire);
		}
	}
	
	
	
	/**
	 * Признак того, что калькулятор используется
	 * @property {Boolean} isUsed
	 */
	get isUsed(){
		//Калькулятор считается используемым, если используется хотя бы один его результат
		return this.known !== UNKNOWN && this.result.some(a=>a.isUsed);
	}
	
	/**
	 * @property {Array[2]<Integer>} level - нижняя и верхняя оценка уровня узла в порядке расчёта
	 */
	get level(){
		if(this.isUsed){
			if(!this._level){
				let values = [];
				
				for(let edge of this.edges){
					if(edge.isUsed && edge.target === this){
						values.push(...edge.source.level);
					}
				}
				if(!values.length){
					this._level = [1, 1];
				}
				else{
					this._level = [Math.min(...values)+1, Math.max(...values)+1];
				}
			}
			return this._level;
		}
		else{
			throw new Error('getting level of unused node');
		}		
	}
}

module.exports = CalcNode;