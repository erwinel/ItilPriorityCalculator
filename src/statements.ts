/// <reference path="./itilPriorityCalculator.ts"/>

/**
 * Module for calculation statements.
 * @module itilPriorityCalculator
 */
namespace statements {
    'use strict';

    /**
     * This is an enumeration of string values that is bound to a {@link HTMLSelectElement} tag, allowing the user to
     * select the whole number rounding method to use when convering the calculation result to a whole number.
     * Each {@link HTMLOptionElement} is bound to an element in the {@link IMainControllerScope#roundingOptions} array.
     * @export
     * @readonly
     * @enum {string}
     * @summary Represents a whole-number rounding type.
     */
    export enum RoundingType {
        /** Uses {@link Math.ceil} to round numbers up. */
        ceiling = "ceiling",

        /** Uses {@link Math.floor} to round numbers down. */
        floor = "floor",

        /** Uses {@link Math.round} to round numbers to the nearest whole number. */
        nearest = "nearest"
    }

    /**
     * Determines whether a value is a {@link RoundingType} value.
     * @export
     * @param {*} value - The value to test
     * @return {boolean} true if the value is a {@link RoundingType} enum value; otherwise, false.
     */
    export function isRoundingType(value: any): value is RoundingType {Math.round
        return typeof value === 'string' && (value === RoundingType.ceiling || value === RoundingType.floor || value === RoundingType.nearest);
    }

    /**
     * This is an enumeration of string values that is bound to a {@link HTMLSelectElement} tag, allowing the user to select the basic priority calculation algorithm.
     * @export
     * Each {@link HTMLOptionElement} is bound to an element in the {@link IMainControllerScope#baseFormulaOptions} array.
     * @readonly
     * @enum {string}
     * @summary Represents a basic priority calculation algorithm.
     */
     export enum BaseFormulaType {
        /** The {@link IBasicPriorityCalculationResult#priority} value is derived using the '{@link ICalculationContext#urgency} * {@link ICalculationContext#impact}' algorithm. */
        multiply = "multiply",

        /** The {@link IBasicPriorityCalculationResult#priority} value is derived using the '{@link ICalculationContext#urgency} + {@link ICalculationContext#impact}' algorithm. */
        add = "add",

        /** The {@link IBasicPriorityCalculationResult#priority} value is derived using the '({@link ICalculationContext#urgency} * {@link ICalculationContext#impact}) + {@link ICalculationContext#urgency} + {@link ICalculationContext#impact}' algorithm. */
        multiplyAdd = "multiplyAdd",

        /** The {@link IBasicPriorityCalculationResult#priority} value is derived using the '({@link ICalculationContext#urgency} + {@link ICalculationContext#impact}) * {@link ICalculationContext#urgency} * {@link ICalculationContext#impact}' algorithm. */
        addMultiply = "addMultiply"
    }

    /**
     * Determines whether a value is a {@link BaseFormulaType} value.
     * @export
     * @param {*} value - The value to test
     * @returns {boolean} true if the value is a {@link BaseFormulaType} enum value; otherwise, false.
     */
     export function isBaseFormulaType(value: any): value is BaseFormulaType {
        return typeof value === 'string' && (value === BaseFormulaType.multiply || value === BaseFormulaType.add || value === BaseFormulaType.multiplyAdd || value === BaseFormulaType.addMultiply);
    }

    /**
     * Defines a function that retrieves a value from a context object.
     * @export
     * @template C - The type of contextual object that is used in obtaining the return value.
     * @template V - The type of return value.
     */
    export interface IValueAccessor<C, V> {
        /**
         * References a contextual object to produce a value.
         * @param {C} context - The contextual object that is referenced to produce the result value.
         * @return {V} The value obtained from the contextual object.
         * @memberof IValueAccessor
         */
        (context: C): V;
    }

    /**
     * This is a regular expression that matches a non-empty string that contains only letters, numbers and underscore characters, where the first character is either a letter or an underscore character.
     * @constant
     * @type {RegExp}
     * @see isValidVariableName
     * @see IVariableStatement#name
     * @summary Matches a valid variable name
     */
    const variableNameRegExp: RegExp = /^[a-z_][a-z_\d]*$/i;

    /**
     * This indicates whether a string value can represent the name of a variable. A valid name is not null or empty and contains only letters, numbers and/or underscore characters,
     * with the first character being either a letter or an underscore character.
     * @export
     * @param {string} [name] - the string value to test.
     * @return {boolean} true if the string is a valid variable name; otherwise, false.
     * @summary Indicates whether a specified string represents a valid variable name.
     * @see IVariableStatement#name
     * @see variableNameRegExp
     */
     export function isValidVariableName(name?: string) { return typeof name === 'string' && variableNameRegExp.test(name); }

    /**
     * Enumeration to represent calculation operators.
     * @export
     * @readonly
     * @enum {number}
     */
     export enum Operator {
        /** Represents an addition operator. */
        add,
        
        /** Represents a subtraction operator. */
        subtract,
        
        /** Represents a multiplication operator. */
        multiply,
        
        /** Represents a division operator. */
        divide,
        
        /** Represents a logical AND operator. */
        and,
        
        /** Represents a logical OR operator. */
        or
    }

    /**
     * {@link Operator} values representing logical operators.
     * @export
     * @type
     */
     export type LogicalOperator = Operator.and | Operator.or;

    /**
     * {@link Operator} values representing mathematical operators.
     * @export
     * @type
     */
     export type MathOperator = Exclude<Operator, LogicalOperator>;

    /**
     * Determines whether a value is a {@link LogicalOperator} value.
     * @export
     * @param {number} [value] - The value to test.
     * @return {boolean} true if the value is a {@link LogicalOperator} enum value; otherwise, false.
     */
    export function isMathOperator(value?: number): value is MathOperator {
        return typeof value === 'number' && (value === Operator.add || value === Operator.multiply || value === Operator.divide);
    }

    /**
     * Interface that is common to all calculation statements.
     * @export
     * @interface ICalculationStatement
     * @template C The type of contextual object can be referenced during evaluation.
     * @template V The type of value returned by this statement.
     */
    export interface ICalculationStatement<C, V> {
        /**
         * Executes the current statement.
         * @param {C} context - The contextual object that can be referenced during statement evaluation.
         * @memberof ICalculationStatement
         * @return {V} The return value of the statement.
         */
        evaluate(context: C): V;
        
        /**
         * Gets a string representation of the current statement.
         * @return {string} A JavaScript string representation of the current statement.
         * @memberof ICalculationStatement
         */
        toString(): string;
    }

    /**
     * Interface for calculation statements that return a numerical value.
     * @export
     * @interface INumericalStatement
     * @extends {ICalculationStatement<C, number>}
     * @template C The type of contextual object can be referenced during evaluation.
     * @see NumericalLiteral<C>
     */
    export interface INumericalStatement<C> extends ICalculationStatement<C, number> { }

    /**
     * Interface for calculation statements that return a boolean value.
     * @export
     * @interface IBooleanStatement
     * @extends {ICalculationStatement<C, boolean>}
     * @template C The type of contextual object can be referenced during evaluation.
     * @see BooleanLiteral<C>
     */
    export interface IBooleanStatement<C> extends ICalculationStatement<C, boolean> { }

    /**
     * Interface for calculation statements that refer to a variable.
     * @export
     * @interface IVariableStatement
     * @extends {ICalculationStatement<C, V>}
     * @template C The type of contextual object that is used in obtaining the value of the variable.
     * @template V The type of the referenced variable.
     */
    export interface IVariableStatement<C, V> extends ICalculationStatement<C, V> {
        /**
         * Gets the name of the variable.
         * @return {string} The name of the variable represented by this statement.
         * @memberof IVariableStatement
         */
        get name(): string;

        /**
         * Gets the function that obtains the value of the variable using a specified context object.
         * @return {IValueAccessor<C, V>} A function that obtains the value of the variable using a specified context object.
         * @memberof IVariableStatement
         */
        get accessor(): IValueAccessor<C, V>;
    }

    /**
     * Interface for calculation statements that contain a literal value.
     * @export
     * @interface ILiteralStatement
     * @extends {ICalculationStatement<C, V>}
     * @template C The type of context object associated with statement evaluation.
     * @template V The type of the literal value.
     * @see NumericalLiteral<C>
     * @see BooleanLiteral<C>
     */
    export interface ILiteralStatement<C, V> extends ICalculationStatement<C, V> {
        /**
         * Gets the literal value.
         * @return {V} The literal value contained by this statement.
         * @memberof ILiteralStatement
         */
        get value(): V;
    }

    export interface ICompoundStatement<C, V, T extends ICalculationStatement<C, V>> extends ICalculationStatement<C, V>, Iterable<T> {
        readonly id: Symbol;

        /**
         * Gets the number of statements contained by this compound statement.
         * @return {number} The number of individual statements that make up this compound statement.
         * @memberof ICompoundStatement
         */
        get length(): number;
        
        /**
         * Gets the inner statement at the specified index.
         * @return {T} The inner statement at the specified index.
         * @memberof ICompoundStatement
         * @throws {RangeError} index is less than zero or greater than the number of statements that make up this compound statement.
         */
        get(index: number): T;
    }

    function getNestedStatementById<C>(id: symbol, target: ICompoundStatement<C, any, any>, includeSelf: boolean = false): ICompoundStatement<C, any, any> | undefined {
        if (includeSelf && target.id == id) return target;
        for (var item of target) {
            if (isCompoundStatement(item)) {
                var result: ICompoundStatement<C, any, any> | undefined = getNestedStatementById<C>(id, item, true);
                if (typeof result != undefined) return result;
            }
        }
    }
    /**
     * Determines whether a statement is a compound statement.
     * @export
     * @param {ICalculationStatement<C, V>} [statement] - The statement to test.
     * @return {boolean} true if the object is a {@link ICompoundStatement}; otherwise, false.
     */
    export function isCompoundStatement<C, V, T extends ICalculationStatement<C, V>>(statement?: ICalculationStatement<C, V>): statement is ICompoundStatement<C, V, T> {
        return typeof statement === 'object' && statement != null && typeof statement[Symbol.iterator] === 'function';
    }

    export interface IOperationStatement<C, V, T extends ICalculationStatement<C, V>> extends ICompoundStatement<C, V, T> {
        /**
         * Gets the mathematical operation type.
         * @return {Operator} A value indicating the calculation operation that this statement represents.
         * @memberof IOperationStatement
         */
        get operator(): Operator;

        /**
         * Gets the operand to the left of the operator.
         * @return {ICalculationStatement<C, V>} The statement representing the left-side operand.
         * @memberof IOperationStatement
         */
        get lOperand() : ICalculationStatement<C, V>;

        /**
         * Gets the operand to the right of the operator.
         * @return {ICalculationStatement<C, V>} The statement representing the right-side operand.
         * @memberof IOperationStatement
         */
        get rOperand() : ICalculationStatement<C, V>;
    }

    /**
     * Determines whether a statement is a numerical operation statement.
     * @export
     * @param {ICompoundStatement<C, number, INumericalStatement<C>>} [statement] - The statement to test.
     * @return {boolean} true if the object is a {@link INumericalOperationStatement}; otherwise, false.
     */
     export function isNumericalOperationStatement<C>(statement?: ICompoundStatement<C, number, INumericalStatement<C>>): statement is INumericalOperationStatement<C> {
        return typeof statement === 'object' && statement != null && isMathOperator((<INumericalOperationStatement<C>>statement).operator);
    }

    interface IOperationFlattenResult<C> { left: INumericalStatement<C>; right: INumericalStatement<C>; wasFlattened: boolean; }

    /**
     * Interface representing a mathematical operation on two or more operands.
     * @export
     * @interface INumericalOperationStatement
     * @extends {INumericalStatement<C>}
     * @template C The type of contextual object can be referenced during evaluation.
     */
    export interface INumericalOperationStatement<C> extends INumericalStatement<C>, IOperationStatement<C, number, INumericalStatement<C>> {
        /**
         * Gets the mathematical operation type.
         * @return {MathOperator} A value indicating the mathematical operation that this statement represents.
         * @memberof INumericalOperationStatement
         */
        get operator(): MathOperator;

        /**
         * Gets the operand to the left of the operator.
         * @return {INumericalStatement<C>} The statement representing the left-side operand.
         * @memberof INumericalOperationStatement
         */
        get lOperand() : INumericalStatement<C>;

        /**
         * Gets the operand to the right of the operator.
         * @return {INumericalStatement<C>} The statement representing the right-side operand.
         * @memberof INumericalOperationStatement
         */
        get rOperand() : INumericalStatement<C>;
    }

    /**
     * Interface for ternary statements.
     * @export
     * @interface ITernaryStatement
     * @extends {ICalculationStatement<C, V>}
     * @template C The type of contextual object can be referenced during evaluation.
     * @template V The type of value returned by this statement.
     */
    export interface ITernaryStatement<C, V, T extends ICalculationStatement<C, V>> extends ICompoundStatement<C, (V | boolean), (IBooleanStatement<C> | T)> {
        /**
         * Gets the conditional statement for the ternary operation.
         * @return {LogicalOperator} The statement that returns a boolean value that is used as the conditional for the ternary operation.
         * @memberof ITernaryStatement
         */
        get conditional(): IBooleanStatement<C>;
        
        /**
         * Gets the statement that is evaluated when the conditional statement returns true.
         * @return {LogicalOperator} The statement that is evaluated when the conditional statement returns true.
         * @memberof ITernaryStatement
         */
        get ifTrueStatement(): ICalculationStatement<C, V>;
        
        /**
         * Gets the statement that is evaluated when the conditional statement returns false.
         * @return {LogicalOperator} The statement that is evaluated when the conditional statement returns false.
         * @memberof ITernaryStatement
         */
        get otherwiseStatement(): ICalculationStatement<C, V>;
    }

    /**
     * Interface for statements representing a logical operation on two or more operands.
     * @export
     * @interface ILogicalOperationStatement
     * @extends {IBooleanStatement<C>}
     * @template C The type of contextual object can be referenced during evaluation.
     */
    export interface ILogicalOperationStatement<C> extends IBooleanStatement<C>, IOperationStatement<C, boolean, IBooleanStatement<C>> {
        /**
         * Gets the logical operation type.
         * @return {LogicalOperator} A value indicating the logical operation that this statement represents.
         * @memberof ILogicalOperationStatement
         */
        get operator(): LogicalOperator;

        /**
         * Gets the operand to the left of the operator.
         * @return {IBooleanStatement<C>} The statement representing the left-side operand.
         * @memberof ILogicalOperationStatement
         */
        get lOperand() : IBooleanStatement<C>;

        /**
         * Gets the operand to the right of the operator.
         * @return {IBooleanStatement<C>} The statement representing the right-side operand.
         * @memberof ILogicalOperationStatement
         */
        get rOperand() : IBooleanStatement<C>;
    }

    /**
     * Concrete class for a statement that returns a literal numerical value.
     * @export
     * @class NumericalLiteral
     * @implements {INumericalStatement<C>}
     * @implements {ILiteralStatement<C, number>}
     * @template C The type of context object associated with statement evaluation.
     */
    export class NumericalLiteral<C> implements INumericalStatement<C>, ILiteralStatement<C, number> {
        /**
         * Creates an instance of NumericalLiteral.
         * @param {number} _value - The literal numeric value.
         * @memberof NumericalLiteral
         * @throws {TypeError} - Value is undefined, null, NaN, or not a number type.
         */
        constructor(private readonly _value: number) {
            if (typeof _value !== 'number' || isNaN(_value)) throw new TypeError("Value is not a valid number.");
        }
        
        /**
         * Gets the literal value contained by this statement.
         * @readonly
         * @type {number}
         * @memberof NumericalLiteral
         */
        get value(): number { return this._value; }

        /**
         * Evaluates the current expression, simply returning the literal value.
         * @param {C} context - The contextual object that is associatd with statement evaluation.
         * @return {number} The literal value contained by this statement.
         * @memberof NumericalLiteral
         */
        evaluate(context: C): number { return this._value; }

        /**
         * Gets a string value of the current literal value.
         * @return {string} A string value of the current literal value, using {@link JSON.stringify}.
         * @memberof NumericalLiteral
         */
        toString(): string { return JSON.stringify(this._value); }

        /**
         * Returns a copy of this statement with the literal value negated.
         * @return {NumericalLiteral<C>} A literal numerical statement where the value has been multiplied by -1.
         * @memberof NumericalLiteral
         */
        asNegated(): NumericalLiteral<C> {
            return (this._value == 0) ? this : new NumericalLiteral<C>(this._value * -1);
        }
    }

    function isNumericalLiteral<C>(value: INumericalStatement<C>) : value is NumericalLiteral<C> {
        return typeof value === 'object' && value != null && value instanceof NumericalLiteral;
    }
    
    /**
     * Concrete class for a statement that represents a numerical variable.
     * @export
     * @class NumericalVariable
     * @implements {INumericalStatement<C>}
     * @implements {IVariableStatement<C, number>}
     * @template C The type of context object is used for retrieving the value of the variable.
     */
    export class NumericalVariable<C> implements INumericalStatement<C>, IVariableStatement<C, number> {
        /**
         * Creates an instance of NumericalVariable.
         * @param {string} _name - The name of the variable to be represented.
         * @param {IValueAccessor<C, number>} _accessor - The function that returns the value of the variable, given the specified context object.
         * @memberof NumericalVariable
         * @throws {TypeError} - The accessor function is undefined or null or the variable name is undefined, null, not a string type or is not a valid variable name.
         */
        constructor(private readonly _name: string, private readonly _accessor: IValueAccessor<C, number>) {
            if (!isValidVariableName(_name)) throw new TypeError("Name parameter does not contain a valid variable name.");
            if (typeof _accessor !== 'function') throw new TypeError("Accessor parameter is not a function.");
        }
        
        /**
         * Gets the name of the variable.
         * @return {string} The name of the variable represented by this statement.
         * @memberof NumericalVariable
         */
        get name(): string { return this._name; }

        /**
         * Gets the function that obtains the value of the variable using a specified context object.
         * @return {IValueAccessor<C, number>} A function that obtains the value of the variable using a specified context object.
         * @memberof NumericalVariable
         */
        get accessor(): IValueAccessor<C, number> { return this._accessor; }

        /**
         * Evaluates the current expression by invoking the {@link #accessor}.
         * @param {C} context - The contextual object that is used to get the value of the variable being represented.
         * @return {number} The value returned by the {@link #accessor} function.
         * @memberof NumericalLiteral
         */
        evaluate(context: C): number { return this._accessor(context); }

        /**
         * Gets a string representation of the current statement, which is the name of the variable.
         * @return {string} The name of the variable.
         * @memberof NumericalVariable
         */
        toString(): string { return this._name; }

        /**
         * Creates a new {@link NumericalVariable} to reference the {@link ICalculationContext#urgency} property.
         * @static
         * @template T The type of object that contains the {@link ICalculationContext#urgency} property.
         * @return {NumericalVariable<T>} A statement object representing the {@link ICalculationContext#urgency} property.
         * @memberof NumericalVariable
         */
        static createForUrgency<T extends ICalculationContext>(): NumericalVariable<T> { return new NumericalVariable("urgency", function(context: T) { return context.urgency; }); }
        
        /**
         * Creates a new {@link NumericalVariable} to reference the {@link ICalculationContext#impact} property.
         * @static
         * @template T The type of object that contains the {@link ICalculationContext#impact} property.
         * @return {NumericalVariable<T>} A statement object representing the {@link ICalculationContext#impact} property.
         * @memberof NumericalVariable
         */
        static createForImpact<T extends ICalculationContext>(): NumericalVariable<T> {
            return new NumericalVariable("impact", function(context: T) { return context.impact; });
        }
    }
    
    /**
     * Concrete class for a multiplication statement.
     * @export
     * @class Product
     * @implements {INumericalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    export class Product<C> implements INumericalOperationStatement<C> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<INumericalStatement<C>> { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length(): number { return 2; }
        get operator(): MathOperator { return Operator.multiply; }

        /**
         * Gets the operand being multiplied.
         * @return {INumericalStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Product
         */
        get lOperand(): INumericalStatement<C> { return this._lOperand; }
        
        /**
         * Gets the operand that the first operand is being being multiplied by.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Product
         */
        get rOperand(): INumericalStatement<C> { return this._rOperand; }
        
        constructor(private readonly _lOperand: INumericalStatement<C>, private readonly _rOperand: INumericalStatement<C>) {
            if (typeof _lOperand === 'undefined' || _lOperand == null) throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null) throw new TypeError("Invalid right operand.");
        }
        
        get(index: number): INumericalStatement<C> {
            switch (index) {
                case 0:
                    return this._lOperand;
                case 1:
                    return this._rOperand;
                default:
                    throw new RangeError("Index out of range.");
            }
        }

        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof Product
         */
        evaluate(context: C): number { return this._lOperand.evaluate(context) * this._rOperand.evaluate(context); }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Product
         */
        toString(): string {
            return (
                (isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Product) && this._lOperand.length > 1) ? "(" + this._lOperand.toString() + ")" : this._lOperand.toString()
            ) + " * " + (
                (isCompoundStatement(this._rOperand) && !(this._rOperand instanceof Product) && this._rOperand.length > 1) ? "(" + this._rOperand.toString() + ")" : this._rOperand.toString()
            );
        }
    }

    /**
     * Concrete class for a division statement.
     * @export
     * @class Quotient
     * @implements {INumericalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    export class Quotient<C> implements INumericalOperationStatement<C> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<INumericalStatement<C>> { return [this._dividend, this._divisor][Symbol.iterator](); }
        get length(): number { return 2; }
        get lOperand(): INumericalStatement<C> { return this._dividend; }
        get operator(): MathOperator { return Operator.divide; }
        get rOperand(): INumericalStatement<C> { return this._divisor; }

        /**
         * Gets the statement representing the dividend.
         * @return {INumericalStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Quotient
         */
        get dividend(): INumericalStatement<C> { return this._dividend; }
        
        /**
         * Gets the statement representing the divisor.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Quotient
         */
        get divisor(): INumericalStatement<C> { return this._divisor; }
        
        constructor(private readonly _dividend: INumericalStatement<C>, private readonly _divisor: INumericalStatement<C>) {
            if (typeof _dividend === 'undefined' || _dividend == null) throw new TypeError("Invalid dividend.");
            if (typeof _divisor === 'undefined' || _divisor == null) throw new TypeError("Invalid divisor.");
            if (isNumericalLiteral(_divisor) && _divisor.value == 0) throw new EvalError("Divisor cannot be a literal zero value.");
        }

        /**
         * Evaluates the current expression by dividing the results of the first operand evaluation by that of second, then sequentially dividing the result
         * with the result of each remaining operation evaluation.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The quotient of the division operation.
         * @memberof Quotient
         */
        evaluate(context: C): number { return this._dividend.evaluate(context) / this._divisor.evaluate(context); }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Quotient
         */
        toString(): string {
            return (
                (isCompoundStatement(this._dividend) && !(this._dividend instanceof Quotient) && this._dividend.length > 1) ? "(" + this._dividend.toString() + ")" : this._dividend.toString()
            ) + " / " + (
                (isCompoundStatement(this._divisor) && !(this._divisor instanceof Quotient) && this._divisor.length > 1) ? "(" + this._divisor.toString() + ")" : this._divisor.toString()
            );
        }
        
        get(index: number): INumericalStatement<C> {
            switch (index) {
                case 0:
                    return this._dividend;
                case 1:
                    return this._divisor;
                default:
                    throw new RangeError("Index out of range.");
            }
        }
    }

    /**
     * Concrete class for an addition statement.
     * @export
     * @class Sum
     * @implements {INumericalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    export class Sum<C> implements INumericalOperationStatement<C> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<INumericalStatement<C>> { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length(): number { return 2; }
        get operator(): MathOperator { return Operator.add; }
        
        /**
         * Gets the operand representing the first value being added.
         * @return {INumericalStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Sum
         */
        get lOperand(): INumericalStatement<C> { return this._lOperand; }
        
        /**
         * Gets the operand representing the second value being added.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Sum
         */
        get rOperand(): INumericalStatement<C> { return this._rOperand; }

        constructor(private readonly _lOperand: INumericalStatement<C>, private readonly _rOperand: INumericalStatement<C>) {
            if (typeof _lOperand === 'undefined' || _lOperand == null) throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null) throw new TypeError("Invalid right operand.");
        }

        /**
         * Evaluates the current expression by adding the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The sum of all the evaluated operand values.
         * @memberof Sum
         */
        evaluate(context: C): number { return this._lOperand.evaluate(context) + this._rOperand.evaluate(context); }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Sum
         */
        toString(): string {
            if (isCompoundStatement(this._rOperand)) {
                if (this._rOperand.length > 1) {
                    if (this._rOperand instanceof Sum || this._rOperand instanceof Difference) {
                        if (isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) {
                            if (isNumericalLiteral(this._rOperand.lOperand) && this._rOperand.lOperand.value < 0)
                                return "(" + this._lOperand.toString() + ") - " + normalizers.negateLiteral(this._rOperand.lOperand).toString();
                            return "(" + this._lOperand.toString() + ") + " + this._rOperand.toString();
                        }

                        if (isNumericalLiteral(this._rOperand.lOperand) && this._rOperand.lOperand.value < 0)
                            return this._lOperand.toString() + " - " + normalizers.negateLiteral(this._rOperand.lOperand).toString();
                        return this._lOperand.toString() + " + " + this._rOperand.toString();
                    }
                    return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                        "(" + this._lOperand.toString() + ") + (" : this._lOperand.toString() + " + (") + this._rOperand.toString() + ")";
                }
            } else if (isNumericalLiteral(this._rOperand) && this._rOperand.value < 0)
                return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                    "(" + this._lOperand.toString() + ") - " : this._lOperand.toString() + " - ") + JSON.stringify(this._rOperand.value * -1) + ")";
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                "(" + this._lOperand.toString() + ") + " : this._lOperand.toString() + " + ") + this._rOperand.toString();
        }
        
        get(index: number): INumericalStatement<C> {
            switch (index) {
                case 0:
                    return this._lOperand;
                case 1:
                    return this._rOperand;
                default:
                    throw new RangeError("Index out of range.");
            }
        }
    }

    /**
     * Concrete class for a subtraction statement.
     * @export
     * @class Difference
     * @implements {INumericalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    export class Difference<C> implements INumericalOperationStatement<C> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<INumericalStatement<C>> { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length(): number { return 2; }
        get operator(): MathOperator { return Operator.subtract; }

        /**
         * Gets the operand representing the value being subtracted from.
         * @return {INumericalStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Difference
         */
        get lOperand(): INumericalStatement<C> { return this._lOperand; }
        
        /**
         * Gets the operand representing the value being deducted.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Difference
         */
        get rOperand(): INumericalStatement<C> { return this._rOperand; }

        constructor(private readonly _lOperand: INumericalStatement<C>, private readonly _rOperand: INumericalStatement<C>) {
            if (typeof _lOperand === 'undefined' || _lOperand == null) throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null) throw new TypeError("Invalid right operand.");
        }

        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof Difference
         */
        evaluate(context: C): number { return this._lOperand.evaluate(context) - this._rOperand.evaluate(context); }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Difference
         */
        toString(): string {
            if (isCompoundStatement(this._rOperand)) {
                if (this._rOperand.length > 1) {
                    if (this._rOperand instanceof Sum || this._rOperand instanceof Difference) {
                        if (isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) {
                            if (isNumericalLiteral(this._rOperand.lOperand) && this._rOperand.lOperand.value < 0)
                                return "(" + this._lOperand.toString() + ") + " + normalizers.negateLiteral(this._rOperand.lOperand).toString();
                            return "(" + this._lOperand.toString() + ") - " + this._rOperand.toString();
                        }

                        if (isNumericalLiteral(this._rOperand.lOperand) && this._rOperand.lOperand.value < 0)
                            return this._lOperand.toString() + " + " + normalizers.negateLiteral(this._rOperand.lOperand).toString();
                        return this._lOperand.toString() + " - " + this._rOperand.toString();
                    }
                    return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                        "(" + this._lOperand.toString() + ") - (" : this._lOperand.toString() + " - (") + this._rOperand.toString() + ")";
                }
            } else if (isNumericalLiteral(this._rOperand) && this._rOperand.value < 0)
                return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                    "(" + this._lOperand.toString() + ") + " : this._lOperand.toString() + " + ") + JSON.stringify(this._rOperand.value * -1) + ")";
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                "(" + this._lOperand.toString() + ") - " : this._lOperand.toString() + " - ") + this._rOperand.toString();
        }
        
        get(index: number): INumericalStatement<C> {
            switch (index) {
                case 0:
                    return this._lOperand;
                case 1:
                    return this._rOperand;
                default:
                    throw new RangeError("Index out of range.");
            }
        }
    }

    export class Round<C> implements INumericalStatement<C>, ICompoundStatement<C, number, INumericalStatement<C>> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<INumericalStatement<C>, any, undefined> { return [this._statement][Symbol.iterator](); }
        get length(): number { return 1; }

        constructor(private readonly _type: RoundingType, private readonly _statement: INumericalStatement<C>) {
            if (!isRoundingType(_type)) throw new TypeError("Rounding type is invalid.");
            if (typeof _statement === 'undefined' || _statement == null) throw new TypeError("Statement operator is invalid.");
        }

        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof Round
         */
        evaluate(context: C): number {
            switch (this._type) {
                case RoundingType.ceiling:
                    return Math.ceil(this._statement.evaluate(context));
                case RoundingType.floor:
                    return Math.floor(this._statement.evaluate(context));
                default:
                    return Math.round(this._statement.evaluate(context));
            }
        }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Round
         */
        toString(): string {
            return ((this._type == RoundingType.nearest) ? "Math.round(" : "Math." + this._type + "(") + this._statement.toString()  + ")";
        }

        get(index: number): INumericalStatement<C> {
            if (index != 0) throw new RangeError("Index out of range.");
            return this._statement;
        }
    }

    /**
     * Concrete class for a statement that returns a literal boolean value.
     * @export
     * @class BooleanLiteral
     * @implements {IBooleanStatement<C>}
     * @implements {ILiteralStatement<C, boolean>}
     * @template C The type of context object associated with statement evaluation.
     */
    export class BooleanLiteral<C> implements IBooleanStatement<C>, ILiteralStatement<C, boolean> {
        /**
         * Creates an instance of BooleanLiteral.
         * @param {boolean} _value - The literal boolean value.
         * @memberof BooleanLiteral
         * @throws {TypeError} - Value is undefined, null, or not a boolean type.
         */
        constructor(private readonly _value: boolean) {
            if (typeof _value !== 'boolean') throw new TypeError("Value is not a boolean type.");
        }
        
        /**
         * Gets the literal value contained by this statement.
         * @readonly
         * @type {boolean}
         * @memberof BooleanLiteral
         */
        get value(): boolean { return this._value; }

        /**
         * Evaluates the current expression, simply returning the literal value.
         * @param {C} context - The contextual object that is associatd with statement evaluation.
         * @return {boolean} The literal value contained by this statement.
         * @memberof BooleanLiteral
         */
        evaluate(context: C): boolean { return this._value; }

        /**
         * Gets a string value of the current literal value.
         * @return {string} A string value of the current literal value, using {@link JSON.stringify}.
         * @memberof BooleanLiteral
         */
        toString(): string { return JSON.stringify(this._value); }
    }

    function isBooleanLiteral<C>(value: IBooleanStatement<C>) : value is BooleanLiteral<C> { return typeof value === 'object' && value != null && value instanceof BooleanLiteral; }
    
    /**
     * Concrete class for a statement that represents a boolean variable.
     * @export
     * @class BooleanVariable
     * @implements {IBooleanStatement<C>}
     * @implements {IVariableStatement<C, boolean>}
     * @template C The type of context object is used for retrieving the value of the variable.
     */
    export class BooleanVariable<C> implements IBooleanStatement<C>, IVariableStatement<C, boolean> {
        /**
         * Creates an instance of BooleanVariable.
         * @param {string} _name - The name of the variable to be represented.
         * @param {IValueAccessor<C, boolean>} _accessor - The function that returns the value of the variable, given the specified context object.
         * @memberof BooleanVariable
         * @throws {TypeError} - The accessor function is undefined or null or the variable name is undefined, null, not a string type or is not a valid variable name.
         */
        constructor(private readonly _name: string, private readonly _accessor: IValueAccessor<C, boolean>) {
            if (!isValidVariableName(_name)) throw new TypeError("Name parameter does not contain a valid variable name.");
            if (typeof _accessor !== 'function') throw new TypeError("Accessor parameter is not a function.");
        }
        
        /**
         * Gets the name of the variable.
         * @return {string} The name of the variable represented by this statement.
         * @memberof BooleanVariable
         */
        get name(): string { return this._name; }

        /**
         * Gets the function that obtains the value of the variable using a specified context object.
         * @return {IValueAccessor<C, boolean>} A function that obtains the value of the variable using a specified context object.
         * @memberof BooleanVariable
         */
        get accessor(): IValueAccessor<C, boolean> { return this._accessor; }

        /**
         * Evaluates the current expression by invoking the {@link #accessor}.
         * @param {C} context - The contextual object that is used to get the value of the variable being represented.
         * @return {boolean} The value returned by the {@link #accessor} function.
         * @memberof BooleanVariable
         */
        evaluate(context: C): boolean { return this._accessor(context); }

        /**
         * Gets a string representation of the current statement, which is the name of the variable.
         * @return {string} The name of the variable.
         * @memberof BooleanVariable
         */
        toString(): string { return this._name; }
        
        /**
         * Creates a new {@link BooleanVariable} to reference the {@link IVipCalculationContext#vip} property.
         * @static
         * @template T The type of object that contains the {@link IVipCalculationContext#vip} property.
         * @return {BooleanVariable<T>} A statement object representing the {@link IVipCalculationContext#vip} property.
         * @memberof BooleanVariable
         */
        static createForVip<T extends IVipCalculationContext>(): BooleanVariable<T> {
            return new BooleanVariable("vip", function(context: T) { return context.vip; });
        }
        
        /**
         * Creates a new {@link BooleanVariable} to reference the {@link IBusinessRelatedCalculationContext#businessRelated} property.
         * @static
         * @template T The type of object that contains the {@link IBusinessRelatedCalculationContext#businessRelated} property.
         * @return {BooleanVariable<T>} A statement object representing the {@link IBusinessRelatedCalculationContext#businessRelated} property.
         * @memberof BooleanVariable
         */
        static createForBusinessRelated<T extends IBusinessRelatedCalculationContext>(): BooleanVariable<T> {
            return new BooleanVariable("businessRelated", function(context: T) { return context.businessRelated; });
        }
    }

    /**
     * Concrete class for a logical AND statement.
     * @export
     * @class And
     * @implements {ILogicalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    export class And<C> implements ILogicalOperationStatement<C> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<IBooleanStatement<C>> { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length(): number { return 2; }
        get operator(): LogicalOperator { return Operator.and; }

        /**
         * Gets the operand representing the first value in the logical operation.
         * @return {IBooleanStatement<C>} The statement representing the value to the left of the operator.
         * @memberof And
         */
        get lOperand(): IBooleanStatement<C> { return this._lOperand; }
        
        /**
         * Gets the operand representing the second value in the logical operation.
         * @return {IBooleanStatement<C>} The statement representing the value to the right of the operator.
         * @memberof And
         */
        get rOperand(): IBooleanStatement<C> { return this._rOperand; }

        constructor(private readonly _lOperand: IBooleanStatement<C>, private readonly _rOperand: IBooleanStatement<C>) {
            if (typeof _lOperand === 'undefined' || _lOperand == null) throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null) throw new TypeError("Invalid right operand.");
        }

        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof And
         */
        evaluate(context: C): boolean { return this._lOperand.evaluate(context) && this._rOperand.evaluate(context); }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof And
         */
        toString(): string {
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof And)) ? "(" + this._lOperand.toString() + ")" : this._lOperand.toString()) + " && " +
            ((isCompoundStatement(this._rOperand) && !(this._rOperand instanceof And)) ? "(" + this._rOperand.toString() + ")" : this._rOperand.toString());
        }
        
        get(index: number): IBooleanStatement<C> {
            switch (index) {
                case 0:
                    return this._lOperand;
                case 1:
                    return this._rOperand;
                default:
                    throw new RangeError("Index out of range.");
            }
        }
    }
    
    /**
     * Concrete class for a logical OR statement.
     * @export
     * @class Or
     * @implements {ILogicalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    export class Or<C> implements ILogicalOperationStatement<C> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<IBooleanStatement<C>> { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length(): number { return 2; }
        get operator(): LogicalOperator { return Operator.or; }

        /**
         * Gets the operand representing the first value in the logical operation.
         * @return {IBooleanStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Or
         */
        get lOperand(): IBooleanStatement<C> { return this._lOperand; }
        
        /**
         * Gets the operand representing the second value in the logical operation.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Or
         */
        get rOperand(): IBooleanStatement<C> { return this._rOperand; }

        constructor(private readonly _lOperand: IBooleanStatement<C>, private readonly _rOperand: IBooleanStatement<C>) {
            if (typeof _lOperand === 'undefined' || _lOperand == null) throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null) throw new TypeError("Invalid right operand.");
        }

        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof Or
         */
        evaluate(context: C): boolean { return this._lOperand.evaluate(context) || this._rOperand.evaluate(context); }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Or
         */
        toString(): string {
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Or)) ? "(" + this._lOperand.toString() + ")" : this._lOperand.toString()) + " || " +
            ((isCompoundStatement(this._rOperand) && !(this._rOperand instanceof Or)) ? "(" + this._rOperand.toString() + ")" : this._rOperand.toString());
        }
        
        get(index: number): IBooleanStatement<C> {
            switch (index) {
                case 0:
                    return this._lOperand;
                case 1:
                    return this._rOperand;
                default:
                    throw new RangeError("Index out of range.");
            }
        }
    }

    export class NumericalTernary<C> implements ITernaryStatement<C, number, INumericalStatement<C>>, INumericalStatement<C> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<IBooleanStatement<C> | INumericalStatement<C>> { return [this._conditional, this._ifTrue, this._otherwise][Symbol.iterator](); }
        get length(): number { return 3; }

        constructor(private readonly _conditional: IBooleanStatement<C>, private readonly _ifTrue: INumericalStatement<C>, private readonly _otherwise: INumericalStatement<C>) {
            if (typeof _conditional === 'undefined' || _conditional == null) throw new TypeError("Invalid conditional statement.");
            if (typeof _ifTrue === 'undefined' || _ifTrue == null) throw new TypeError("Invalid ifTrue statement.");
            if (typeof _otherwise === 'undefined' || _otherwise == null) throw new TypeError("Invalid otherwise statement .");
        }

        get conditional(): IBooleanStatement<C> { return this._conditional; }

        get ifTrueStatement(): ICalculationStatement<C, number> { return this._ifTrue; }

        get otherwiseStatement(): ICalculationStatement<C, number> { return this._otherwise; }

        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof NumericalTernary
         */
        evaluate(context: C): number {
            return this._conditional.evaluate(context) ? this._ifTrue.evaluate(context) : this._otherwise.evaluate(context);
        }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof NumericalTernary
         */
        toString(): string {
            return (isCompoundStatement(this._conditional) ? "(" + this._conditional.toString() + ")" : this._conditional.toString()) + " ? " +
                (isCompoundStatement(this._ifTrue) ? "(" + this._ifTrue.toString() + ")" : this._ifTrue.toString()) + " : " + this._otherwise.toString();
        }
        
        get(index: number): IBooleanStatement<C> | INumericalStatement<C> {
            switch (index) {
                case 0:
                    return this._conditional;
                case 1:
                    return this._ifTrue;
                case 2:
                    return this._otherwise;
                default:
                    throw new RangeError("Index out of range.");
            }
        }
        
        static createForVip<T extends IVipCalculationContext>(ifTrue: INumericalStatement<T>, otherwise: INumericalStatement<T>): NumericalTernary<T> {
            return new NumericalTernary<T>(BooleanVariable.createForVip(), ifTrue, otherwise);
        }
        static createForBusinessRelated<T extends IBusinessRelatedCalculationContext>(ifTrue: INumericalStatement<T>, otherwise: INumericalStatement<T>): NumericalTernary<T> {
            return new NumericalTernary<T>(BooleanVariable.createForBusinessRelated(), ifTrue, otherwise);
        }
    }

    export class BooleanTernary<C> implements ITernaryStatement<C, boolean, IBooleanStatement<C>> {
        readonly id: Symbol = Symbol();
        [Symbol.iterator](): Iterator<IBooleanStatement<C>> { return [this._conditional, this._ifTrue, this._otherwise][Symbol.iterator](); }
        get length(): number { return 3; }

        constructor(private readonly _conditional: IBooleanStatement<C>, private readonly _ifTrue: IBooleanStatement<C>, private readonly _otherwise: IBooleanStatement<C>) {
            if (typeof _conditional === 'undefined' || _conditional == null) throw new TypeError("Invalid conditional statement.");
            if (typeof _ifTrue === 'undefined' || _ifTrue == null) throw new TypeError("Invalid ifTrue statement.");
            if (typeof _otherwise === 'undefined' || _otherwise == null) throw new TypeError("Invalid otherwise statement .");
        }

        get conditional(): IBooleanStatement<C> { return this._conditional; }
        
        get ifTrueStatement(): ICalculationStatement<C, boolean> { return this._ifTrue; }
        
        get otherwiseStatement(): ICalculationStatement<C, boolean> { return this._otherwise; }

        canBeSimplified(): boolean {
            throw new Error("Method not implemented.");
        }
        
        asSimplified(): ICalculationStatement<C, boolean> {
            throw new Error("Method not implemented.");
        }

        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof BooleanTernary
         */
        evaluate(context: C): boolean {
            return this._conditional.evaluate(context) ? this._ifTrue.evaluate(context) : this._otherwise.evaluate(context);
        }

        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof BooleanTernary
         */
        toString(): string {
            return (isCompoundStatement(this._conditional) ? "(" + this._conditional.toString() + ")" : this._conditional.toString()) + " ? " +
                (isCompoundStatement(this._ifTrue) ? "(" + this._ifTrue.toString() + ")" : this._ifTrue.toString()) + " : " + this._otherwise.toString();
        }
        
        get(index: number): IBooleanStatement<C> {
            switch (index) {
                case 0:
                    return this._conditional;
                case 1:
                    return this._ifTrue;
                case 2:
                    return this._otherwise;
                default:
                    throw new RangeError("Index out of range.");
            }
        }
        
        static createForVip<T extends IVipCalculationContext>(ifTrue: IBooleanStatement<T>, otherwise: IBooleanStatement<T>): BooleanTernary<T> {
            return new BooleanTernary<T>(BooleanVariable.createForVip(), ifTrue, otherwise);
        }
        static createForBusinessRelated<T extends IBusinessRelatedCalculationContext>(ifTrue: IBooleanStatement<T>, otherwise: IBooleanStatement<T>): BooleanTernary<T> {
            return new BooleanTernary<T>(BooleanVariable.createForBusinessRelated(), ifTrue, otherwise);
        }
    }

    export interface ICalculationContext {
        urgency: number;
        impact: number;
    }
    
    export interface IVipCalculationContext extends ICalculationContext {
        vip: boolean;
    }
    
    export interface IBusinessRelatedCalculationContext extends ICalculationContext {
        businessRelated: boolean;
    }
    
    export interface IAllOptionsCalculationContext extends IVipCalculationContext, IBusinessRelatedCalculationContext { }

    /**
     * Sub-module for normalizing statements.
     * @namespace
     */
    export namespace normalizers {
        /**
         * Represents a normalization result.
         * @export
         * @interface ITryNormalizeResult
         * @template C The type of object that can be referenced for evaluation.
         * @template V The type of value returned by the statement.
         * @template T The statement object type.
         */
        export interface ITryNormalizeResult<C, V, T extends ICalculationStatement<C, V>> {
            /**
             * The normalized statement
             * @type {T}
             * @memberof ITryNormalizeResult
             */
            statement: T;

            /**
             * Returns true if the statement is an normalized version of the original statement; otherwise false to indicate that the original statement was already normalied.
             * @type {boolean}
             * @memberof ITryNormalizeResult
             */
            wasNormalized: boolean;
        }

        /**
         * Template for a function that maps a statement to a result value.
         * @export
         * @interface IMapStatementFunc
         * @template C The type of object that can be referenced for evaluation.
         * @template V The type of value returned by the statement.
         * @template T The statement object type.
         * @template R The return value type.
         */
        export interface IMapStatementFunc<C, V, T extends ICalculationStatement<C, V>, R> {
            /**
             * Produces a result value from the provided statement.
             * @param {T} statement - The statement to use when creating the result value.
             * @return {R} The result value created from the provided statement.
             * @memberof IMapStatementFunc
             */
            (statement: T): R;
        }

        /**
         * Creates a new numeric literal statement with the sign of the value inverted.
         * @export
         * @template C The type of object associated with evaluation.
         * @param {NumericalLiteral<C>} statement - The statement to invert.
         * @return {NumericalLiteral<C>} The numeric literal statement with the sign of the value inverted.
         */
        export function negateLiteral<C>(statement: NumericalLiteral<C>): NumericalLiteral<C> { return (statement.value == 0) ? statement : new NumericalLiteral<C>(statement.value * -1); }
        
        /**
         * Normalizes a numerical statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @param {INumericalStatement<C>} statement - The statement to normalize.
         * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
         * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
         * @return {INumericalStatement<C>} The normalized copy of the original statement or the original statement, if it was already normalized.
         */
        export function normalizeNumeric<C>(statement: INumericalStatement<C>, ifNormalized? : IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>,
                ifNotNormalized?: IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>): INumericalStatement<C> {
            if (statement instanceof Sum) return sum.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Difference) return difference.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Product) return product.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Quotient) return quotient.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Round) return round.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof NumericalTernary) return numericTernary.normalize(statement, ifNormalized, ifNotNormalized);
            return (typeof ifNotNormalized === 'function') ? ifNotNormalized(statement) : statement;
        }

        /**
         * Normalizes a numerical statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @template R The return value type.
         * @param {INumericalStatement<C>} statement - The statement to normalize.
         * @param {IMapStatementFunc<C, number, INumericalStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
         * @param {IMapStatementFunc<C, number, INumericalStatement<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
         * @return {R} The value returned by the respective callback function.
         */
        export function fromNormalizedNumeric<C, R>(statement: INumericalStatement<C>, ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                ifNotNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>): R {
            if (statement instanceof Sum) return sum.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Difference) return difference.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Product) return product.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Quotient) return quotient.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Round) return round.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof NumericalTernary) return numericTernary.fromNormalized(statement, ifNormalized, ifNotNormalized);
            return ifNotNormalized(statement);
        }

        /**
         * Normalizes a numerical statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @param {INumericalStatement<C>} statement - The statement to be normalized.
         * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>} An object that contains the normalized statement and a value indicating whether the original statement was actually normalized.
         */
        export function tryNormalizeNumeric<C>(statement: INumericalStatement<C>): ITryNormalizeResult<C, number, INumericalStatement<C>> {
            if (statement instanceof Sum) return sum.tryNormalize(statement);
            if (statement instanceof Difference) return difference.tryNormalize(statement);
            if (statement instanceof Product) return product.tryNormalize(statement);
            if (statement instanceof Quotient) return quotient.tryNormalize(statement);
            if (statement instanceof Round) return round.tryNormalize(statement);
            if (statement instanceof NumericalTernary) return numericTernary.tryNormalize(statement);
            return { statement: statement, wasNormalized: false };
        }

        /**
         * Normalizes a boolean statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @param {IBooleanStatement<C>} statement - The statement to be normalized.
         * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
         * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
         * @return {IBooleanStatement<C>} The normalized copy of the original statement or the original statement, if it was already normalized.
         */
        export function normalizeBoolean<C>(statement: IBooleanStatement<C>, ifNormalized? : IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>,
                ifNotNormalized?: IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>): IBooleanStatement<C> {
            if (statement instanceof And) return and.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Or) return or.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof BooleanTernary) return booleanTernary.normalize(statement, ifNormalized, ifNotNormalized);
            return (typeof ifNotNormalized === 'function') ? ifNotNormalized(statement) : statement;
        }

        /**
         * Normalizes a boolean statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @template R The return value type.
         * @param {IBooleanStatement<C>} statement - The statement to be normalized.
         * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
         * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
         * @return {R} The value returned by the respective callback function.
         */
        export function fromNormalizedBoolean<C, R>(statement: IBooleanStatement<C>, ifNormalized: IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>,
                ifNotNormalized: IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>): R {
            if (statement instanceof And) return and.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Or) return or.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof BooleanTernary) return booleanTernary.fromNormalized(statement, ifNormalized, ifNotNormalized);
            return ifNotNormalized(statement);
        }

        /**
         * Normalizes a boolean statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @param {IBooleanStatement<C>} statement - The statement to be normalized.
         * @return {ITryNormalizeResult<C, boolean, IBooleanStatement<C>>} An object that contains the normalized statement and a value indicating whether the original statement was actually normalized.
         */
        export function tryNormalizeBoolean<C>(statement: IBooleanStatement<C>): ITryNormalizeResult<C, boolean, IBooleanStatement<C>> {
            if (statement instanceof And) return and.tryNormalize(statement);
            if (statement instanceof Or) return or.tryNormalize(statement);
            if (statement instanceof BooleanTernary) return booleanTernary.tryNormalize(statement);
            return { statement: statement, wasNormalized: false };
        }

        function toNormalizedResult<C, V, T extends ICalculationStatement<C, V>>(statement: T) : ITryNormalizeResult<C, V, T> { return { statement: statement, wasNormalized: true}; }
        
        function toNotNormalizedResult<C, V, T extends ICalculationStatement<C, V>>(statement: T) : ITryNormalizeResult<C, V, T> { return { statement: statement, wasNormalized: false}; }
        
        /**
         * Sub-module for normalizing {@link Sum} statements.
         * @namespace
         */
        export namespace sum {
            /**
             * Creates a normalized boolean expression from numerical statements joined by addition operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} lValue - The first value in the addition operation.
             * @param {...INumericalStatement<C>[]} rValues - Additional values in the addition operation.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function create<C>(lValue: INumericalStatement<C>, ...rValues: INumericalStatement<C>[]): INumericalStatement<C> {
                throw new Error("Method not implemented.");
            }

            function withNormalizedOperands<C, R>(original: Sum<C>, lValue: INumericalStatement<C>, rValue: INumericalStatement<C>,
                    ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Sum<C>, R>, forceNormalized: boolean): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes a {@link Sum} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {Sum<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, number, Sum<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: Sum<C>, ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Sum<C>, R>): R {
                return fromNormalizedNumeric(statement.lOperand, function(lValue: INumericalStatement<C>): R {
                    return fromNormalizedNumeric(statement.rOperand, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function(lValue: INumericalStatement<C>): R {
                    return fromNormalizedNumeric(statement.rOperand, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }

            /**
             * Gets the results of the normalization of an addition statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Sum<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            export function tryNormalize<C>(statement: Sum<C>): ITryNormalizeResult<C, number, INumericalStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from an addition statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Sum<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Sum<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function normalize<C>(statement: Sum<C>, ifNormalized?: IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, number, Sum<C>, INumericalStatement<C>>): INumericalStatement<C> {
                return fromNormalized(statement, function(s: INumericalStatement<C>): INumericalStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: Sum<C>): INumericalStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }

        /**
         * Sub-module for normalizing {@link Difference} statements.
         * @namespace
         */
        export namespace difference {
            /**
             * Creates a normalized boolean expression from numerical statements joined by subtraction operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} lValue - The first value in the subtraction operation.
             * @param {...INumericalStatement<C>[]} rValues - Additional values in the subtraction operation.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function create<C>(lValue: INumericalStatement<C>, ...rValues: INumericalStatement<C>[]): INumericalStatement<C> {
                throw new Error("Method not implemented.");
            }

            function withNormalizedOperands<C, R>(original: Difference<C>, lValue: INumericalStatement<C>, rValue: INumericalStatement<C>,
                    ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Difference<C>, R>, forceNormalized: boolean): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes a {@link Difference} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {Difference<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, number, Difference<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: Difference<C>, ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Difference<C>, R>): R {
                return fromNormalizedNumeric(statement.lOperand, function(lValue: INumericalStatement<C>): R {
                    return fromNormalizedNumeric(statement.rOperand, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function(lValue: INumericalStatement<C>): R {
                    return fromNormalizedNumeric(statement.rOperand, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }

            /**
             * Gets the results of the normalization of a subtraction statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Difference<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            export function tryNormalize<C>(statement: Difference<C>): ITryNormalizeResult<C, number, INumericalStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from a subtraction statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Difference<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Difference<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function normalize<C>(statement: Difference<C>, ifNormalized?: IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, number, Difference<C>, INumericalStatement<C>>): INumericalStatement<C> {
                return fromNormalized(statement, function(s: INumericalStatement<C>): INumericalStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: Difference<C>): INumericalStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }
        
        /**
         * Sub-module for normalizing {@link Product} statements.
         * @namespace
         */
        export namespace product {
            /**
             * Creates a normalized boolean expression from numerical statements joined by multiplication operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} lValue - The first value in the multiplication operation.
             * @param {...INumericalStatement<C>[]} rValues - Additional values in the multiplication operation.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function create<C>(lValue: INumericalStatement<C>, ...rValues: INumericalStatement<C>[]): INumericalStatement<C> {
                throw new Error("Method not implemented.");
            }

            function withNormalizedOperands<C, R>(original: Product<C>, lValue: INumericalStatement<C>, rValue: INumericalStatement<C>,
                    ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Product<C>, R>, forceNormalized: boolean): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes a {@link Product} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {Product<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, number, Product<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: Product<C>, ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Product<C>, R>): R {
                return fromNormalizedNumeric(statement.lOperand, function(lValue: INumericalStatement<C>): R {
                    return fromNormalizedNumeric(statement.rOperand, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function(lValue: INumericalStatement<C>): R {
                    return fromNormalizedNumeric(statement.rOperand, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }

            /**
             * Gets the results of the normalization of a multiplication statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Product<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            export function tryNormalize<C>(statement: Product<C>): ITryNormalizeResult<C, number, INumericalStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from a multiplication statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Product<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Product<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function normalize<C>(statement: Product<C>, ifNormalized?: IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, number, Product<C>, INumericalStatement<C>>): INumericalStatement<C> {
                return fromNormalized(statement, function(s: INumericalStatement<C>): INumericalStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: Product<C>): INumericalStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }
        
        /**
         * Sub-module for normalizing {@link Quotient} statements.
         * @namespace
         */
        export namespace quotient {
            /**
             * Creates a normalized boolean expression from numerical statements joined by division operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} dividend - The dividend for the division operation.
             * @param {...INumericalStatement<C>[]} divisors - The divisors for the division operation.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function create<C>(dividend: INumericalStatement<C>, ...divisors: INumericalStatement<C>[]): INumericalStatement<C> {
                throw new Error("Method not implemented.");
            }

            function withNormalizedOperands<C, R>(original: Quotient<C>, lValue: INumericalStatement<C>, rValue: INumericalStatement<C>,
                    ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Quotient<C>, R>, forceNormalized: boolean): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes a {@link Quotient} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {Quotient<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, number, Quotient<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: Quotient<C>, ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Quotient<C>, R>): R {
                return fromNormalizedNumeric(statement.lOperand, function(lValue: INumericalStatement<C>): R {
                    return fromNormalizedNumeric(statement.rOperand, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function(lValue: INumericalStatement<C>): R {
                    return fromNormalizedNumeric(statement.rOperand, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: INumericalStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }

            /**
             * Gets the results of the normalization of a division statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Quotient<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            export function tryNormalize<C>(statement: Quotient<C>): ITryNormalizeResult<C, number, INumericalStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from a division statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Quotient<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Quotient<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function normalize<C>(statement: Quotient<C>, ifNormalized?: IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, number, Quotient<C>, INumericalStatement<C>>): INumericalStatement<C> {
                return fromNormalized(statement, function(s: INumericalStatement<C>): INumericalStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: Quotient<C>): INumericalStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }
        
        /**
         * Sub-module for normalizing {@link Round} statements.
         * @namespace
         */
        export namespace round {
            /**
             * Creates a normalized numeric expression from a numerical statement used as a parameter to a normalization function.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} statement - The argument for the rounding function.
             * @param {RoundingType} type
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function create<C>(statement: INumericalStatement<C>, type: RoundingType): INumericalStatement<C> {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes a {@link Round} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {Round<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, number, Round<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: Round<C>, ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, Round<C>, R>): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Gets the results of the normalization of a rounding statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Round<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            export function tryNormalize<C>(statement: Round<C>): ITryNormalizeResult<C, number, INumericalStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from a rounding statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Round<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Round<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function normalize<C>(statement: Round<C>, ifNormalized?: IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, number, Round<C>, INumericalStatement<C>>): INumericalStatement<C> {
                return fromNormalized(statement, function(s: INumericalStatement<C>): INumericalStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: Round<C>): INumericalStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }
        
        /**
         * Sub-module for normalizing {@link And} statements.
         * @namespace
         */
        export namespace and {
            /**
             * Creates a normalized boolean expression from boolean statements joined by logical AND operators.
             * @export
             * @template C The type of object that can be referenced for evaluation
             * @param {IBooleanStatement<C>[]} lValue - The first value in the logical AND operation.
             * @param {...IBooleanStatement<C>[]} rValues - Additional values in the logical AND operation.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            export function create<C>(lValue: IBooleanStatement<C>, ...rValues: IBooleanStatement<C>[]): IBooleanStatement<C> {
                throw new Error("Method not implemented.");
            }

            function withNormalizedOperands<C, R>(original: And<C>, lValue: IBooleanStatement<C>, rValue: IBooleanStatement<C>,
                    ifNormalized: IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, boolean, And<C>, R>, forceNormalized: boolean): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes an {@link And} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {And<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, boolean, And<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: And<C>, ifNormalized: IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, boolean, And<C>, R>): R {
                return fromNormalizedBoolean(statement.lOperand, function(lValue: IBooleanStatement<C>): R {
                    return fromNormalizedBoolean(statement.rOperand, function(rValue: IBooleanStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: IBooleanStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function(lValue: IBooleanStatement<C>): R {
                    return fromNormalizedBoolean(statement.rOperand, function(rValue: IBooleanStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: IBooleanStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }

            /**
             * Gets the results of the normalization of a logical AND statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {And<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, boolean, IBooleanStatement<C>>}
             */
            export function tryNormalize<C>(statement: And<C>): ITryNormalizeResult<C, boolean, IBooleanStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from a logical AND statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {And<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, boolean, And<C>, IBooleanStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            export function normalize<C>(statement: And<C>, ifNormalized?: IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, boolean, And<C>, IBooleanStatement<C>>): IBooleanStatement<C> {
                return fromNormalized(statement, function(s: IBooleanStatement<C>): IBooleanStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: And<C>): IBooleanStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }
        
        /**
         * Sub-module for normalizing {@link Or} statements.
         * @namespace
         */
        export namespace or {
            /**
             * Creates a normalized boolean expression from boolean statements joined by logical OR operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {IBooleanStatement<C>[]} lValue - The first value in the logical OR operation.
             * @param {...IBooleanStatement<C>[]} rValues - Additional values in the logical OR operation.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            export function create<C>(lValue: IBooleanStatement<C>, ...rValues: IBooleanStatement<C>[]): IBooleanStatement<C> {
                throw new Error("Method not implemented.");
            }

            function withNormalizedOperands<C, R>(original: Or<C>, lValue: IBooleanStatement<C>, rValue: IBooleanStatement<C>,
                    ifNormalized: IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, boolean, Or<C>, R>, forceNormalized: boolean): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes an {@link Or} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {Or<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, boolean, Or<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: Or<C>, ifNormalized: IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, boolean, Or<C>, R>): R {
                return fromNormalizedBoolean(statement.lOperand, function(lValue: IBooleanStatement<C>): R {
                    return fromNormalizedBoolean(statement.rOperand, function(rValue: IBooleanStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: IBooleanStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function(lValue: IBooleanStatement<C>): R {
                    return fromNormalizedBoolean(statement.rOperand, function(rValue: IBooleanStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function(rValue: IBooleanStatement<C>): R {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }

            /**
             * Gets the results of the normalization of a logical OR statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Or<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, boolean, IBooleanStatement<C>>}
             */
            export function tryNormalize<C>(statement: Or<C>): ITryNormalizeResult<C, boolean, IBooleanStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from a logical OR statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Or<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, boolean, Or<C>, IBooleanStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            export function normalize<C>(statement: Or<C>, ifNormalized?: IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, boolean, Or<C>, IBooleanStatement<C>>): IBooleanStatement<C> {
                return fromNormalized(statement, function(s: IBooleanStatement<C>): IBooleanStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: Or<C>): IBooleanStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }
        
        /**
         * Sub-module for normalizing {@link NumericalTernary} statements.
         * @namespace
         */
        export namespace numericTernary {
            /**
             * Creates a normalized numeric expression from a conditional expression and alternate statements.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {IBooleanStatement<C>} conditional
             * @param {INumericalStatement<C>} ifTrue
             * @param {INumericalStatement<C>} otherwise
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function create<C>(conditional: IBooleanStatement<C>, ifTrue: INumericalStatement<C>, otherwise: INumericalStatement<C>): INumericalStatement<C> {
                throw new Error("Method not implemented.");
            }

            function withNormalizedOperands<C, R>(original: NumericalTernary<C>, conditional: IBooleanStatement<C>, ifTrue: INumericalStatement<C>,
                    otherwise: INumericalStatement<C>, ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, NumericalTernary<C>, R>, forceNormalized: boolean): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes a {@link NumericalTernary} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {NumericalTernary<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, number, NumericalTernary<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: NumericalTernary<C>, ifNormalized: IMapStatementFunc<C, number, INumericalStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, number, NumericalTernary<C>, R>): R {
                return fromNormalizedBoolean(statement.conditional, function(conditional: IBooleanStatement<C>): R {
                    return fromNormalizedNumeric(statement.ifTrueStatement, function(ifTrueStatement: INumericalStatement<C>): R {
                        return fromNormalizedNumeric(statement.ifTrueStatement, function(otherwiseStatement: INumericalStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function(otherwiseStatement: INumericalStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    }, function(ifTrueStatement: INumericalStatement<C>): R {
                        return fromNormalizedNumeric(statement.ifTrueStatement, function(otherwiseStatement: INumericalStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function(otherwiseStatement: INumericalStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    });
                }, function(conditional: IBooleanStatement<C>): R {
                    return fromNormalizedNumeric(statement.ifTrueStatement, function(ifTrueStatement: INumericalStatement<C>): R {
                        return fromNormalizedNumeric(statement.ifTrueStatement, function(otherwiseStatement: INumericalStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function(otherwiseStatement: INumericalStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    }, function(ifTrueStatement: INumericalStatement<C>): R {
                        return fromNormalizedNumeric(statement.ifTrueStatement, function(otherwiseStatement: INumericalStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function(otherwiseStatement: INumericalStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, false);
                        });
                    });
                });
            }

            /**
             * Gets the results of the normalization of a ternary numerical statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {NumericalTernary<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            export function tryNormalize<C>(statement: NumericalTernary<C>): ITryNormalizeResult<C, number, INumericalStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from a ternary numerical statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {NumericalTernary<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, NumericalTernary<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            export function normalize<C>(statement: NumericalTernary<C>, ifNormalized?: IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, number, NumericalTernary<C>, INumericalStatement<C>>): INumericalStatement<C> {
                return fromNormalized(statement, function(s: INumericalStatement<C>): INumericalStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: NumericalTernary<C>): INumericalStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }
        
        /**
         * Sub-module for normalizing {@link BooleanTernary} statements.
         * @namespace
         */
        export namespace booleanTernary {
            /**
             * Creates a normalized boolean expression from a conditional expression and alternate statements.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {IBooleanStatement<C>} conditional
             * @param {IBooleanStatement<C>} ifTrue
             * @param {IBooleanStatement<C>} otherwise
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            export function create<C>(conditional: IBooleanStatement<C>, ifTrue: IBooleanStatement<C>, otherwise: IBooleanStatement<C>): IBooleanStatement<C> {
                throw new Error("Method not implemented.");
            }

            function withNormalizedOperands<C, R>(original: BooleanTernary<C>, conditional: IBooleanStatement<C>, ifTrue: IBooleanStatement<C>,
                    otherwise: IBooleanStatement<C>, ifNormalized: IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, boolean, BooleanTernary<C>, R>, forceNormalized: boolean): R {
                throw new Error("Method not implemented.");
            }

            /**
             * Normalizes a {@link BooleanTernary} statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @template R The return value type.
             * @param {BooleanTernary<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>} ifNormalized - The callback that gets invoked when the original statement has been normalized.
             * @param {IMapStatementFunc<C, boolean, BooleanTernary<C>, R>} ifNotNormalized - The callback that gets invoked when the original statement was already normalized.
             * @return {R} The value returned by the respective callback function.
             */
            export function fromNormalized<C, R>(statement: BooleanTernary<C>, ifNormalized: IMapStatementFunc<C, boolean, IBooleanStatement<C>, R>,
                    ifNotNormalized: IMapStatementFunc<C, boolean, BooleanTernary<C>, R>): R {
                return fromNormalizedBoolean(statement.conditional, function(conditional: IBooleanStatement<C>): R {
                    return fromNormalizedBoolean(statement.ifTrueStatement, function(ifTrueStatement: IBooleanStatement<C>): R {
                        return fromNormalizedBoolean(statement.ifTrueStatement, function(otherwiseStatement: IBooleanStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function(otherwiseStatement: IBooleanStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    }, function(ifTrueStatement: IBooleanStatement<C>): R {
                        return fromNormalizedBoolean(statement.ifTrueStatement, function(otherwiseStatement: IBooleanStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function(otherwiseStatement: IBooleanStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    });
                }, function(conditional: IBooleanStatement<C>): R {
                    return fromNormalizedBoolean(statement.ifTrueStatement, function(ifTrueStatement: IBooleanStatement<C>): R {
                        return fromNormalizedBoolean(statement.ifTrueStatement, function(otherwiseStatement: IBooleanStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function(otherwiseStatement: IBooleanStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    }, function(ifTrueStatement: IBooleanStatement<C>): R {
                        return fromNormalizedBoolean(statement.ifTrueStatement, function(otherwiseStatement: IBooleanStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function(otherwiseStatement: IBooleanStatement<C>): R {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, false);
                        });
                    });
                });
            }

            /**
             * Gets the results of the normalization of a ternary boolean statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {BooleanTernary<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, boolean, IBooleanStatement<C>>}
             */
            export function tryNormalize<C>(statement: BooleanTernary<C>): ITryNormalizeResult<C, boolean, IBooleanStatement<C>> {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }

            /**
             * Gets a normalized numerical value from a ternary boolean statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {BooleanTernary<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, boolean, BooleanTernary<C>, IBooleanStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            export function normalize<C>(statement: BooleanTernary<C>, ifNormalized?: IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>,
                    ifNotNormalized?: IMapStatementFunc<C, boolean, BooleanTernary<C>, IBooleanStatement<C>>): IBooleanStatement<C> {
                return fromNormalized(statement, function(s: IBooleanStatement<C>): IBooleanStatement<C> {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function(s: BooleanTernary<C>): IBooleanStatement<C> {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
        }
    }
}