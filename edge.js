const {
	UNKNOWN,
	VARIABLE,
	CALCULATE,
	SOURCE
}  = require('./const.js');

const Hub = require('@grunmouse/hub');

/**
 * Дуга графа, соответствующая связи между узлом-переменной и узлом-калькулятором
 */
class Edge{
	/**
	 * @field {CalcNode} calculator - узел-калькулятор
	 * @field {VarNode} variable - узел-переменная
	 * @field {any} tag - произвольные данные для человекочитаемости результата
	 */
	
	constructor(calculator, variable, tag){
		this.calculator = calculator;
		this.variable = variable;
		this.tag = tag;
		this._type = UNKNOWN;
		this._hub = new Hub();

		calculator.addEdge(this);
		variable.addEdge(this);
	}
	/**
	 * Отражает происхождение значения, передаваемого по ребру
	 * UNKNOWN - значения нет, направление передачи не определено
	 * VARIABLE - значение берётся из переменной, передаётся в калькулятор
	 * CALCULATED - значение рассчитано калькулятором, передаётся в переменную
	 * @property {UNKNOWN|VARIABLE|CALCULATED} type
	 */
	get type(){
		return this._type;
	}
	set type(value){
		let old = this._type;
		this._type = value;
		this._toFired = {target:this, old:old, value:value};
		
		return value;
	}


	get prepared(){
		return !!this._toFired;
	}
	/**
	 * Публикует событие об изменении type (нужно для управления порядком генерации событий)
	 * @method fire
	 * @void
	 */
	fire(recursive){
		if(this._toFired){
			//console.log(this.toDOT());
			let ev = this._toFired;
			ev.recursive = recursive;
			this._toFired = undefined;
			this._hub.pub('type', ev);
			return true;
		}
		else{
			return false;
		}
	}
	
	/**
	 * Метод подписки на изменение type
	 * @method onType
	 * @param {Function} callback - обработчик события
	 * @returned {Function} - функция отписки
	 */
	onType(callback){
		return this._hub.sub('type', callback);
	}
	
	/** 
	 * @property {Array[2]<Node>} nodes - массив узлов, соединённых дугой
	 */
	get nodes(){
		return [this.variable, this.calculator];
	}
	
	/**
	 * @property {?Node} source - ссылка на узел-источник. undefined - для неопределённой дуги
	 */
	get source(){
		return {
			[VARIABLE]:this.variable,
			[CALCULATE]:this.calculator
		}[this._type];
	}

	/**
	 * @property {?Node} target - ссылка на узел-потребитель. undefined - для неопределённой дуги
	 */
	get target(){
		return {
			[VARIABLE]:this.calculator,
			[CALCULATE]:this.variable
		}[this._type];
	}
	
	/**
	 * @property {Boolean} - признак того, что дуга используется.
	 */
	get isUsed(){
		return this.variable.known !== UNKNOWN && this.calculator.known !== UNKNOWN && (
			/* Если источник - variable нужно проверить что переменная установлена не из этой дуги, 
				и что калькулятор используется и определился не в неё */
			this._type === VARIABLE && this.variable.source !== this && !this.calculator.result.has(this) && this.calculator.isUsed
			|| 
			/* Если источник - calculator, нужно проверить что калькулятор определился в эту дугу, а переменная - установлена из неё */
			this._type === CALCULATE && this.calculator.result.has(this) && this.variable.source === this
		);
	}
	
	/**
	 * @method toDOT
	 * Возвращает представление дуги в формате DOT
	 * @returned {String}
	 */
	toDOT(){
		if(this._type !== UNKNOWN){
			return '"' + this.source.dotName + '" -> "' + this.target.dotName + '"';
		}
		else{
			return '"' + this.variable.dotName + '" -> "' + this.calculator.dotName + '"[arrowhead=none]';
		}
	}
	
	getKey(){
		return this.calculator.keyOf(this.variable);
	}
}

module.exports = Edge;