const {
	Abstract,
	Calculated,
	Stub
} = require('@grunmouse/variable');

const {
	KNOWN_ENUM,
	VarNode,
	CalcNode,
	Edge,
	
	joinGraphs
} = require('./graph.js');

/**
 * @function calcIndex(index)
 * @param {string} index - ключ переменной
 * @returned {Function} - функция, выбирающая значение по ключу index из свойства calc переданного аргумента
 */
function calcIndex(index){
	return (data)=>(data.calc[index]);
}

/**
 * Создаёт набор взаимосвязанных объектов Variable для расчётной схемы, описываемой графом
 * @param {Graph|Array<Graph>} graph - граф или массив графов (элементы будут объединены)
 * @returned {Object}
 *   @property {Set<Variable>} input - набор входных переменных
 *   @property {Set<Variable>} all - набор всех переменных
 *   @property {Map<(Node).(Variable)>} bynode - карта отображения узлов на переменные
 */
function create(graph){
	if(Array.isArray(graph)){
		graph = joinGraphs(graph);
	}
	
	/**
	 *
	 * @var {Map<(Node).(Variable)>} - карта отображения узлов на переменные
	 * (VarNode).(Stub)
	 * (VarNode).(Variable)
	 * (VarNode).(Calculated)
	 * (CalcNode).(Calculated)
	 */
	let vars = new Map();
	
	/**
	 * @local
	 * @function getCalculate(calculator, edge) - найти переменную для узла-вычислителя с единственным результатом, или 
	 * создать зависимую переменную, извлекающую значение из узла-вычислителя с несколькими результатами
	 * @param {CalcNode} calculator - ссылка на узел-вычислитель
	 * @param {Edge} edge - ссылка на ребро, которое проводит значение от узла-вычислителя к потребителю
	 * @returned {Calculated}
	 */
	function getCalculate(calculator, edge){
		//@var {Calculated} calc
		let calc = getVariable(calculator);
		if(calculator.result.size === 1){
			return calc;
		}
		else{
			const index = calculator.keyOf(edge.variable);
			return new Calculated({calc}, calcIndex(index));
		}
	}
	
	/**
	 * @local
	 * @function factory(calculator) - создаёт переменную Calculated для данного CalcNode
	 * @param {CalcNode} calculator
	 * @returned {Calculated}
	 */
	function factory(calculator){
		let report = calculator.report();
		
		let func = calculator.factory(report.keys);
		
		/**
		 * @var {Object<HRK,Variable>} deps
		 */
		let deps = report.input.reduce((akk, [link, name])=>{
			akk[name] = getVariable(link);
			return akk;
		}, {});
		
		return new Calculated(deps, func);
	}
	
	/**
	 * @local
	 * @function getVariable(node) - найти или создать переменную для узла
	 * @param {Node} node - ссылка на узел
	 * @returned {Variable} - переменная, соответствующая узлу
	 * Добавляет переменные в vars
	 * (VarNode)=>(Stub|Calculated|Variable)
	 * (CalcNode)=>(Calculated)
	 */
	function getVariable(node){
		if(vars.has(node)){
			return vars.get(node);
		}
		else{ 
			let result;
			if(node instanceof VarNode){
				if(node.source === KNOWN_ENUM.SOURCE){
					//Создать заглушку
					//@var {Stub} result
					result = new Stub();
				}
				else if(node.source instanceof Abstract.Variable){
					//Взять существующую переменную
					//@var {Variable} result
					result = node.source;
				}
				else if(node.source instanceof Edge){
					//Получить переменную источника
					let edge = node.source, calculator = edge.calculator;
					//@var {Calculated} result
					result = getCalculate(calculator, edge);
				}
				else{
					throw Error('Invalid node source');
				}
				result.node = node;
			}
			else if(node instanceof CalcNode){
				//@var {Calculated} result
				result = factory(node);
			}
			vars.set(node, result);
			return result;
		}
	}
	
	// @var {Set<Variable>} input - набор входных переменных
	let input = new Set();
	for(let node of graph.nodes){
		let variable = getVariable(node);
		if(variable.node && variable.node.known === KNOWN_ENUM.SOURCE){
			input.add(variable);
		}
	}
	
	// @var {Set<Variable>} all - набор всех переменных
	let all = new Set(vars.values());

	return {
		input,
		all,
		bynode:vars
	};
}

module.exports = create;

