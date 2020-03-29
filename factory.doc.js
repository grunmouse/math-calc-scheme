/*
 * Требования к функциям factory и возвращаемым ими функциям, если используется createVariable
 */

/**
 * @typedef {Function<(Object<HRK.any>)=>(any)>} CalculateFunction
 * Функция, пригодная для передачи в конструктор Calculate
 */
 
/**
 * @typedef {Function<(Object<HRK.any>)=>(Object<HRK.any>|Array<any>)>} MultiCalculateFunction
 * @implements CalculateFunction
 * Функция, поддерживающая декомпозицию результата для использования в нескольких переменных
 */

/**
 * @typedef {Function<(string)=>(CalculateFunction)>} FactoryFunction
 * Функция для использования в качестве factory в CalcNode
 * Должна возвращать CalculateFunction если узел вычислился относительно одной переменной или MultiCalculateFunction - если относительно нескольких
 */