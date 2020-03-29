/**
 * Набор с функцией удаления элемента с подсчётом оставшихся значений
 */
class DelCounter extends Set{
	
	/**
	 * @param {Int|Function<(DelCounter)=>(Boolean)>} count - количество, злементов, которое считается пороговым при удалении с подсчётом, или функция, которая проверяет достижение порога
	 * @param {Iterable} iterable - итерируемый объект, содержащий значения для инициализации
	 */
	constructor(count, iterable){
		iterable ? super(iterable) : super();
		this.count = count;
	}
	
	/**
	 * @private
	 * @method _control() - проверяет, достигнут ли порог
	 * @returned {Boolean}
	 */
	_control(){
		let count = this.count;
		if(typeof count === 'number'){
			return this.size <= this.count;
		}
		else if(typeof count === 'function'){
			return count(this);
		}
	}
	
	/**
	 * Удаляет элемент, возвращает признак того, достигнут ли порог
	 * @param item - удаляемый элемент
	 * @returned {Boolean}
	 */
	control(item){
		if(item){
			this.delete(item);
		}
		return this._control();
	}
	
	/**
	 * Методы итерации, аналогичные одноимённым методам массива
	 */
	some(callback, thisobject){
		return [...this].some(callback, thisobject);
	}
	every(callback, thisobject){
		return [...this].every(callback, thisobject);
	}
	map(callback, thisobject){
		return [...this].map(callback, thisobject);
	}
	
	/**
	 * Удаляет все элементы, подходящие под фильтр, после чего проверяет, достигнут ли порог
	 * @param {Function<(any)=>(Boolean)>} filter
	 * @returned {Boolean}
	 */
	controlByFilter(filter){
		let items = [...this].filter(filter);
		for(let item of items){
			this.delete(item);
		}
		return this._control();
	}
}

module.exports = DelCounter;