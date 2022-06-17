"use strict";
var itilPriorityCalculator;
(function (itilPriorityCalculator) {
    'use strict';
    let RoundingType;
    (function (RoundingType) {
        RoundingType["ceiling"] = "ceiling";
        RoundingType["floor"] = "floor";
        RoundingType["nearest"] = "nearest";
    })(RoundingType || (RoundingType = {}));
    function isRoundingType(value) {
        return typeof value === 'string' && (value === RoundingType.ceiling || value === RoundingType.floor || value === RoundingType.nearest);
    }
    let BaseFormulaType;
    (function (BaseFormulaType) {
        BaseFormulaType["multiply"] = "multiply";
        BaseFormulaType["add"] = "add";
        BaseFormulaType["multiplyAdd"] = "multiplyAdd";
        BaseFormulaType["addMultiply"] = "addMultiply";
    })(BaseFormulaType || (BaseFormulaType = {}));
    let ResultFieldName;
    (function (ResultFieldName) {
        ResultFieldName["urgency"] = "urgency";
        ResultFieldName["impact"] = "impact";
        ResultFieldName["vip"] = "vip";
        ResultFieldName["businessCritical"] = "businessCritical";
        ResultFieldName["priority"] = "priority";
    })(ResultFieldName || (ResultFieldName = {}));
    let Operator;
    (function (Operator) {
        Operator["None"] = "";
        Operator["Multiply"] = "*";
        Operator["Divide"] = "/";
        Operator["Add"] = "+";
        Operator["Subtract"] = "-";
        Operator["Ternary"] = "?";
        Operator["Equals"] = "==";
        Operator["NotEquals"] = "!=";
        Operator["LessThan"] = "<";
        Operator["GreaterThan"] = ">";
        Operator["NotLessThan"] = ">=";
        Operator["NotGreaterThan"] = "<=";
    })(Operator || (Operator = {}));
    class TernaryOperation {
        constructor(_conditional, _ifTrueStatement, _otherwiseStatement) {
            this._conditional = _conditional;
            this._ifTrueStatement = _ifTrueStatement;
            this._otherwiseStatement = _otherwiseStatement;
        }
        getValue(source) { return this._conditional.getValue(source) ? this._ifTrueStatement.getValue(source) : this._otherwiseStatement.getValue(source); }
        toString() {
            if (this._conditional.getOperator() == Operator.None) {
                if (this._ifTrueStatement.getOperator() == Operator.Ternary)
                    return this._conditional.toString() + " ? (" + this._ifTrueStatement.toString() + ") : " + this._otherwiseStatement.toString();
                return this._conditional.toString() + " ? " + this._ifTrueStatement.toString() + " : " + this._otherwiseStatement.toString();
            }
            if (this._ifTrueStatement.getOperator() == Operator.Ternary)
                return "(" + this._conditional.toString() + ") ? (" + this._ifTrueStatement.toString() + ") : " + this._otherwiseStatement.toString();
            return "(" + this._conditional.toString() + ") ? " + this._ifTrueStatement.toString() + " : " + this._otherwiseStatement.toString();
        }
        getOperator() { return Operator.Ternary; }
    }
    class MathOperation {
        constructor(_lValue, _operator, _rValue) {
            this._lValue = _lValue;
            this._operator = _operator;
            this._rValue = _rValue;
        }
        static add(lValue, rValue) {
            if (rValue instanceof LiteralStatement) {
                if (rValue.value == 0)
                    return lValue;
                if (rValue.value < 0)
                    return new MathOperation(lValue, Operator.Subtract, new LiteralStatement(0 - rValue.value));
                if (lValue instanceof LiteralStatement)
                    return (lValue.value == 0) ? rValue : new LiteralStatement(lValue.value + rValue.value);
            }
            else if (lValue instanceof LiteralStatement) {
                if (lValue.value == 0)
                    return rValue;
                if (lValue.value < 0)
                    return new MathOperation(rValue, Operator.Subtract, new LiteralStatement(0 - lValue.value));
            }
            return new MathOperation(lValue, Operator.Add, rValue);
        }
        static subtract(lValue, rValue) {
            if (rValue instanceof LiteralStatement) {
                if (rValue.value == 0)
                    return lValue;
                if (rValue.value < 0)
                    return new MathOperation(lValue, Operator.Add, new LiteralStatement(0 - rValue.value));
                if (lValue instanceof LiteralStatement)
                    return new LiteralStatement(lValue.value - rValue.value);
            }
            return new MathOperation(lValue, Operator.Subtract, rValue);
        }
        static multiply(lValue, rValue) {
            if (lValue instanceof LiteralStatement) {
                if (lValue.value == 0)
                    return rValue;
                if (rValue instanceof LiteralStatement)
                    return (rValue.value == 0) ? lValue : new LiteralStatement(lValue.value * rValue.value);
            }
            else if (rValue instanceof LiteralStatement && rValue.value == 0)
                return lValue;
            return new MathOperation(lValue, Operator.Multiply, rValue);
        }
        static divide(lValue, rValue) {
            if (rValue instanceof LiteralStatement) {
                if (rValue.value == 0)
                    throw new Error("Denominator cannot be zero");
                if (rValue.value == 1)
                    return lValue;
                if (lValue instanceof LiteralStatement)
                    return new LiteralStatement(lValue.value * rValue.value);
            }
            else if (lValue instanceof LiteralStatement && lValue.value == 0)
                return lValue;
            return new MathOperation(lValue, Operator.Divide, rValue);
        }
        getValue(source) {
            switch (this._operator) {
                case Operator.Multiply:
                    return this._lValue.getValue(source) * this._rValue.getValue(source);
                case Operator.Divide:
                    return this._lValue.getValue(source) / this._rValue.getValue(source);
                case Operator.Subtract:
                    return this._lValue.getValue(source) - this._rValue.getValue(source);
                default:
                    return this._lValue.getValue(source) + this._rValue.getValue(source);
            }
        }
        toString() {
            switch (this._operator) {
                case Operator.Multiply:
                    switch (this._rValue.getOperator()) {
                        case Operator.Multiply:
                        case Operator.None:
                            switch (this._lValue.getOperator()) {
                                case Operator.Multiply:
                                case Operator.None:
                                    break;
                                default:
                                    return "(" + this._lValue.toString() + ") * " + this._rValue.toString();
                            }
                            break;
                        default:
                            switch (this._lValue.getOperator()) {
                                case Operator.Multiply:
                                case Operator.None:
                                    return this._lValue.toString() + " * (" + this._rValue.toString() + ")";
                                default:
                                    return "(" + this._lValue.toString() + ") * (" + this._rValue.toString() + ")";
                            }
                    }
                case Operator.Divide:
                    switch (this._rValue.getOperator()) {
                        case Operator.Divide:
                        case Operator.None:
                            switch (this._lValue.getOperator()) {
                                case Operator.Divide:
                                case Operator.None:
                                    break;
                                default:
                                    return "(" + this._lValue.toString() + ") / " + this._rValue.toString();
                            }
                            break;
                        default:
                            switch (this._lValue.getOperator()) {
                                case Operator.Divide:
                                case Operator.None:
                                    return this._lValue.toString() + " / (" + this._rValue.toString() + ")";
                                default:
                                    return "(" + this._lValue.toString() + ") / (" + this._rValue.toString() + ")";
                            }
                    }
                default:
                    switch (this._lValue.getOperator()) {
                        case Operator.Add:
                        case Operator.Subtract:
                        case Operator.None:
                            switch (this._rValue.getOperator()) {
                                case Operator.Add:
                                case Operator.Subtract:
                                case Operator.None:
                                    break;
                                default:
                                    return this._lValue.toString() + " " + this._operator + " (" + this._rValue.toString() + ")";
                            }
                            break;
                        default:
                            switch (this._rValue.getOperator()) {
                                case Operator.Add:
                                case Operator.Subtract:
                                case Operator.None:
                                    return "(" + this._lValue.toString() + ") " + this._operator + " " + this._rValue.toString();
                                default:
                                    return "(" + this._lValue.toString() + ") " + this._operator + " (" + this._rValue.toString() + ")";
                            }
                    }
            }
            return this._lValue.toString() + " " + this._operator + " " + this._rValue.toString();
        }
        getOperator() { return this._operator; }
    }
    class ComparisonOperation {
        constructor(_lValue, _operator, _rValue, _exact = false) {
            this._lValue = _lValue;
            this._operator = _operator;
            this._rValue = _rValue;
            this._exact = _exact;
        }
        getValue(source) {
            switch (this._operator) {
                case Operator.NotEquals:
                    return this._exact ? this._lValue.getValue(source) !== this._rValue.getValue(source) : this._lValue.getValue(source) != this._rValue.getValue(source);
                case Operator.LessThan:
                    return this._lValue.getValue(source) < this._rValue.getValue(source);
                case Operator.NotGreaterThan:
                    return this._lValue.getValue(source) <= this._rValue.getValue(source);
                case Operator.GreaterThan:
                    return this._lValue.getValue(source) > this._rValue.getValue(source);
                case Operator.NotLessThan:
                    return this._lValue.getValue(source) >= this._rValue.getValue(source);
                default:
                    return this._exact ? this._lValue.getValue(source) === this._rValue.getValue(source) : this._lValue.getValue(source) == this._rValue.getValue(source);
            }
        }
        toString() {
            if (this._lValue.getOperator() == Operator.None) {
                if (this._rValue.getOperator() == Operator.None)
                    return this._lValue.toString() + " " + this._operator + " " + this._rValue.toString();
                return this._lValue.toString() + " " + this._operator + " (" + this._rValue.toString() + ")";
            }
            if (this._rValue.getOperator() == Operator.None)
                return "(" + this._lValue.toString() + ") " + this._operator + " " + this._rValue.toString();
            return "(" + this._lValue.toString() + ") " + this._operator + " (" + this._rValue.toString() + ")";
        }
        getOperator() { return this._operator; }
    }
    class VariableStatement {
        constructor(name, _accessor) {
            this.name = name;
            this._accessor = _accessor;
        }
        getValue(source) { return this._accessor(source); }
        toString() { return this.name; }
        getOperator() { return Operator.None; }
    }
    class LiteralStatement {
        constructor(value) {
            this.value = value;
        }
        getValue(source) { return this.value; }
        toString() { return JSON.stringify(this.value); }
        getOperator() { return Operator.None; }
    }
    function isBaseFormulaType(value) {
        return typeof value === 'string' && (value === BaseFormulaType.multiply || value === BaseFormulaType.add || value === BaseFormulaType.multiplyAdd || value === BaseFormulaType.addMultiply);
    }
    itilPriorityCalculator.mainModule = angular.module("mainModule", []);
    class MainController {
        constructor($scope) {
            this.$scope = $scope;
            this._urgencyRange = 3;
            this._impactRange = 3;
            this._priorityRange = 5;
            this._vipOption = false;
            this._businessCriticalOption = false;
            this._baseValue = 1;
            this._valueShift = 3;
            this._rounding = RoundingType.floor;
            this._vipWeight = 4;
            this._businessCriticalWeight = 2;
            this._baseFormula = BaseFormulaType.multiply;
            this._minIntermediateResult = 16;
            this._intermediateResultRange = 26;
            this._sortOrder = [
                { field: ResultFieldName.priority, descending: false },
                { field: ResultFieldName.impact, descending: false },
                { field: ResultFieldName.urgency, descending: false },
                { field: ResultFieldName.vip, descending: false },
                { field: ResultFieldName.businessCritical, descending: false }
            ];
            $scope.rangeValues = ["2", "3", "4", "5", "6", "7"];
            $scope.urgencyRange = '' + this._urgencyRange;
            $scope.impactRange = '' + this._impactRange;
            $scope.priorityRange = '' + this._priorityRange;
            $scope.vipOption = this._vipOption;
            $scope.businessCriticalOption = this._businessCriticalOption;
            $scope.baseValue = this._baseValue;
            $scope.valueShift = this._valueShift;
            $scope.rounding = this._rounding;
            $scope.vipWeight = this._vipWeight;
            $scope.businessCriticalWeight = this._businessCriticalWeight;
            $scope.baseFormula = this._baseFormula;
            $scope.urgencySortDirection = 0;
            $scope.impactSortDirection = 0;
            $scope.vipSortDirection = 0;
            $scope.businessCriticalSortDirection = 0;
            $scope.prioritySortDirection = 1;
            let controller = this;
            $scope.$watch('urgencyRange', function (newValue, oldValue, scope) {
                let value = parseInt('' + newValue);
                if (!isNaN(value))
                    controller.onUrgencyRangeChanged(value);
            });
            $scope.$watch('impactRange', function (newValue, oldValue, scope) {
                let value = parseInt('' + newValue);
                if (!isNaN(value))
                    controller.onImpactRangeChanged(value);
            });
            $scope.$watch('priorityRange', function (newValue, oldValue, scope) {
                let value = parseInt('' + newValue);
                if (!isNaN(value))
                    controller.onPriorityRangeChanged(value);
            });
            $scope.$watch('vipOption', function (newValue, oldValue, scope) {
                controller.onVipOptionChanged(newValue == true);
            });
            $scope.$watch('businessCriticalOption', function (newValue, oldValue, scope) {
                controller.onBusinessCriticalOptionChanged(newValue == true);
            });
            $scope.$watch('baseValue', function (newValue, oldValue, scope) {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue))
                        controller.onBaseValueChanged(newValue);
                }
                else if (typeof newValue === 'string') {
                    let value = parseInt(newValue);
                    if (!isNaN(value))
                        controller.onBaseValueChanged(value);
                }
            });
            $scope.$watch('valueShift', function (newValue, oldValue, scope) {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue))
                        controller.onValueShiftChanged(newValue);
                }
                else if (typeof newValue === 'string') {
                    let value = parseInt(newValue);
                    if (!isNaN(value))
                        controller.onValueShiftChanged(value);
                }
            });
            $scope.$watch('rounding', function (newValue, oldValue, scope) {
                if (isRoundingType(newValue))
                    controller.onRoundingChanged(newValue);
            });
            $scope.$watch('vipWeight', function (newValue, oldValue, scope) {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue))
                        controller.onVipWeightChanged(newValue);
                }
                else if (typeof newValue === 'string') {
                    let value = parseFloat(newValue);
                    if (!isNaN(value))
                        controller.onVipWeightChanged(value);
                }
            });
            $scope.$watch('businessCriticalWeight', function (newValue, oldValue, scope) {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue))
                        controller.onBusinessCriticalWeightChanged(newValue);
                }
                else if (typeof newValue === 'string') {
                    let value = parseFloat(newValue);
                    if (!isNaN(value))
                        controller.onBusinessCriticalWeightChanged(value);
                }
            });
            $scope.$watch('baseFormula', function (newValue, oldValue, scope) {
                if (isBaseFormulaType(newValue))
                    controller.onBaseFormulaChanged(newValue);
            });
            $scope.showRangesModal = function () { $('#rangesModal').modal('show'); };
            $scope.hideRangesModal = function () { $('#rangesModal').modal('hide'); };
            $scope.showBaseFormulaModal = function () { $('#baseFormulaModal').modal('show'); };
            $scope.hideBaseFormulaModal = function () { $('#baseFormulaModal').modal('hide'); };
            $scope.showOptionalValues = function () { $('#optionalValuesModal').modal('show'); };
            $scope.hideOptionalValues = function () { $('#optionalValuesModal').modal('hide'); };
            $scope.showRoundingOptions = function () { $('#roundingOptionsModal').modal('show'); };
            $scope.hideRoundingOptions = function () { $('#roundingOptionsModal').modal('hide'); };
            $scope.toggleUrgencySort = function () { controller.toggleSort(ResultFieldName.urgency); return false; };
            $scope.toggleImpactSort = function () { controller.toggleSort(ResultFieldName.impact); return false; };
            $scope.toggleVipSort = function () { controller.toggleSort(ResultFieldName.vip); return false; };
            $scope.toggleBusinessCriticalSort = function () { controller.toggleSort(ResultFieldName.businessCritical); return false; };
            $scope.togglePrioritySort = function () { controller.toggleSort(ResultFieldName.priority); return false; };
            this.recalculate();
        }
        applySort() {
            var sortOrder = this._sortOrder;
            var currentSort = sortOrder[0];
            switch (currentSort.field) {
                case ResultFieldName.urgency:
                    this.$scope.urgencySortDirection = currentSort.descending ? -1 : 1;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.vipSortDirection = 0;
                    this.$scope.businessCriticalSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                case ResultFieldName.impact:
                    this.$scope.impactSortDirection = currentSort.descending ? -1 : 1;
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.vipSortDirection = 0;
                    this.$scope.businessCriticalSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                case ResultFieldName.vip:
                    this.$scope.vipSortDirection = currentSort.descending ? -1 : 1;
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.businessCriticalSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                case ResultFieldName.businessCritical:
                    this.$scope.businessCriticalSortDirection = currentSort.descending ? -1 : 1;
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.vipSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                default:
                    this.$scope.prioritySortDirection = currentSort.descending ? -1 : 1;
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.vipSortDirection = 0;
                    this.$scope.businessCriticalSortDirection = 0;
                    break;
            }
            var diff;
            if (this._vipOption) {
                if (this._businessCriticalOption) {
                    this.$scope.calculationResults.sort(function (a, b) {
                        for (var index = 0; index < sortOrder.length; index++) {
                            var sortParameter = sortOrder[index];
                            switch (sortParameter.field) {
                                case ResultFieldName.impact:
                                    if ((diff = sortParameter.descending ? b.impact - a.impact : a.impact - b.impact) != 0)
                                        return diff;
                                    break;
                                case ResultFieldName.urgency:
                                    if ((diff = sortParameter.descending ? b.urgency - a.urgency : a.urgency - b.urgency) != 0)
                                        return diff;
                                    break;
                                case ResultFieldName.vip:
                                    if (a.optionalValues[0] == "Yes") {
                                        if (b.optionalValues[0] != "Yes")
                                            return sortParameter.descending ? 1 : -1;
                                    }
                                    else if (b.optionalValues[0] == "Yes")
                                        return sortParameter.descending ? -1 : 1;
                                    break;
                                case ResultFieldName.businessCritical:
                                    if (a.optionalValues[1] == "Yes") {
                                        if (b.optionalValues[1] != "Yes")
                                            return sortParameter.descending ? 1 : -1;
                                    }
                                    else if (b.optionalValues[1] == "Yes")
                                        return sortParameter.descending ? -1 : 1;
                                    break;
                                default:
                                    if ((diff = sortParameter.descending ? a.intermediateResult - b.intermediateResult : b.intermediateResult - a.intermediateResult) != 0)
                                        return diff;
                                    break;
                            }
                        }
                        return 0;
                    });
                }
                else {
                    this.$scope.calculationResults.sort(function (a, b) {
                        for (var index = 0; index < sortOrder.length; index++) {
                            var sortParameter = sortOrder[index];
                            switch (sortParameter.field) {
                                case ResultFieldName.impact:
                                    if ((diff = sortParameter.descending ? b.impact - a.impact : a.impact - b.impact) != 0)
                                        return diff;
                                    break;
                                case ResultFieldName.urgency:
                                    if ((diff = sortParameter.descending ? b.urgency - a.urgency : a.urgency - b.urgency) != 0)
                                        return diff;
                                    break;
                                case ResultFieldName.priority:
                                    if ((diff = sortParameter.descending ? a.intermediateResult - b.intermediateResult : b.intermediateResult - a.intermediateResult) != 0)
                                        return diff;
                                    break;
                                case ResultFieldName.vip:
                                    if (a.optionalValues[0] == "Yes") {
                                        if (b.optionalValues[0] != "Yes")
                                            return sortParameter.descending ? 1 : -1;
                                    }
                                    else if (b.optionalValues[0] == "Yes")
                                        return sortParameter.descending ? -1 : 1;
                                    break;
                            }
                        }
                        return 0;
                    });
                }
            }
            else if (this._businessCriticalOption) {
                this.$scope.calculationResults.sort(function (a, b) {
                    for (var index = 0; index < sortOrder.length; index++) {
                        var sortParameter = sortOrder[index];
                        switch (sortParameter.field) {
                            case ResultFieldName.impact:
                                if ((diff = sortParameter.descending ? b.impact - a.impact : a.impact - b.impact) != 0)
                                    return diff;
                                break;
                            case ResultFieldName.urgency:
                                if ((diff = sortParameter.descending ? b.urgency - a.urgency : a.urgency - b.urgency) != 0)
                                    return diff;
                                break;
                            case ResultFieldName.priority:
                                if ((diff = sortParameter.descending ? a.intermediateResult - b.intermediateResult : b.intermediateResult - a.intermediateResult) != 0)
                                    return diff;
                                break;
                            case ResultFieldName.businessCritical:
                                if (a.optionalValues[1] == "Yes") {
                                    if (b.optionalValues[1] != "Yes")
                                        return sortParameter.descending ? 1 : -1;
                                }
                                else if (b.optionalValues[1] == "Yes")
                                    return sortParameter.descending ? -1 : 1;
                                break;
                        }
                    }
                    return 0;
                });
            }
            else {
                this.$scope.calculationResults.sort(function (a, b) {
                    for (var index = 0; index < sortOrder.length; index++) {
                        var sortParameter = sortOrder[index];
                        switch (sortParameter.field) {
                            case ResultFieldName.impact:
                                if ((diff = sortParameter.descending ? b.impact - a.impact : a.impact - b.impact) != 0)
                                    return diff;
                                break;
                            case ResultFieldName.urgency:
                                if ((diff = sortParameter.descending ? b.urgency - a.urgency : a.urgency - b.urgency) != 0)
                                    return diff;
                                break;
                            case ResultFieldName.priority:
                                if ((diff = sortParameter.descending ? a.intermediateResult - b.intermediateResult : b.intermediateResult - a.intermediateResult) != 0)
                                    return diff;
                                break;
                        }
                    }
                    return 0;
                });
            }
        }
        toggleSort(field) {
            var index = this._sortOrder.findIndex(function (value) { return value.field == field; });
            if (index == 0)
                this._sortOrder[0] = { field: field, descending: !this._sortOrder[0].descending };
            else {
                var item = this._sortOrder[index];
                if (index < this._sortOrder.length - 1)
                    this._sortOrder.splice(index, 1);
                else
                    this._sortOrder.pop();
                this._sortOrder.unshift(item);
            }
            this.applySort();
        }
        recalculateAllOptions() {
            var urgencyValue = MathOperation.subtract(MathOperation.add(MathOperation.add(new LiteralStatement(this._baseValue), new LiteralStatement(this._valueShift)), new LiteralStatement(this._urgencyRange)), new VariableStatement("urgency", function (source) { return source.urgency; }));
            var impactValue = MathOperation.subtract(MathOperation.add(MathOperation.add(new LiteralStatement(this._baseValue), new LiteralStatement(this._valueShift)), new LiteralStatement(this._impactRange)), new VariableStatement("impact", function (source) { return source.impact; }));
            var ternaryOperation = new TernaryOperation(new VariableStatement("vip", function (source) { return source.vip; }), new TernaryOperation(new VariableStatement("businessCritical", function (source) { return source.businessCritical; }), new LiteralStatement(this._vipWeight + this._businessCriticalWeight), new LiteralStatement(0)), new TernaryOperation(new VariableStatement("businessCritical", function (source) { return source.businessCritical; }), new LiteralStatement(this._businessCriticalWeight), new LiteralStatement(0)));
            var calculationStatement;
            switch (this._baseFormula) {
                case BaseFormulaType.add:
                    calculationStatement = MathOperation.add(MathOperation.add(urgencyValue, impactValue), ternaryOperation);
                    break;
                case BaseFormulaType.multiplyAdd:
                    calculationStatement = MathOperation.add(MathOperation.add(MathOperation.add(MathOperation.multiply(urgencyValue, impactValue), urgencyValue), impactValue), ternaryOperation);
                    break;
                case BaseFormulaType.addMultiply:
                    calculationStatement = MathOperation.add(MathOperation.multiply(MathOperation.multiply(MathOperation.add(urgencyValue, impactValue), urgencyValue), impactValue), ternaryOperation);
                    break;
                default:
                    calculationStatement = MathOperation.add(MathOperation.multiply(urgencyValue, impactValue), ternaryOperation);
                    break;
            }
            this._minIntermediateResult = calculationStatement.getValue({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true, businessCritical: true });
            this._intermediateResultRange = calculationStatement.getValue({ urgency: this._baseValue, impact: this._baseValue, vip: false, businessCritical: false }) - this._minIntermediateResult;
            this.$scope.formulaText = "Math." + ((this._rounding == RoundingType.nearest) ? "round" : this._rounding) + "(" + MathOperation.add(MathOperation.multiply(MathOperation.divide(MathOperation.subtract(calculationStatement, new LiteralStatement(this._minIntermediateResult)), new LiteralStatement(this._intermediateResultRange)), new LiteralStatement(this._priorityRange - 1)), new LiteralStatement(this._baseValue)).toString() + ")";
            var calculationParameters = [];
            var urgencyEnd = this._baseValue + this._urgencyRange;
            var impactEnd = this._baseValue + this._impactRange;
            for (var urgency = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact = this._baseValue; impact < impactEnd; impact++) {
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: false, businessCritical: false });
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: false, businessCritical: true });
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: true, businessCritical: false });
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: true, businessCritical: true });
                }
            }
            var intermediateResults = calculationParameters.map(function (parameters) {
                return { parameters: parameters, intermediateResult: this.getValue(parameters) };
            }, calculationStatement);
            switch (this._rounding) {
                case RoundingType.ceiling:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.vip ? "Yes" : "No", result.parameters.businessCritical ? "Yes" : "No"],
                            priority: Math.ceil((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
                case RoundingType.nearest:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.vip ? "Yes" : "No", result.parameters.businessCritical ? "Yes" : "No"],
                            priority: Math.round((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
                default:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.vip ? "Yes" : "No", result.parameters.businessCritical ? "Yes" : "No"],
                            priority: Math.floor((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
            }
        }
        recalculateVip() {
            var urgencyValue = MathOperation.subtract(MathOperation.add(MathOperation.add(new LiteralStatement(this._baseValue), new LiteralStatement(this._valueShift)), new LiteralStatement(this._urgencyRange)), new VariableStatement("urgency", function (source) { return source.urgency; }));
            var impactValue = MathOperation.subtract(MathOperation.add(MathOperation.add(new LiteralStatement(this._baseValue), new LiteralStatement(this._valueShift)), new LiteralStatement(this._impactRange)), new VariableStatement("impact", function (source) { return source.impact; }));
            var ternaryOperation = new TernaryOperation(new VariableStatement("vip", function (source) { return source.vip; }), new LiteralStatement(this._vipWeight), new LiteralStatement(0));
            var calculationStatement;
            switch (this._baseFormula) {
                case BaseFormulaType.add:
                    calculationStatement = MathOperation.add(MathOperation.add(urgencyValue, impactValue), ternaryOperation);
                    break;
                case BaseFormulaType.multiplyAdd:
                    calculationStatement = MathOperation.add(MathOperation.add(MathOperation.add(MathOperation.multiply(urgencyValue, impactValue), urgencyValue), impactValue), ternaryOperation);
                    break;
                case BaseFormulaType.addMultiply:
                    calculationStatement = MathOperation.add(MathOperation.multiply(MathOperation.multiply(MathOperation.add(urgencyValue, impactValue), urgencyValue), impactValue), ternaryOperation);
                    break;
                default:
                    calculationStatement = MathOperation.add(MathOperation.multiply(urgencyValue, impactValue), ternaryOperation);
                    break;
            }
            this._minIntermediateResult = calculationStatement.getValue({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true });
            this._intermediateResultRange = calculationStatement.getValue({ urgency: this._baseValue, impact: this._baseValue, vip: false }) - this._minIntermediateResult;
            this.$scope.formulaText = "Math." + ((this._rounding == RoundingType.nearest) ? "round" : this._rounding) + "(" + MathOperation.add(MathOperation.multiply(MathOperation.divide(MathOperation.subtract(calculationStatement, new LiteralStatement(this._minIntermediateResult)), new LiteralStatement(this._intermediateResultRange)), new LiteralStatement(this._priorityRange - 1)), new LiteralStatement(this._baseValue)).toString() + ")";
            var calculationParameters = [];
            var urgencyEnd = this._baseValue + this._urgencyRange;
            var impactEnd = this._baseValue + this._impactRange;
            for (var urgency = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact = this._baseValue; impact < impactEnd; impact++) {
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: false });
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: true });
                }
            }
            var intermediateResults = calculationParameters.map(function (parameters) {
                return { parameters: parameters, intermediateResult: this.getValue(parameters) };
            }, calculationStatement);
            switch (this._rounding) {
                case RoundingType.ceiling:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.vip ? "Yes" : "No"],
                            priority: Math.ceil((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
                case RoundingType.nearest:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.vip ? "Yes" : "No"],
                            priority: Math.round((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
                default:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.vip ? "Yes" : "No"],
                            priority: Math.floor((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
            }
        }
        recalculateBusinessCritical() {
            var urgencyValue = MathOperation.subtract(MathOperation.add(MathOperation.add(new LiteralStatement(this._baseValue), new LiteralStatement(this._valueShift)), new LiteralStatement(this._urgencyRange)), new VariableStatement("urgency", function (source) { return source.urgency; }));
            var impactValue = MathOperation.subtract(MathOperation.add(MathOperation.add(new LiteralStatement(this._baseValue), new LiteralStatement(this._valueShift)), new LiteralStatement(this._impactRange)), new VariableStatement("impact", function (source) { return source.impact; }));
            var ternaryOperation = new TernaryOperation(new VariableStatement("businessCritical", function (source) { return source.businessCritical; }), new LiteralStatement(this._businessCriticalWeight), new LiteralStatement(0));
            var calculationStatement;
            switch (this._baseFormula) {
                case BaseFormulaType.add:
                    calculationStatement = MathOperation.add(MathOperation.add(urgencyValue, impactValue), ternaryOperation);
                    break;
                case BaseFormulaType.multiplyAdd:
                    calculationStatement = MathOperation.add(MathOperation.add(MathOperation.add(MathOperation.multiply(urgencyValue, impactValue), urgencyValue), impactValue), ternaryOperation);
                    break;
                case BaseFormulaType.addMultiply:
                    calculationStatement = MathOperation.add(MathOperation.multiply(MathOperation.multiply(MathOperation.add(urgencyValue, impactValue), urgencyValue), impactValue), ternaryOperation);
                    break;
                default:
                    calculationStatement = MathOperation.add(MathOperation.multiply(urgencyValue, impactValue), ternaryOperation);
                    break;
            }
            this._minIntermediateResult = calculationStatement.getValue({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, businessCritical: true });
            this._intermediateResultRange = calculationStatement.getValue({ urgency: this._baseValue, impact: this._baseValue, businessCritical: false }) - this._minIntermediateResult;
            this.$scope.formulaText = "Math." + ((this._rounding == RoundingType.nearest) ? "round" : this._rounding) + "(" + MathOperation.add(MathOperation.multiply(MathOperation.divide(MathOperation.subtract(calculationStatement, new LiteralStatement(this._minIntermediateResult)), new LiteralStatement(this._intermediateResultRange)), new LiteralStatement(this._priorityRange - 1)), new LiteralStatement(this._baseValue)).toString() + ")";
            var calculationParameters = [];
            var urgencyEnd = this._baseValue + this._urgencyRange;
            var impactEnd = this._baseValue + this._impactRange;
            for (var urgency = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact = this._baseValue; impact < impactEnd; impact++) {
                    calculationParameters.push({ urgency: urgency, impact: impact, businessCritical: false });
                    calculationParameters.push({ urgency: urgency, impact: impact, businessCritical: true });
                }
            }
            var intermediateResults = calculationParameters.map(function (parameters) {
                return { parameters: parameters, intermediateResult: this.getValue(parameters) };
            }, calculationStatement);
            switch (this._rounding) {
                case RoundingType.ceiling:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.businessCritical ? "Yes" : "No"],
                            priority: Math.ceil((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
                case RoundingType.nearest:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.businessCritical ? "Yes" : "No"],
                            priority: Math.round((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
                default:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [result.parameters.businessCritical ? "Yes" : "No"],
                            priority: Math.floor((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
            }
        }
        recalculateUrgencyImpactOnly() {
            var urgencyValue = MathOperation.subtract(MathOperation.add(MathOperation.add(new LiteralStatement(this._baseValue), new LiteralStatement(this._valueShift)), new LiteralStatement(this._urgencyRange)), new VariableStatement("urgency", function (source) { return source.urgency; }));
            var impactValue = MathOperation.subtract(MathOperation.add(MathOperation.add(new LiteralStatement(this._baseValue), new LiteralStatement(this._valueShift)), new LiteralStatement(this._impactRange)), new VariableStatement("impact", function (source) { return source.impact; }));
            var calculationStatement;
            switch (this._baseFormula) {
                case BaseFormulaType.add:
                    calculationStatement = MathOperation.add(urgencyValue, impactValue);
                    break;
                case BaseFormulaType.multiplyAdd:
                    calculationStatement = MathOperation.add(MathOperation.add(MathOperation.multiply(urgencyValue, impactValue), urgencyValue), impactValue);
                    break;
                case BaseFormulaType.addMultiply:
                    calculationStatement = MathOperation.multiply(MathOperation.multiply(MathOperation.add(urgencyValue, impactValue), urgencyValue), impactValue);
                    break;
                default:
                    calculationStatement = MathOperation.multiply(urgencyValue, impactValue);
                    break;
            }
            this._minIntermediateResult = calculationStatement.getValue({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue });
            this._intermediateResultRange = calculationStatement.getValue({ urgency: this._baseValue, impact: this._baseValue }) - this._minIntermediateResult;
            this.$scope.formulaText = "Math." + ((this._rounding == RoundingType.nearest) ? "round" : this._rounding) + "(" + MathOperation.add(MathOperation.multiply(MathOperation.divide(MathOperation.subtract(calculationStatement, new LiteralStatement(this._minIntermediateResult)), new LiteralStatement(this._intermediateResultRange)), new LiteralStatement(this._priorityRange - 1)), new LiteralStatement(this._baseValue)).toString() + ")";
            var calculationParameters = [];
            var urgencyEnd = this._baseValue + this._urgencyRange;
            var impactEnd = this._baseValue + this._impactRange;
            for (var urgency = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact = this._baseValue; impact < impactEnd; impact++)
                    calculationParameters.push({ urgency: urgency, impact: impact });
            }
            var intermediateResults = calculationParameters.map(function (parameters) {
                return { parameters: parameters, intermediateResult: this.getValue(parameters) };
            }, calculationStatement);
            switch (this._rounding) {
                case RoundingType.ceiling:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [],
                            priority: Math.ceil((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
                case RoundingType.nearest:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [],
                            priority: Math.round((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
                default:
                    this.$scope.calculationResults = intermediateResults.map(function (result) {
                        return {
                            urgency: result.parameters.urgency,
                            impact: result.parameters.impact,
                            intermediateResult: result.intermediateResult,
                            optionalValues: [],
                            priority: Math.floor((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        };
                    }, this);
                    break;
            }
        }
        recalculate() {
            if (this._vipOption) {
                if (this._businessCriticalOption) {
                    this.recalculateAllOptions();
                }
                else {
                    this.recalculateVip();
                }
            }
            else {
                if (this._businessCriticalOption) {
                    this.recalculateBusinessCritical();
                }
                else {
                    this.recalculateUrgencyImpactOnly();
                }
            }
            this.applySort();
        }
        onUrgencyRangeChanged(newValue) {
            if (newValue == this._urgencyRange)
                return;
            this._urgencyRange = newValue;
            this.recalculate();
        }
        onImpactRangeChanged(newValue) {
            if (newValue == this._impactRange)
                return;
            this._impactRange = newValue;
            this.recalculate();
        }
        onPriorityRangeChanged(newValue) {
            if (newValue == this._priorityRange)
                return;
            this._priorityRange = newValue;
            this.recalculate();
        }
        onVipOptionChanged(newValue) {
            if (newValue == this._vipOption)
                return;
            this._vipOption = newValue;
            this.recalculate();
        }
        onBusinessCriticalOptionChanged(newValue) {
            if (newValue == this._businessCriticalOption)
                return;
            this._businessCriticalOption = newValue;
            this.recalculate();
        }
        onBaseValueChanged(newValue) {
            if (newValue == this._baseValue)
                return;
            this._baseValue = newValue;
            this.recalculate();
        }
        onValueShiftChanged(newValue) {
            if (newValue == this._valueShift)
                return;
            this._valueShift = newValue;
            this.recalculate();
        }
        onRoundingChanged(newValue) {
            if (newValue == this._rounding)
                return;
            this._rounding = newValue;
            this.recalculate();
        }
        onVipWeightChanged(newValue) {
            if (newValue == this._vipWeight)
                return;
            this._vipWeight = newValue;
            this.recalculate();
        }
        onBusinessCriticalWeightChanged(newValue) {
            if (newValue == this._businessCriticalWeight)
                return;
            this._businessCriticalWeight = newValue;
            this.recalculate();
        }
        onBaseFormulaChanged(newValue) {
            if (newValue == this._baseFormula)
                return;
            this._baseFormula = newValue;
            this.recalculate();
        }
    }
    MainController.$inject = ["$scope"];
    itilPriorityCalculator.MainController = MainController;
    itilPriorityCalculator.mainModule.controller("MainController", MainController);
})(itilPriorityCalculator || (itilPriorityCalculator = {}));
//# sourceMappingURL=app.js.map