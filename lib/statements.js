"use strict";
/// <reference path="./itilPriorityCalculator.ts"/>
/**
 * Module for calculation statements.
 * @module itilPriorityCalculator
 */
var statements;
(function (statements) {
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
    let RoundingType;
    (function (RoundingType) {
        /** Uses {@link Math.ceil} to round numbers up. */
        RoundingType["ceiling"] = "ceiling";
        /** Uses {@link Math.floor} to round numbers down. */
        RoundingType["floor"] = "floor";
        /** Uses {@link Math.round} to round numbers to the nearest whole number. */
        RoundingType["nearest"] = "nearest";
    })(RoundingType = statements.RoundingType || (statements.RoundingType = {}));
    /**
     * Determines whether a value is a {@link RoundingType} value.
     * @export
     * @param {*} value - The value to test
     * @return {boolean} true if the value is a {@link RoundingType} enum value; otherwise, false.
     */
    function isRoundingType(value) {
        Math.round;
        return typeof value === 'string' && (value === RoundingType.ceiling || value === RoundingType.floor || value === RoundingType.nearest);
    }
    statements.isRoundingType = isRoundingType;
    /**
     * This is an enumeration of string values that is bound to a {@link HTMLSelectElement} tag, allowing the user to select the basic priority calculation algorithm.
     * @export
     * Each {@link HTMLOptionElement} is bound to an element in the {@link IMainControllerScope#baseFormulaOptions} array.
     * @readonly
     * @enum {string}
     * @summary Represents a basic priority calculation algorithm.
     */
    let BaseFormulaType;
    (function (BaseFormulaType) {
        /** The {@link IBasicPriorityCalculationResult#priority} value is derived using the '{@link ICalculationContext#urgency} * {@link ICalculationContext#impact}' algorithm. */
        BaseFormulaType["multiply"] = "multiply";
        /** The {@link IBasicPriorityCalculationResult#priority} value is derived using the '{@link ICalculationContext#urgency} + {@link ICalculationContext#impact}' algorithm. */
        BaseFormulaType["add"] = "add";
        /** The {@link IBasicPriorityCalculationResult#priority} value is derived using the '({@link ICalculationContext#urgency} * {@link ICalculationContext#impact}) + {@link ICalculationContext#urgency} + {@link ICalculationContext#impact}' algorithm. */
        BaseFormulaType["multiplyAdd"] = "multiplyAdd";
        /** The {@link IBasicPriorityCalculationResult#priority} value is derived using the '({@link ICalculationContext#urgency} + {@link ICalculationContext#impact}) * {@link ICalculationContext#urgency} * {@link ICalculationContext#impact}' algorithm. */
        BaseFormulaType["addMultiply"] = "addMultiply";
    })(BaseFormulaType = statements.BaseFormulaType || (statements.BaseFormulaType = {}));
    /**
     * Determines whether a value is a {@link BaseFormulaType} value.
     * @export
     * @param {*} value - The value to test
     * @returns {boolean} true if the value is a {@link BaseFormulaType} enum value; otherwise, false.
     */
    function isBaseFormulaType(value) {
        return typeof value === 'string' && (value === BaseFormulaType.multiply || value === BaseFormulaType.add || value === BaseFormulaType.multiplyAdd || value === BaseFormulaType.addMultiply);
    }
    statements.isBaseFormulaType = isBaseFormulaType;
    /**
     * This is a regular expression that matches a non-empty string that contains only letters, numbers and underscore characters, where the first character is either a letter or an underscore character.
     * @constant
     * @type {RegExp}
     * @see isValidVariableName
     * @see IVariableStatement#name
     * @summary Matches a valid variable name
     */
    const variableNameRegExp = /^[a-z_][a-z_\d]*$/i;
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
    function isValidVariableName(name) { return typeof name === 'string' && variableNameRegExp.test(name); }
    statements.isValidVariableName = isValidVariableName;
    /**
     * Enumeration to represent calculation operators.
     * @export
     * @readonly
     * @enum {number}
     */
    let Operator;
    (function (Operator) {
        /** Represents an addition operator. */
        Operator[Operator["add"] = 0] = "add";
        /** Represents a subtraction operator. */
        Operator[Operator["subtract"] = 1] = "subtract";
        /** Represents a multiplication operator. */
        Operator[Operator["multiply"] = 2] = "multiply";
        /** Represents a division operator. */
        Operator[Operator["divide"] = 3] = "divide";
        /** Represents a logical AND operator. */
        Operator[Operator["and"] = 4] = "and";
        /** Represents a logical OR operator. */
        Operator[Operator["or"] = 5] = "or";
    })(Operator = statements.Operator || (statements.Operator = {}));
    /**
     * Determines whether a value is a {@link LogicalOperator} value.
     * @export
     * @param {number} [value] - The value to test.
     * @return {boolean} true if the value is a {@link LogicalOperator} enum value; otherwise, false.
     */
    function isMathOperator(value) {
        return typeof value === 'number' && (value === Operator.add || value === Operator.multiply || value === Operator.divide);
    }
    statements.isMathOperator = isMathOperator;
    function getNestedStatementById(id, target, includeSelf = false) {
        if (includeSelf && target.id == id)
            return target;
        for (var item of target) {
            if (isCompoundStatement(item)) {
                var result = getNestedStatementById(id, item, true);
                if (typeof result != undefined)
                    return result;
            }
        }
    }
    /**
     * Determines whether a statement is a compound statement.
     * @export
     * @param {ICalculationStatement<C, V>} [statement] - The statement to test.
     * @return {boolean} true if the object is a {@link ICompoundStatement}; otherwise, false.
     */
    function isCompoundStatement(statement) {
        return typeof statement === 'object' && statement != null && typeof statement[Symbol.iterator] === 'function';
    }
    statements.isCompoundStatement = isCompoundStatement;
    /**
     * Determines whether a statement is a numerical operation statement.
     * @export
     * @param {ICompoundStatement<C, number, INumericalStatement<C>>} [statement] - The statement to test.
     * @return {boolean} true if the object is a {@link INumericalOperationStatement}; otherwise, false.
     */
    function isNumericalOperationStatement(statement) {
        return typeof statement === 'object' && statement != null && isMathOperator(statement.operator);
    }
    statements.isNumericalOperationStatement = isNumericalOperationStatement;
    /**
     * Concrete class for a statement that returns a literal numerical value.
     * @export
     * @class NumericalLiteral
     * @implements {INumericalStatement<C>}
     * @implements {ILiteralStatement<C, number>}
     * @template C The type of context object associated with statement evaluation.
     */
    class NumericalLiteral {
        /**
         * Creates an instance of NumericalLiteral.
         * @param {number} _value - The literal numeric value.
         * @memberof NumericalLiteral
         * @throws {TypeError} - Value is undefined, null, NaN, or not a number type.
         */
        constructor(_value) {
            this._value = _value;
            if (typeof _value !== 'number' || isNaN(_value))
                throw new TypeError("Value is not a valid number.");
        }
        /**
         * Gets the literal value contained by this statement.
         * @readonly
         * @type {number}
         * @memberof NumericalLiteral
         */
        get value() { return this._value; }
        /**
         * Evaluates the current expression, simply returning the literal value.
         * @param {C} context - The contextual object that is associatd with statement evaluation.
         * @return {number} The literal value contained by this statement.
         * @memberof NumericalLiteral
         */
        evaluate(context) { return this._value; }
        /**
         * Gets a string value of the current literal value.
         * @return {string} A string value of the current literal value, using {@link JSON.stringify}.
         * @memberof NumericalLiteral
         */
        toString() { return JSON.stringify(this._value); }
        /**
         * Returns a copy of this statement with the literal value negated.
         * @return {NumericalLiteral<C>} A literal numerical statement where the value has been multiplied by -1.
         * @memberof NumericalLiteral
         */
        asNegated() {
            return (this._value == 0) ? this : new NumericalLiteral(this._value * -1);
        }
    }
    statements.NumericalLiteral = NumericalLiteral;
    function isNumericalLiteral(value) {
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
    class NumericalVariable {
        /**
         * Creates an instance of NumericalVariable.
         * @param {string} _name - The name of the variable to be represented.
         * @param {IValueAccessor<C, number>} _accessor - The function that returns the value of the variable, given the specified context object.
         * @memberof NumericalVariable
         * @throws {TypeError} - The accessor function is undefined or null or the variable name is undefined, null, not a string type or is not a valid variable name.
         */
        constructor(_name, _accessor) {
            this._name = _name;
            this._accessor = _accessor;
            if (!isValidVariableName(_name))
                throw new TypeError("Name parameter does not contain a valid variable name.");
            if (typeof _accessor !== 'function')
                throw new TypeError("Accessor parameter is not a function.");
        }
        /**
         * Gets the name of the variable.
         * @return {string} The name of the variable represented by this statement.
         * @memberof NumericalVariable
         */
        get name() { return this._name; }
        /**
         * Gets the function that obtains the value of the variable using a specified context object.
         * @return {IValueAccessor<C, number>} A function that obtains the value of the variable using a specified context object.
         * @memberof NumericalVariable
         */
        get accessor() { return this._accessor; }
        /**
         * Evaluates the current expression by invoking the {@link #accessor}.
         * @param {C} context - The contextual object that is used to get the value of the variable being represented.
         * @return {number} The value returned by the {@link #accessor} function.
         * @memberof NumericalLiteral
         */
        evaluate(context) { return this._accessor(context); }
        /**
         * Gets a string representation of the current statement, which is the name of the variable.
         * @return {string} The name of the variable.
         * @memberof NumericalVariable
         */
        toString() { return this._name; }
        /**
         * Creates a new {@link NumericalVariable} to reference the {@link ICalculationContext#urgency} property.
         * @static
         * @template T The type of object that contains the {@link ICalculationContext#urgency} property.
         * @return {NumericalVariable<T>} A statement object representing the {@link ICalculationContext#urgency} property.
         * @memberof NumericalVariable
         */
        static createForUrgency() { return new NumericalVariable("urgency", function (context) { return context.urgency; }); }
        /**
         * Creates a new {@link NumericalVariable} to reference the {@link ICalculationContext#impact} property.
         * @static
         * @template T The type of object that contains the {@link ICalculationContext#impact} property.
         * @return {NumericalVariable<T>} A statement object representing the {@link ICalculationContext#impact} property.
         * @memberof NumericalVariable
         */
        static createForImpact() {
            return new NumericalVariable("impact", function (context) { return context.impact; });
        }
    }
    statements.NumericalVariable = NumericalVariable;
    /**
     * Concrete class for a multiplication statement.
     * @export
     * @class Product
     * @implements {INumericalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    class Product {
        constructor(_lOperand, _rOperand) {
            this._lOperand = _lOperand;
            this._rOperand = _rOperand;
            this.id = Symbol();
            if (typeof _lOperand === 'undefined' || _lOperand == null)
                throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null)
                throw new TypeError("Invalid right operand.");
        }
        [Symbol.iterator]() { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length() { return 2; }
        get operator() { return Operator.multiply; }
        /**
         * Gets the operand being multiplied.
         * @return {INumericalStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Product
         */
        get lOperand() { return this._lOperand; }
        /**
         * Gets the operand that the first operand is being being multiplied by.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Product
         */
        get rOperand() { return this._rOperand; }
        get(index) {
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
        evaluate(context) { return this._lOperand.evaluate(context) * this._rOperand.evaluate(context); }
        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Product
         */
        toString() {
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Product) && this._lOperand.length > 1) ? "(" + this._lOperand.toString() + ")" : this._lOperand.toString()) + " * " + ((isCompoundStatement(this._rOperand) && !(this._rOperand instanceof Product) && this._rOperand.length > 1) ? "(" + this._rOperand.toString() + ")" : this._rOperand.toString());
        }
    }
    statements.Product = Product;
    /**
     * Concrete class for a division statement.
     * @export
     * @class Quotient
     * @implements {INumericalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    class Quotient {
        constructor(_dividend, _divisor) {
            this._dividend = _dividend;
            this._divisor = _divisor;
            this.id = Symbol();
            if (typeof _dividend === 'undefined' || _dividend == null)
                throw new TypeError("Invalid dividend.");
            if (typeof _divisor === 'undefined' || _divisor == null)
                throw new TypeError("Invalid divisor.");
            if (isNumericalLiteral(_divisor) && _divisor.value == 0)
                throw new EvalError("Divisor cannot be a literal zero value.");
        }
        [Symbol.iterator]() { return [this._dividend, this._divisor][Symbol.iterator](); }
        get length() { return 2; }
        get lOperand() { return this._dividend; }
        get operator() { return Operator.divide; }
        get rOperand() { return this._divisor; }
        /**
         * Gets the statement representing the dividend.
         * @return {INumericalStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Quotient
         */
        get dividend() { return this._dividend; }
        /**
         * Gets the statement representing the divisor.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Quotient
         */
        get divisor() { return this._divisor; }
        /**
         * Evaluates the current expression by dividing the results of the first operand evaluation by that of second, then sequentially dividing the result
         * with the result of each remaining operation evaluation.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The quotient of the division operation.
         * @memberof Quotient
         */
        evaluate(context) { return this._dividend.evaluate(context) / this._divisor.evaluate(context); }
        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Quotient
         */
        toString() {
            return ((isCompoundStatement(this._dividend) && !(this._dividend instanceof Quotient) && this._dividend.length > 1) ? "(" + this._dividend.toString() + ")" : this._dividend.toString()) + " / " + ((isCompoundStatement(this._divisor) && !(this._divisor instanceof Quotient) && this._divisor.length > 1) ? "(" + this._divisor.toString() + ")" : this._divisor.toString());
        }
        get(index) {
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
    statements.Quotient = Quotient;
    /**
     * Concrete class for an addition statement.
     * @export
     * @class Sum
     * @implements {INumericalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    class Sum {
        constructor(_lOperand, _rOperand) {
            this._lOperand = _lOperand;
            this._rOperand = _rOperand;
            this.id = Symbol();
            if (typeof _lOperand === 'undefined' || _lOperand == null)
                throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null)
                throw new TypeError("Invalid right operand.");
        }
        [Symbol.iterator]() { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length() { return 2; }
        get operator() { return Operator.add; }
        /**
         * Gets the operand representing the first value being added.
         * @return {INumericalStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Sum
         */
        get lOperand() { return this._lOperand; }
        /**
         * Gets the operand representing the second value being added.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Sum
         */
        get rOperand() { return this._rOperand; }
        /**
         * Evaluates the current expression by adding the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The sum of all the evaluated operand values.
         * @memberof Sum
         */
        evaluate(context) { return this._lOperand.evaluate(context) + this._rOperand.evaluate(context); }
        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Sum
         */
        toString() {
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
            }
            else if (isNumericalLiteral(this._rOperand) && this._rOperand.value < 0)
                return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                    "(" + this._lOperand.toString() + ") - " : this._lOperand.toString() + " - ") + JSON.stringify(this._rOperand.value * -1) + ")";
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                "(" + this._lOperand.toString() + ") + " : this._lOperand.toString() + " + ") + this._rOperand.toString();
        }
        get(index) {
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
    statements.Sum = Sum;
    /**
     * Concrete class for a subtraction statement.
     * @export
     * @class Difference
     * @implements {INumericalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    class Difference {
        constructor(_lOperand, _rOperand) {
            this._lOperand = _lOperand;
            this._rOperand = _rOperand;
            this.id = Symbol();
            if (typeof _lOperand === 'undefined' || _lOperand == null)
                throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null)
                throw new TypeError("Invalid right operand.");
        }
        [Symbol.iterator]() { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length() { return 2; }
        get operator() { return Operator.subtract; }
        /**
         * Gets the operand representing the value being subtracted from.
         * @return {INumericalStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Difference
         */
        get lOperand() { return this._lOperand; }
        /**
         * Gets the operand representing the value being deducted.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Difference
         */
        get rOperand() { return this._rOperand; }
        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof Difference
         */
        evaluate(context) { return this._lOperand.evaluate(context) - this._rOperand.evaluate(context); }
        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Difference
         */
        toString() {
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
            }
            else if (isNumericalLiteral(this._rOperand) && this._rOperand.value < 0)
                return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                    "(" + this._lOperand.toString() + ") + " : this._lOperand.toString() + " + ") + JSON.stringify(this._rOperand.value * -1) + ")";
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Sum || this._lOperand instanceof Difference) && this._lOperand.length > 1) ?
                "(" + this._lOperand.toString() + ") - " : this._lOperand.toString() + " - ") + this._rOperand.toString();
        }
        get(index) {
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
    statements.Difference = Difference;
    class Round {
        constructor(_type, _statement) {
            this._type = _type;
            this._statement = _statement;
            this.id = Symbol();
            if (!isRoundingType(_type))
                throw new TypeError("Rounding type is invalid.");
            if (typeof _statement === 'undefined' || _statement == null)
                throw new TypeError("Statement operator is invalid.");
        }
        [Symbol.iterator]() { return [this._statement][Symbol.iterator](); }
        get length() { return 1; }
        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof Round
         */
        evaluate(context) {
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
        toString() {
            return ((this._type == RoundingType.nearest) ? "Math.round(" : "Math." + this._type + "(") + this._statement.toString() + ")";
        }
        get(index) {
            if (index != 0)
                throw new RangeError("Index out of range.");
            return this._statement;
        }
    }
    statements.Round = Round;
    /**
     * Concrete class for a statement that returns a literal boolean value.
     * @export
     * @class BooleanLiteral
     * @implements {IBooleanStatement<C>}
     * @implements {ILiteralStatement<C, boolean>}
     * @template C The type of context object associated with statement evaluation.
     */
    class BooleanLiteral {
        /**
         * Creates an instance of BooleanLiteral.
         * @param {boolean} _value - The literal boolean value.
         * @memberof BooleanLiteral
         * @throws {TypeError} - Value is undefined, null, or not a boolean type.
         */
        constructor(_value) {
            this._value = _value;
            if (typeof _value !== 'boolean')
                throw new TypeError("Value is not a boolean type.");
        }
        /**
         * Gets the literal value contained by this statement.
         * @readonly
         * @type {boolean}
         * @memberof BooleanLiteral
         */
        get value() { return this._value; }
        /**
         * Evaluates the current expression, simply returning the literal value.
         * @param {C} context - The contextual object that is associatd with statement evaluation.
         * @return {boolean} The literal value contained by this statement.
         * @memberof BooleanLiteral
         */
        evaluate(context) { return this._value; }
        /**
         * Gets a string value of the current literal value.
         * @return {string} A string value of the current literal value, using {@link JSON.stringify}.
         * @memberof BooleanLiteral
         */
        toString() { return JSON.stringify(this._value); }
    }
    statements.BooleanLiteral = BooleanLiteral;
    function isBooleanLiteral(value) { return typeof value === 'object' && value != null && value instanceof BooleanLiteral; }
    /**
     * Concrete class for a statement that represents a boolean variable.
     * @export
     * @class BooleanVariable
     * @implements {IBooleanStatement<C>}
     * @implements {IVariableStatement<C, boolean>}
     * @template C The type of context object is used for retrieving the value of the variable.
     */
    class BooleanVariable {
        /**
         * Creates an instance of BooleanVariable.
         * @param {string} _name - The name of the variable to be represented.
         * @param {IValueAccessor<C, boolean>} _accessor - The function that returns the value of the variable, given the specified context object.
         * @memberof BooleanVariable
         * @throws {TypeError} - The accessor function is undefined or null or the variable name is undefined, null, not a string type or is not a valid variable name.
         */
        constructor(_name, _accessor) {
            this._name = _name;
            this._accessor = _accessor;
            if (!isValidVariableName(_name))
                throw new TypeError("Name parameter does not contain a valid variable name.");
            if (typeof _accessor !== 'function')
                throw new TypeError("Accessor parameter is not a function.");
        }
        /**
         * Gets the name of the variable.
         * @return {string} The name of the variable represented by this statement.
         * @memberof BooleanVariable
         */
        get name() { return this._name; }
        /**
         * Gets the function that obtains the value of the variable using a specified context object.
         * @return {IValueAccessor<C, boolean>} A function that obtains the value of the variable using a specified context object.
         * @memberof BooleanVariable
         */
        get accessor() { return this._accessor; }
        /**
         * Evaluates the current expression by invoking the {@link #accessor}.
         * @param {C} context - The contextual object that is used to get the value of the variable being represented.
         * @return {boolean} The value returned by the {@link #accessor} function.
         * @memberof BooleanVariable
         */
        evaluate(context) { return this._accessor(context); }
        /**
         * Gets a string representation of the current statement, which is the name of the variable.
         * @return {string} The name of the variable.
         * @memberof BooleanVariable
         */
        toString() { return this._name; }
        /**
         * Creates a new {@link BooleanVariable} to reference the {@link IVipCalculationContext#vip} property.
         * @static
         * @template T The type of object that contains the {@link IVipCalculationContext#vip} property.
         * @return {BooleanVariable<T>} A statement object representing the {@link IVipCalculationContext#vip} property.
         * @memberof BooleanVariable
         */
        static createForVip() {
            return new BooleanVariable("vip", function (context) { return context.vip; });
        }
        /**
         * Creates a new {@link BooleanVariable} to reference the {@link IBusinessRelatedCalculationContext#businessRelated} property.
         * @static
         * @template T The type of object that contains the {@link IBusinessRelatedCalculationContext#businessRelated} property.
         * @return {BooleanVariable<T>} A statement object representing the {@link IBusinessRelatedCalculationContext#businessRelated} property.
         * @memberof BooleanVariable
         */
        static createForBusinessRelated() {
            return new BooleanVariable("businessRelated", function (context) { return context.businessRelated; });
        }
    }
    statements.BooleanVariable = BooleanVariable;
    /**
     * Concrete class for a logical AND statement.
     * @export
     * @class And
     * @implements {ILogicalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    class And {
        constructor(_lOperand, _rOperand) {
            this._lOperand = _lOperand;
            this._rOperand = _rOperand;
            this.id = Symbol();
            if (typeof _lOperand === 'undefined' || _lOperand == null)
                throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null)
                throw new TypeError("Invalid right operand.");
        }
        [Symbol.iterator]() { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length() { return 2; }
        get operator() { return Operator.and; }
        /**
         * Gets the operand representing the first value in the logical operation.
         * @return {IBooleanStatement<C>} The statement representing the value to the left of the operator.
         * @memberof And
         */
        get lOperand() { return this._lOperand; }
        /**
         * Gets the operand representing the second value in the logical operation.
         * @return {IBooleanStatement<C>} The statement representing the value to the right of the operator.
         * @memberof And
         */
        get rOperand() { return this._rOperand; }
        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof And
         */
        evaluate(context) { return this._lOperand.evaluate(context) && this._rOperand.evaluate(context); }
        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof And
         */
        toString() {
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof And)) ? "(" + this._lOperand.toString() + ")" : this._lOperand.toString()) + " && " +
                ((isCompoundStatement(this._rOperand) && !(this._rOperand instanceof And)) ? "(" + this._rOperand.toString() + ")" : this._rOperand.toString());
        }
        get(index) {
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
    statements.And = And;
    /**
     * Concrete class for a logical OR statement.
     * @export
     * @class Or
     * @implements {ILogicalOperationStatement<C>}
     * @template C The type of context object that can be referenced during evaluation.
     */
    class Or {
        constructor(_lOperand, _rOperand) {
            this._lOperand = _lOperand;
            this._rOperand = _rOperand;
            this.id = Symbol();
            if (typeof _lOperand === 'undefined' || _lOperand == null)
                throw new TypeError("Invalid left operand.");
            if (typeof _rOperand === 'undefined' || _rOperand == null)
                throw new TypeError("Invalid right operand.");
        }
        [Symbol.iterator]() { return [this._lOperand, this._rOperand][Symbol.iterator](); }
        get length() { return 2; }
        get operator() { return Operator.or; }
        /**
         * Gets the operand representing the first value in the logical operation.
         * @return {IBooleanStatement<C>} The statement representing the value to the left of the operator.
         * @memberof Or
         */
        get lOperand() { return this._lOperand; }
        /**
         * Gets the operand representing the second value in the logical operation.
         * @return {INumericalStatement<C>} The statement representing the value to the right of the operator.
         * @memberof Or
         */
        get rOperand() { return this._rOperand; }
        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof Or
         */
        evaluate(context) { return this._lOperand.evaluate(context) || this._rOperand.evaluate(context); }
        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof Or
         */
        toString() {
            return ((isCompoundStatement(this._lOperand) && !(this._lOperand instanceof Or)) ? "(" + this._lOperand.toString() + ")" : this._lOperand.toString()) + " || " +
                ((isCompoundStatement(this._rOperand) && !(this._rOperand instanceof Or)) ? "(" + this._rOperand.toString() + ")" : this._rOperand.toString());
        }
        get(index) {
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
    statements.Or = Or;
    class NumericalTernary {
        constructor(_conditional, _ifTrue, _otherwise) {
            this._conditional = _conditional;
            this._ifTrue = _ifTrue;
            this._otherwise = _otherwise;
            this.id = Symbol();
            if (typeof _conditional === 'undefined' || _conditional == null)
                throw new TypeError("Invalid conditional statement.");
            if (typeof _ifTrue === 'undefined' || _ifTrue == null)
                throw new TypeError("Invalid ifTrue statement.");
            if (typeof _otherwise === 'undefined' || _otherwise == null)
                throw new TypeError("Invalid otherwise statement .");
        }
        [Symbol.iterator]() { return [this._conditional, this._ifTrue, this._otherwise][Symbol.iterator](); }
        get length() { return 3; }
        get conditional() { return this._conditional; }
        get ifTrueStatement() { return this._ifTrue; }
        get otherwiseStatement() { return this._otherwise; }
        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof NumericalTernary
         */
        evaluate(context) {
            return this._conditional.evaluate(context) ? this._ifTrue.evaluate(context) : this._otherwise.evaluate(context);
        }
        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof NumericalTernary
         */
        toString() {
            return (isCompoundStatement(this._conditional) ? "(" + this._conditional.toString() + ")" : this._conditional.toString()) + " ? " +
                (isCompoundStatement(this._ifTrue) ? "(" + this._ifTrue.toString() + ")" : this._ifTrue.toString()) + " : " + this._otherwise.toString();
        }
        get(index) {
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
        static createForVip(ifTrue, otherwise) {
            return new NumericalTernary(BooleanVariable.createForVip(), ifTrue, otherwise);
        }
        static createForBusinessRelated(ifTrue, otherwise) {
            return new NumericalTernary(BooleanVariable.createForBusinessRelated(), ifTrue, otherwise);
        }
    }
    statements.NumericalTernary = NumericalTernary;
    class BooleanTernary {
        constructor(_conditional, _ifTrue, _otherwise) {
            this._conditional = _conditional;
            this._ifTrue = _ifTrue;
            this._otherwise = _otherwise;
            this.id = Symbol();
            if (typeof _conditional === 'undefined' || _conditional == null)
                throw new TypeError("Invalid conditional statement.");
            if (typeof _ifTrue === 'undefined' || _ifTrue == null)
                throw new TypeError("Invalid ifTrue statement.");
            if (typeof _otherwise === 'undefined' || _otherwise == null)
                throw new TypeError("Invalid otherwise statement .");
        }
        [Symbol.iterator]() { return [this._conditional, this._ifTrue, this._otherwise][Symbol.iterator](); }
        get length() { return 3; }
        get conditional() { return this._conditional; }
        get ifTrueStatement() { return this._ifTrue; }
        get otherwiseStatement() { return this._otherwise; }
        canBeSimplified() {
            throw new Error("Method not implemented.");
        }
        asSimplified() {
            throw new Error("Method not implemented.");
        }
        /**
         * Evaluates the current expression by multiplying the results of the evaluation of all operands contained within this statement.
         * @param {C} context - The context object that can be referenced during evaluation.
         * @return {number} The product of all the evaluated operand values.
         * @memberof BooleanTernary
         */
        evaluate(context) {
            return this._conditional.evaluate(context) ? this._ifTrue.evaluate(context) : this._otherwise.evaluate(context);
        }
        /**
         * Gets a string representation of this statement.
         * @return {string} A JavaScript string representation of this statement.
         * @memberof BooleanTernary
         */
        toString() {
            return (isCompoundStatement(this._conditional) ? "(" + this._conditional.toString() + ")" : this._conditional.toString()) + " ? " +
                (isCompoundStatement(this._ifTrue) ? "(" + this._ifTrue.toString() + ")" : this._ifTrue.toString()) + " : " + this._otherwise.toString();
        }
        get(index) {
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
        static createForVip(ifTrue, otherwise) {
            return new BooleanTernary(BooleanVariable.createForVip(), ifTrue, otherwise);
        }
        static createForBusinessRelated(ifTrue, otherwise) {
            return new BooleanTernary(BooleanVariable.createForBusinessRelated(), ifTrue, otherwise);
        }
    }
    statements.BooleanTernary = BooleanTernary;
    /**
     * Sub-module for normalizing statements.
     * @namespace
     */
    let normalizers;
    (function (normalizers) {
        /**
         * Creates a new numeric literal statement with the sign of the value inverted.
         * @export
         * @template C The type of object associated with evaluation.
         * @param {NumericalLiteral<C>} statement - The statement to invert.
         * @return {NumericalLiteral<C>} The numeric literal statement with the sign of the value inverted.
         */
        function negateLiteral(statement) { return (statement.value == 0) ? statement : new NumericalLiteral(statement.value * -1); }
        normalizers.negateLiteral = negateLiteral;
        /**
         * Normalizes a numerical statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @param {INumericalStatement<C>} statement - The statement to normalize.
         * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
         * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
         * @return {INumericalStatement<C>} The normalized copy of the original statement or the original statement, if it was already normalized.
         */
        function normalizeNumeric(statement, ifNormalized, ifNotNormalized) {
            if (statement instanceof Sum)
                return sum.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Difference)
                return difference.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Product)
                return product.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Quotient)
                return quotient.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Round)
                return round.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof NumericalTernary)
                return numericTernary.normalize(statement, ifNormalized, ifNotNormalized);
            return (typeof ifNotNormalized === 'function') ? ifNotNormalized(statement) : statement;
        }
        normalizers.normalizeNumeric = normalizeNumeric;
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
        function fromNormalizedNumeric(statement, ifNormalized, ifNotNormalized) {
            if (statement instanceof Sum)
                return sum.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Difference)
                return difference.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Product)
                return product.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Quotient)
                return quotient.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Round)
                return round.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof NumericalTernary)
                return numericTernary.fromNormalized(statement, ifNormalized, ifNotNormalized);
            return ifNotNormalized(statement);
        }
        normalizers.fromNormalizedNumeric = fromNormalizedNumeric;
        /**
         * Normalizes a numerical statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @param {INumericalStatement<C>} statement - The statement to be normalized.
         * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>} An object that contains the normalized statement and a value indicating whether the original statement was actually normalized.
         */
        function tryNormalizeNumeric(statement) {
            if (statement instanceof Sum)
                return sum.tryNormalize(statement);
            if (statement instanceof Difference)
                return difference.tryNormalize(statement);
            if (statement instanceof Product)
                return product.tryNormalize(statement);
            if (statement instanceof Quotient)
                return quotient.tryNormalize(statement);
            if (statement instanceof Round)
                return round.tryNormalize(statement);
            if (statement instanceof NumericalTernary)
                return numericTernary.tryNormalize(statement);
            return { statement: statement, wasNormalized: false };
        }
        normalizers.tryNormalizeNumeric = tryNormalizeNumeric;
        /**
         * Normalizes a boolean statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @param {IBooleanStatement<C>} statement - The statement to be normalized.
         * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
         * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
         * @return {IBooleanStatement<C>} The normalized copy of the original statement or the original statement, if it was already normalized.
         */
        function normalizeBoolean(statement, ifNormalized, ifNotNormalized) {
            if (statement instanceof And)
                return and.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Or)
                return or.normalize(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof BooleanTernary)
                return booleanTernary.normalize(statement, ifNormalized, ifNotNormalized);
            return (typeof ifNotNormalized === 'function') ? ifNotNormalized(statement) : statement;
        }
        normalizers.normalizeBoolean = normalizeBoolean;
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
        function fromNormalizedBoolean(statement, ifNormalized, ifNotNormalized) {
            if (statement instanceof And)
                return and.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof Or)
                return or.fromNormalized(statement, ifNormalized, ifNotNormalized);
            if (statement instanceof BooleanTernary)
                return booleanTernary.fromNormalized(statement, ifNormalized, ifNotNormalized);
            return ifNotNormalized(statement);
        }
        normalizers.fromNormalizedBoolean = fromNormalizedBoolean;
        /**
         * Normalizes a boolean statement.
         * @export
         * @template C The type of object that can be referenced for evaluation.
         * @param {IBooleanStatement<C>} statement - The statement to be normalized.
         * @return {ITryNormalizeResult<C, boolean, IBooleanStatement<C>>} An object that contains the normalized statement and a value indicating whether the original statement was actually normalized.
         */
        function tryNormalizeBoolean(statement) {
            if (statement instanceof And)
                return and.tryNormalize(statement);
            if (statement instanceof Or)
                return or.tryNormalize(statement);
            if (statement instanceof BooleanTernary)
                return booleanTernary.tryNormalize(statement);
            return { statement: statement, wasNormalized: false };
        }
        normalizers.tryNormalizeBoolean = tryNormalizeBoolean;
        function toNormalizedResult(statement) { return { statement: statement, wasNormalized: true }; }
        function toNotNormalizedResult(statement) { return { statement: statement, wasNormalized: false }; }
        /**
         * Sub-module for normalizing {@link Sum} statements.
         * @namespace
         */
        let sum;
        (function (sum) {
            /**
             * Creates a normalized boolean expression from numerical statements joined by addition operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} lValue - The first value in the addition operation.
             * @param {...INumericalStatement<C>[]} rValues - Additional values in the addition operation.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function create(lValue, ...rValues) {
                throw new Error("Method not implemented.");
            }
            sum.create = create;
            function withNormalizedOperands(original, lValue, rValue, ifNormalized, ifNotNormalized, forceNormalized) {
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                return fromNormalizedNumeric(statement.lOperand, function (lValue) {
                    return fromNormalizedNumeric(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function (lValue) {
                    return fromNormalizedNumeric(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }
            sum.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of an addition statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Sum<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            sum.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from an addition statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Sum<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Sum<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            sum.normalize = normalize;
        })(sum = normalizers.sum || (normalizers.sum = {}));
        /**
         * Sub-module for normalizing {@link Difference} statements.
         * @namespace
         */
        let difference;
        (function (difference) {
            /**
             * Creates a normalized boolean expression from numerical statements joined by subtraction operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} lValue - The first value in the subtraction operation.
             * @param {...INumericalStatement<C>[]} rValues - Additional values in the subtraction operation.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function create(lValue, ...rValues) {
                throw new Error("Method not implemented.");
            }
            difference.create = create;
            function withNormalizedOperands(original, lValue, rValue, ifNormalized, ifNotNormalized, forceNormalized) {
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                return fromNormalizedNumeric(statement.lOperand, function (lValue) {
                    return fromNormalizedNumeric(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function (lValue) {
                    return fromNormalizedNumeric(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }
            difference.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of a subtraction statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Difference<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            difference.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from a subtraction statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Difference<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Difference<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            difference.normalize = normalize;
        })(difference = normalizers.difference || (normalizers.difference = {}));
        /**
         * Sub-module for normalizing {@link Product} statements.
         * @namespace
         */
        let product;
        (function (product) {
            /**
             * Creates a normalized boolean expression from numerical statements joined by multiplication operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} lValue - The first value in the multiplication operation.
             * @param {...INumericalStatement<C>[]} rValues - Additional values in the multiplication operation.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function create(lValue, ...rValues) {
                throw new Error("Method not implemented.");
            }
            product.create = create;
            function withNormalizedOperands(original, lValue, rValue, ifNormalized, ifNotNormalized, forceNormalized) {
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                return fromNormalizedNumeric(statement.lOperand, function (lValue) {
                    return fromNormalizedNumeric(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function (lValue) {
                    return fromNormalizedNumeric(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }
            product.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of a multiplication statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Product<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            product.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from a multiplication statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Product<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Product<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            product.normalize = normalize;
        })(product = normalizers.product || (normalizers.product = {}));
        /**
         * Sub-module for normalizing {@link Quotient} statements.
         * @namespace
         */
        let quotient;
        (function (quotient) {
            /**
             * Creates a normalized boolean expression from numerical statements joined by division operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} dividend - The dividend for the division operation.
             * @param {...INumericalStatement<C>[]} divisors - The divisors for the division operation.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function create(dividend, ...divisors) {
                throw new Error("Method not implemented.");
            }
            quotient.create = create;
            function withNormalizedOperands(original, lValue, rValue, ifNormalized, ifNotNormalized, forceNormalized) {
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                return fromNormalizedNumeric(statement.lOperand, function (lValue) {
                    return fromNormalizedNumeric(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function (lValue) {
                    return fromNormalizedNumeric(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }
            quotient.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of a division statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Quotient<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            quotient.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from a division statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Quotient<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Quotient<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            quotient.normalize = normalize;
        })(quotient = normalizers.quotient || (normalizers.quotient = {}));
        /**
         * Sub-module for normalizing {@link Round} statements.
         * @namespace
         */
        let round;
        (function (round) {
            /**
             * Creates a normalized numeric expression from a numerical statement used as a parameter to a normalization function.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {INumericalStatement<C>} statement - The argument for the rounding function.
             * @param {RoundingType} type
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function create(statement, type) {
                throw new Error("Method not implemented.");
            }
            round.create = create;
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                throw new Error("Method not implemented.");
            }
            round.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of a rounding statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Round<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            round.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from a rounding statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Round<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, Round<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            round.normalize = normalize;
        })(round = normalizers.round || (normalizers.round = {}));
        /**
         * Sub-module for normalizing {@link And} statements.
         * @namespace
         */
        let and;
        (function (and) {
            /**
             * Creates a normalized boolean expression from boolean statements joined by logical AND operators.
             * @export
             * @template C The type of object that can be referenced for evaluation
             * @param {IBooleanStatement<C>[]} lValue - The first value in the logical AND operation.
             * @param {...IBooleanStatement<C>[]} rValues - Additional values in the logical AND operation.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            function create(lValue, ...rValues) {
                throw new Error("Method not implemented.");
            }
            and.create = create;
            function withNormalizedOperands(original, lValue, rValue, ifNormalized, ifNotNormalized, forceNormalized) {
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                return fromNormalizedBoolean(statement.lOperand, function (lValue) {
                    return fromNormalizedBoolean(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function (lValue) {
                    return fromNormalizedBoolean(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }
            and.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of a logical AND statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {And<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, boolean, IBooleanStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            and.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from a logical AND statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {And<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, boolean, And<C>, IBooleanStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            and.normalize = normalize;
        })(and = normalizers.and || (normalizers.and = {}));
        /**
         * Sub-module for normalizing {@link Or} statements.
         * @namespace
         */
        let or;
        (function (or) {
            /**
             * Creates a normalized boolean expression from boolean statements joined by logical OR operators.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {IBooleanStatement<C>[]} lValue - The first value in the logical OR operation.
             * @param {...IBooleanStatement<C>[]} rValues - Additional values in the logical OR operation.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            function create(lValue, ...rValues) {
                throw new Error("Method not implemented.");
            }
            or.create = create;
            function withNormalizedOperands(original, lValue, rValue, ifNormalized, ifNotNormalized, forceNormalized) {
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                return fromNormalizedBoolean(statement.lOperand, function (lValue) {
                    return fromNormalizedBoolean(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    });
                }, function (lValue) {
                    return fromNormalizedBoolean(statement.rOperand, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, true);
                    }, function (rValue) {
                        return withNormalizedOperands(statement, lValue, rValue, ifNormalized, ifNotNormalized, false);
                    });
                });
            }
            or.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of a logical OR statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Or<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, boolean, IBooleanStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            or.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from a logical OR statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {Or<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, boolean, Or<C>, IBooleanStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            or.normalize = normalize;
        })(or = normalizers.or || (normalizers.or = {}));
        /**
         * Sub-module for normalizing {@link NumericalTernary} statements.
         * @namespace
         */
        let numericTernary;
        (function (numericTernary) {
            /**
             * Creates a normalized numeric expression from a conditional expression and alternate statements.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {IBooleanStatement<C>} conditional
             * @param {INumericalStatement<C>} ifTrue
             * @param {INumericalStatement<C>} otherwise
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function create(conditional, ifTrue, otherwise) {
                throw new Error("Method not implemented.");
            }
            numericTernary.create = create;
            function withNormalizedOperands(original, conditional, ifTrue, otherwise, ifNormalized, ifNotNormalized, forceNormalized) {
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                return fromNormalizedBoolean(statement.conditional, function (conditional) {
                    return fromNormalizedNumeric(statement.ifTrueStatement, function (ifTrueStatement) {
                        return fromNormalizedNumeric(statement.ifTrueStatement, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    }, function (ifTrueStatement) {
                        return fromNormalizedNumeric(statement.ifTrueStatement, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    });
                }, function (conditional) {
                    return fromNormalizedNumeric(statement.ifTrueStatement, function (ifTrueStatement) {
                        return fromNormalizedNumeric(statement.ifTrueStatement, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    }, function (ifTrueStatement) {
                        return fromNormalizedNumeric(statement.ifTrueStatement, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, false);
                        });
                    });
                });
            }
            numericTernary.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of a ternary numerical statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {NumericalTernary<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, number, INumericalStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            numericTernary.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from a ternary numerical statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {NumericalTernary<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, number, INumericalStatement<C>, INumericalStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, number, NumericalTernary<C>, INumericalStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {INumericalStatement<C>} - The normalized numerical statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            numericTernary.normalize = normalize;
        })(numericTernary = normalizers.numericTernary || (normalizers.numericTernary = {}));
        /**
         * Sub-module for normalizing {@link BooleanTernary} statements.
         * @namespace
         */
        let booleanTernary;
        (function (booleanTernary) {
            /**
             * Creates a normalized boolean expression from a conditional expression and alternate statements.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {IBooleanStatement<C>} conditional
             * @param {IBooleanStatement<C>} ifTrue
             * @param {IBooleanStatement<C>} otherwise
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            function create(conditional, ifTrue, otherwise) {
                throw new Error("Method not implemented.");
            }
            booleanTernary.create = create;
            function withNormalizedOperands(original, conditional, ifTrue, otherwise, ifNormalized, ifNotNormalized, forceNormalized) {
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
            function fromNormalized(statement, ifNormalized, ifNotNormalized) {
                return fromNormalizedBoolean(statement.conditional, function (conditional) {
                    return fromNormalizedBoolean(statement.ifTrueStatement, function (ifTrueStatement) {
                        return fromNormalizedBoolean(statement.ifTrueStatement, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    }, function (ifTrueStatement) {
                        return fromNormalizedBoolean(statement.ifTrueStatement, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    });
                }, function (conditional) {
                    return fromNormalizedBoolean(statement.ifTrueStatement, function (ifTrueStatement) {
                        return fromNormalizedBoolean(statement.ifTrueStatement, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        });
                    }, function (ifTrueStatement) {
                        return fromNormalizedBoolean(statement.ifTrueStatement, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, true);
                        }, function (otherwiseStatement) {
                            return withNormalizedOperands(statement, conditional, ifTrueStatement, otherwiseStatement, ifNormalized, ifNotNormalized, false);
                        });
                    });
                });
            }
            booleanTernary.fromNormalized = fromNormalized;
            /**
             * Gets the results of the normalization of a ternary boolean statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {BooleanTernary<C>} statement - The statement to be normalized.
             * @return {ITryNormalizeResult<C, boolean, IBooleanStatement<C>>}
             */
            function tryNormalize(statement) {
                return fromNormalized(statement, toNormalizedResult, toNotNormalizedResult);
            }
            booleanTernary.tryNormalize = tryNormalize;
            /**
             * Gets a normalized numerical value from a ternary boolean statement.
             * @export
             * @template C The type of object that can be referenced for evaluation.
             * @param {BooleanTernary<C>} statement - The statement to be normalized.
             * @param {IMapStatementFunc<C, boolean, IBooleanStatement<C>, IBooleanStatement<C>>} [ifNormalized] - The callback function that produces the final value when the statement has been normalized. If not provided, the normalized statement is returned.
             * @param {IMapStatementFunc<C, boolean, BooleanTernary<C>, IBooleanStatement<C>>} [ifNotNormalized] - The callback method that produces the return value if the original statement did not need to e normalized. If not supplied, the original statement is returned.
             * @return {IBooleanStatement<C>} - The normalized boolean statement.
             */
            function normalize(statement, ifNormalized, ifNotNormalized) {
                return fromNormalized(statement, function (s) {
                    return (typeof ifNormalized === 'function') ? ifNormalized(s) : s;
                }, function (s) {
                    return (typeof ifNotNormalized === 'function') ? ifNotNormalized(s) : s;
                });
            }
            booleanTernary.normalize = normalize;
        })(booleanTernary = normalizers.booleanTernary || (normalizers.booleanTernary = {}));
    })(normalizers = statements.normalizers || (statements.normalizers = {}));
})(statements || (statements = {}));
//# sourceMappingURL=statements.js.map