/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/@types/angular/index.d.ts"/>
/// <reference path="../node_modules/@types/bootstrap/index.d.ts"/>
/// <reference path="../node_modules/@types/angular-ui-bootstrap/index.d.ts"/>

namespace itilPriorityCalculator {
     'use strict';

    declare type BoolString = "true" | "false";
    declare type SortDirection = -1 | 0 | 1;

    enum RoundingType {
        ceiling = "ceiling",
        floor = "floor",
        nearest = "nearest"
    }

    function isRoundingType(value: any): value is RoundingType {
        return typeof value === 'string' && (value === RoundingType.ceiling || value === RoundingType.floor || value === RoundingType.nearest);
    }

    enum BaseFormulaType {
        multiply = "multiply",
        add = "add",
        multiplyAdd = "multiplyAdd",
        addMultiply = "addMultiply"
    }

    enum ResultFieldName {
        urgency = "urgency",
        impact = "impact",
        vip = "vip",
        businessCritical = "businessCritical",
        priority = "priority"
    }

    enum Operator {
        None = "",
        Multiply = "*",
        Divide = "/",
        Add = "+",
        Subtract = "-",
        Ternary = "?",
        Equals = "==",
        NotEquals = "!=",
        LessThan = "<",
        GreaterThan = ">",
        NotLessThan = ">=",
        NotGreaterThan = "<="
    }

    declare type MathOperator = Extract<Operator, Operator.Multiply | Operator.Divide | Operator.Add | Operator.Subtract>;

    declare type ComparisonOperator = Extract<Operator, Operator.Equals | Operator.NotEquals | Operator.LessThan | Operator.GreaterThan | Operator.NotLessThan | Operator.NotGreaterThan>;

    interface ICalculationStatement<T, V> {
        getValue(source: T): V;
        toString(): string;
        getOperator(): Operator;
    }

    class TernaryOperation<T, V> implements ICalculationStatement<T, V> {
        constructor(private _conditional: ICalculationStatement<T, boolean>, private _ifTrueStatement: ICalculationStatement<T, V>, private _otherwiseStatement: ICalculationStatement<T, V>) { }
        getValue(source: T): V { return this._conditional.getValue(source) ? this._ifTrueStatement.getValue(source) : this._otherwiseStatement.getValue(source); }
        toString(): string {
            if (this._conditional.getOperator() == Operator.None) {
                if (this._ifTrueStatement.getOperator() == Operator.Ternary)
                    return this._conditional.toString() + " ? (" + this._ifTrueStatement.toString() + ") : " + this._otherwiseStatement.toString();
                return this._conditional.toString() + " ? " + this._ifTrueStatement.toString() + " : " + this._otherwiseStatement.toString();
            }
            if (this._ifTrueStatement.getOperator() == Operator.Ternary)
                return "(" + this._conditional.toString() + ") ? (" + this._ifTrueStatement.toString() + ") : " + this._otherwiseStatement.toString();
            return "(" + this._conditional.toString() + ") ? " + this._ifTrueStatement.toString() + " : " + this._otherwiseStatement.toString();
        }
        getOperator(): Operator { return Operator.Ternary; }
    }
    
    class MathOperation<T> implements ICalculationStatement<T, number> {
        static add<U>(lValue: ICalculationStatement<U, number>, rValue: ICalculationStatement<U, number>): ICalculationStatement<U, number> {
            if (rValue instanceof LiteralStatement) {
                if (rValue.value == 0) return lValue;
                if (rValue.value < 0) return new MathOperation<U>(lValue, Operator.Subtract, new LiteralStatement<U, number>(0 - rValue.value));
                if (lValue instanceof LiteralStatement) return (lValue.value == 0) ? rValue : new LiteralStatement(lValue.value + rValue.value);
            } else if (lValue instanceof LiteralStatement) {
                if (lValue.value == 0) return rValue;
                if (lValue.value < 0) return new MathOperation<U>(rValue, Operator.Subtract, new LiteralStatement<U, number>(0 - lValue.value));
            }
            return new MathOperation<U>(lValue, Operator.Add, rValue);
        }
        static subtract<U>(lValue: ICalculationStatement<U, number>, rValue: ICalculationStatement<U, number>): ICalculationStatement<U, number> {
            if (rValue instanceof LiteralStatement) {
                if (rValue.value == 0) return lValue;
                if (rValue.value < 0) return new MathOperation<U>(lValue, Operator.Add, new LiteralStatement<U, number>(0 - rValue.value));
                if (lValue instanceof LiteralStatement) return new LiteralStatement<U, number>(lValue.value - rValue.value);
            }
            return new MathOperation<U>(lValue, Operator.Subtract, rValue);
            
        }
        static multiply<U>(lValue: ICalculationStatement<U, number>, rValue: ICalculationStatement<U, number>): ICalculationStatement<U, number> {
            if (lValue instanceof LiteralStatement) {
                if (lValue.value == 0) return rValue;
                if (rValue instanceof LiteralStatement) return (rValue.value == 0) ? lValue : new LiteralStatement<U, number>(lValue.value * rValue.value);
            } else if (rValue instanceof LiteralStatement && rValue.value == 0) return lValue;
            return new MathOperation<U>(lValue, Operator.Multiply, rValue);
        }
        static divide<U>(lValue: ICalculationStatement<U, number>, rValue: ICalculationStatement<U, number>): ICalculationStatement<U, number> {
            if (rValue instanceof LiteralStatement) {
                if (rValue.value == 0) throw new Error("Denominator cannot be zero");
                if (rValue.value == 1) return lValue;
                if (lValue instanceof LiteralStatement) return new LiteralStatement<U, number>(lValue.value * rValue.value);
            } else if (lValue instanceof LiteralStatement && lValue.value == 0) return lValue;
            return new MathOperation<U>(lValue, Operator.Divide, rValue);
        }

        private constructor(private _lValue: ICalculationStatement<T, number>, private _operator: MathOperator, private _rValue: ICalculationStatement<T, number>) { }
        
        getValue(source: T): number {
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
        toString(): string {
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
        getOperator(): Operator { return this._operator; }
    }

    class ComparisonOperation<T, V> implements ICalculationStatement<T, boolean> {
        private constructor(private _lValue: ICalculationStatement<T, V>, private _operator: ComparisonOperator, private _rValue: ICalculationStatement<T, V>, private _exact: boolean = false) { }
        getValue(source: T): boolean {
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
        toString(): string {
            if (this._lValue.getOperator() == Operator.None) {
                if (this._rValue.getOperator() == Operator.None)
                    return this._lValue.toString() + " " + this._operator + " " + this._rValue.toString();
                return this._lValue.toString() + " " + this._operator + " (" + this._rValue.toString() + ")";
            }
            if (this._rValue.getOperator() == Operator.None)
                return "(" + this._lValue.toString() + ") " + this._operator + " " + this._rValue.toString();
            return "(" + this._lValue.toString() + ") " + this._operator + " (" + this._rValue.toString() + ")";
        }
        getOperator(): Operator { return this._operator; }
    }

    // class BooleanVariableOperation<T> implements ICalculationStatement<T, boolean> {
    //     constructor(public name: string, private _accessor: { (source: T): boolean }) { }
    //     getValue(source: T): boolean { return this._accessor(source); }
    //     toString(): string { return this.name; }
    //     getOperator(): Operator { return Operator.None; }
    // }

    class VariableStatement<T, V> implements ICalculationStatement<T, V> {
        constructor(public name: string, private _accessor: { (source: T): V }) { }
        getValue(source: T): V { return this._accessor(source); }
        toString(): string { return this.name; }
        getOperator(): Operator { return Operator.None; }
    }

    class LiteralStatement<T, V> implements ICalculationStatement<T, V> {
        constructor(public value: V) { }
        getValue(source: T): V { return this.value; }
        toString(): string { return JSON.stringify(this.value); }
        getOperator(): Operator { return Operator.None; }
    }

    interface IFieldSortParameter {
        field: ResultFieldName;
        descending: boolean;
    }

    function isBaseFormulaType(value: any): value is BaseFormulaType {
        return typeof value === 'string' && (value === BaseFormulaType.multiply || value === BaseFormulaType.add || value === BaseFormulaType.multiplyAdd || value === BaseFormulaType.addMultiply);
    }
    
    interface ICalculationParameters {
        urgency: number;
        impact: number;
    }
    
    interface IIntermediateResult<T extends ICalculationParameters> {
        parameters: T;
        intermediateResult: number;
    }
    
    interface IVipCalculationParameters extends ICalculationParameters {
        vip: boolean;
    }
    
    interface IBusinessCriticalCalculationParameters extends ICalculationParameters {
        businessCritical: boolean;
    }
    
    interface IAllCalculationParameters extends IVipCalculationParameters, IBusinessCriticalCalculationParameters { }
    
    interface ICalculationResultRow extends ICalculationParameters {
        optionalValues: ("Yes" | "No")[];
        intermediateResult: number;
        priority: number;
    }
    
    interface IMainControllerScope extends ng.IScope {
        rangeValues: string[];
        urgencyRange: string;
        impactRange: string;
        priorityRange: string;
        vipOption: boolean;
        businessCriticalOption: boolean;
        baseValue: number;
        valueShift: number;
        rounding: RoundingType;
        vipWeight: number;
        businessCriticalWeight: number;
        baseFormula: BaseFormulaType;
        formulaText: string;
        urgencySortDirection: SortDirection;
        impactSortDirection: SortDirection;
        vipSortDirection: SortDirection;
        businessCriticalSortDirection: SortDirection;
        prioritySortDirection: SortDirection;
        calculationResults: ICalculationResultRow[];
        toggleUrgencySort(): boolean;
        toggleImpactSort(): boolean;
        toggleVipSort(): boolean;
        toggleBusinessCriticalSort(): boolean;
        togglePrioritySort(): boolean;
        showRangesModal(): void;
        hideRangesModal(): void;
        showBaseFormulaModal(): void;
        hideBaseFormulaModal(): void;
        showOptionalValues(): void;
        hideOptionalValues(): void;
        showRoundingOptions(): void;
        hideRoundingOptions(): void;
    }

    export let mainModule: angular.IModule = angular.module("mainModule", []);

    export class MainController {
        static $inject: Array<string> = ["$scope"];
        private _urgencyRange: number = 3;
        private _impactRange: number = 3;
        private _priorityRange: number = 5;
        private _vipOption: boolean = false;
        private _businessCriticalOption: boolean = false;
        private _baseValue: number = 1;
        private _valueShift: number = 3;
        private _rounding: RoundingType = RoundingType.floor;
        private _vipWeight: number = 4;
        private _businessCriticalWeight: number = 2;
        private _baseFormula: BaseFormulaType = BaseFormulaType.multiply;
        private _minIntermediateResult: number = 16;
        private _intermediateResultRange: number = 26;
        private _sortOrder: IFieldSortParameter[] = [
            { field: ResultFieldName.priority, descending: false },
            { field: ResultFieldName.impact, descending: false },
            { field: ResultFieldName.urgency, descending: false },
            { field: ResultFieldName.vip, descending: false },
            { field: ResultFieldName.businessCritical, descending: false }
        ];

        constructor(private $scope: IMainControllerScope) {
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
            let controller: MainController = this;
            $scope.$watch('urgencyRange', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                let value: number = parseInt('' + newValue);
                if (!isNaN(value)) controller.onUrgencyRangeChanged(value);
            });
            $scope.$watch('impactRange', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                let value: number = parseInt('' + newValue);
                if (!isNaN(value)) controller.onImpactRangeChanged(value);
            });
            $scope.$watch('priorityRange', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                let value: number = parseInt('' + newValue);
                if (!isNaN(value)) controller.onPriorityRangeChanged(value);
            });
            $scope.$watch('vipOption', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                controller.onVipOptionChanged(newValue == true);
            });
            $scope.$watch('businessCriticalOption', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                controller.onBusinessCriticalOptionChanged(newValue == true);
            });
            $scope.$watch('baseValue', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue)) controller.onBaseValueChanged(newValue);
                } else if (typeof newValue === 'string') {
                    let value: number = parseInt(newValue);
                    if (!isNaN(value)) controller.onBaseValueChanged(value);
                }
            });
            $scope.$watch('valueShift', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue)) controller.onValueShiftChanged(newValue);
                } else if (typeof newValue === 'string') {
                    let value: number = parseInt(newValue);
                    if (!isNaN(value)) controller.onValueShiftChanged(value);
                }
            });
            $scope.$watch('rounding', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                if (isRoundingType(newValue)) controller.onRoundingChanged(newValue);
            });
            $scope.$watch('vipWeight', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue)) controller.onVipWeightChanged(newValue);
                } else if (typeof newValue === 'string') {
                    let value: number = parseFloat(newValue);
                    if (!isNaN(value)) controller.onVipWeightChanged(value);
                }
            });
            $scope.$watch('businessCriticalWeight', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue)) controller.onBusinessCriticalWeightChanged(newValue);
                } else if (typeof newValue === 'string') {
                    let value: number = parseFloat(newValue);
                    if (!isNaN(value)) controller.onBusinessCriticalWeightChanged(value);
                }
            });
            $scope.$watch('baseFormula', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                if (isBaseFormulaType(newValue)) controller.onBaseFormulaChanged(newValue);
            });
            $scope.showRangesModal = function(): void { $('#rangesModal').modal('show'); };
            $scope.hideRangesModal = function(): void { $('#rangesModal').modal('hide'); };
            $scope.showBaseFormulaModal = function(): void { $('#baseFormulaModal').modal('show'); };
            $scope.hideBaseFormulaModal = function(): void { $('#baseFormulaModal').modal('hide'); };
            $scope.showOptionalValues = function(): void { $('#optionalValuesModal').modal('show'); };
            $scope.hideOptionalValues = function(): void { $('#optionalValuesModal').modal('hide'); };
            $scope.showRoundingOptions = function(): void { $('#roundingOptionsModal').modal('show'); };
            $scope.hideRoundingOptions = function(): void { $('#roundingOptionsModal').modal('hide'); };
            $scope.toggleUrgencySort = function(): boolean { controller.toggleSort(ResultFieldName.urgency); return false; }
            $scope.toggleImpactSort = function(): boolean { controller.toggleSort(ResultFieldName.impact); return false; }
            $scope.toggleVipSort = function(): boolean { controller.toggleSort(ResultFieldName.vip); return false; }
            $scope.toggleBusinessCriticalSort = function(): boolean { controller.toggleSort(ResultFieldName.businessCritical); return false; }
            $scope.togglePrioritySort = function(): boolean { controller.toggleSort(ResultFieldName.priority); return false; }
            this.recalculate();
        }

        applySort(): void {
            var sortOrder: IFieldSortParameter[] = this._sortOrder;
            var currentSort: IFieldSortParameter = sortOrder[0];
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
            var diff: number;
            if (this._vipOption)
            {
                if (this._businessCriticalOption) {
                    this.$scope.calculationResults.sort(function(a: ICalculationResultRow, b: ICalculationResultRow): number {
                        for (var index: number = 0; index < sortOrder.length; index++) {
                            var sortParameter: IFieldSortParameter = sortOrder[index];
                            switch (sortParameter.field) {
                                case ResultFieldName.impact:
                                    if ((diff = sortParameter.descending ? b.impact - a.impact : a.impact - b.impact) != 0) return diff;
                                    break;
                                case ResultFieldName.urgency:
                                    if ((diff = sortParameter.descending ? b.urgency - a.urgency : a.urgency - b.urgency) != 0) return diff;
                                    break;
                                case ResultFieldName.vip:
                                    if (a.optionalValues[0] == "Yes") {
                                        if (b.optionalValues[0] != "Yes") return sortParameter.descending ? 1 : -1;
                                    }
                                    else if (b.optionalValues[0] == "Yes") return sortParameter.descending ? -1 : 1;
                                    break;
                                case ResultFieldName.businessCritical:
                                    if (a.optionalValues[1] == "Yes") {
                                        if (b.optionalValues[1] != "Yes") return sortParameter.descending ? 1 : -1;
                                    }
                                    else if (b.optionalValues[1] == "Yes") return sortParameter.descending ? -1 : 1;
                                    break;
                                default:
                                    if ((diff = sortParameter.descending ? a.intermediateResult - b.intermediateResult : b.intermediateResult - a.intermediateResult) != 0) return diff;
                                    break;
                            }
                        }
                        return 0;
                    });
                } else {
                    this.$scope.calculationResults.sort(function(a: ICalculationResultRow, b: ICalculationResultRow): number {
                        for (var index: number = 0; index < sortOrder.length; index++) {
                            var sortParameter: IFieldSortParameter = sortOrder[index];
                            switch (sortParameter.field) {
                                case ResultFieldName.impact:
                                    if ((diff = sortParameter.descending ? b.impact - a.impact : a.impact - b.impact) != 0) return diff;
                                    break;
                                case ResultFieldName.urgency:
                                    if ((diff = sortParameter.descending ? b.urgency - a.urgency : a.urgency - b.urgency) != 0) return diff;
                                    break;
                                case ResultFieldName.priority:
                                    if ((diff = sortParameter.descending ? a.intermediateResult - b.intermediateResult : b.intermediateResult - a.intermediateResult) != 0) return diff;
                                    break;
                                case ResultFieldName.vip:
                                    if (a.optionalValues[0] == "Yes") {
                                        if (b.optionalValues[0] != "Yes") return sortParameter.descending ? 1 : -1;
                                    }
                                    else if (b.optionalValues[0] == "Yes") return sortParameter.descending ? -1 : 1;
                                    break;
                            }
                        }
                        return 0;
                    });
                }
            } else if (this._businessCriticalOption) {
                this.$scope.calculationResults.sort(function(a: ICalculationResultRow, b: ICalculationResultRow): number {
                    for (var index: number = 0; index < sortOrder.length; index++) {
                        var sortParameter: IFieldSortParameter = sortOrder[index];
                        switch (sortParameter.field) {
                            case ResultFieldName.impact:
                                if ((diff = sortParameter.descending ? b.impact - a.impact : a.impact - b.impact) != 0) return diff;
                                break;
                            case ResultFieldName.urgency:
                                if ((diff = sortParameter.descending ? b.urgency - a.urgency : a.urgency - b.urgency) != 0) return diff;
                                break;
                            case ResultFieldName.priority:
                                if ((diff = sortParameter.descending ? a.intermediateResult - b.intermediateResult : b.intermediateResult - a.intermediateResult) != 0) return diff;
                                break;
                            case ResultFieldName.businessCritical:
                                if (a.optionalValues[1] == "Yes") {
                                    if (b.optionalValues[1] != "Yes") return sortParameter.descending ? 1 : -1;
                                }
                                else if (b.optionalValues[1] == "Yes") return sortParameter.descending ? -1 : 1;
                                break;
                        }
                    }
                    return 0;
                });
            } else {
                this.$scope.calculationResults.sort(function(a: ICalculationResultRow, b: ICalculationResultRow): number {
                    for (var index: number = 0; index < sortOrder.length; index++) {
                        var sortParameter: IFieldSortParameter = sortOrder[index];
                        switch (sortParameter.field) {
                            case ResultFieldName.impact:
                                if ((diff = sortParameter.descending ? b.impact - a.impact : a.impact - b.impact) != 0) return diff;
                                break;
                            case ResultFieldName.urgency:
                                if ((diff = sortParameter.descending ? b.urgency - a.urgency : a.urgency - b.urgency) != 0) return diff;
                                break;
                            case ResultFieldName.priority:
                                if ((diff = sortParameter.descending ? a.intermediateResult - b.intermediateResult : b.intermediateResult - a.intermediateResult) != 0) return diff;
                                break;
                        }
                    }
                    return 0;
                });
            }
        }

        toggleSort(field: ResultFieldName): void {
            var index: number = this._sortOrder.findIndex(function(value: IFieldSortParameter): boolean { return value.field == field; });
            if (index == 0)
                this._sortOrder[0] = { field: field, descending: !this._sortOrder[0].descending };
            else {
                var item: IFieldSortParameter = this._sortOrder[index];
                if (index < this._sortOrder.length - 1)
                    this._sortOrder.splice(index, 1);
                else
                    this._sortOrder.pop();
                this._sortOrder.unshift(item);
            }
            this.applySort();
        }

        private recalculateAllOptions() {
            // var urgency: number = this._baseValue + this._valueShift + this._urgencyRange - parameters.urgency;
            var urgencyValue: ICalculationStatement<IAllCalculationParameters, number> = MathOperation.subtract<IAllCalculationParameters>(
                MathOperation.add<IAllCalculationParameters>(
                    MathOperation.add<IAllCalculationParameters>(
                        new LiteralStatement<IAllCalculationParameters, number>(this._baseValue),
                        new LiteralStatement<IAllCalculationParameters, number>(this._valueShift)
                    ),
                    new LiteralStatement<IAllCalculationParameters, number>(this._urgencyRange)
                ),
                new VariableStatement<IAllCalculationParameters, number>("urgency", function(source: IAllCalculationParameters) { return source.urgency; })
            );
            // var impact: number = this._baseValue + this._valueShift + this._impactRange - parameters.impact;
            var impactValue: ICalculationStatement<IAllCalculationParameters, number> = MathOperation.subtract<IAllCalculationParameters>(
                MathOperation.add<IAllCalculationParameters>(
                    MathOperation.add<IAllCalculationParameters>(
                        new LiteralStatement<IAllCalculationParameters, number>(this._baseValue),
                        new LiteralStatement<IAllCalculationParameters, number>(this._valueShift)
                    ),
                    new LiteralStatement<IAllCalculationParameters, number>(this._impactRange)
                ),
                new VariableStatement<IAllCalculationParameters, number>("impact", function(source: IAllCalculationParameters) { return source.impact; })
            );
            // parameters.vip ? (parameters.businessCritical ? this._vipWeight + this._businessCriticalWeight : this._vipWeight) : parameters.businessCritical ? this._businessCriticalWeight : 0
            var ternaryOperation: TernaryOperation<IAllCalculationParameters, number> = new TernaryOperation(
                new VariableStatement<IAllCalculationParameters, boolean>("vip", function(source: IAllCalculationParameters) { return source.vip; }),
                new TernaryOperation<IAllCalculationParameters, number>(
                    new VariableStatement<IAllCalculationParameters, boolean>("businessCritical", function(source: IAllCalculationParameters) { return source.businessCritical; }),
                    new LiteralStatement<IAllCalculationParameters, number>(this._vipWeight + this._businessCriticalWeight),
                    new LiteralStatement<IAllCalculationParameters, number>(0)
                ),
                new TernaryOperation<IAllCalculationParameters, number>(
                    new VariableStatement<IAllCalculationParameters, boolean>("businessCritical", function(source: IAllCalculationParameters) { return source.businessCritical; }),
                    new LiteralStatement<IAllCalculationParameters, number>(this._businessCriticalWeight),
                    new LiteralStatement<IAllCalculationParameters, number>(0)
                )
            )
            var calculationStatement: ICalculationStatement<IAllCalculationParameters, number>;
            switch (this._baseFormula) {
                case BaseFormulaType.add:
                    // urgencyValue + impactValue + (parameters.vip ? (parameters.businessCritical ? this._vipWeight + this._businessCriticalWeight : this._vipWeight) : parameters.businessCritical ? this._businessCriticalWeight : 0)
                    calculationStatement = MathOperation.add<IAllCalculationParameters>(
                        MathOperation.add<IAllCalculationParameters>(urgencyValue, impactValue),
                        ternaryOperation
                    );
                    break;
                case BaseFormulaType.multiplyAdd:
                    // (urgencyValue * impactValue) + urgencyValue + impactValue + (parameters.vip ? (parameters.businessCritical ? this._vipWeight + this._businessCriticalWeight : this._vipWeight) : parameters.businessCritical ? this._businessCriticalWeight : 0)
                    calculationStatement = MathOperation.add<IAllCalculationParameters>(
                        MathOperation.add<IAllCalculationParameters>(
                            MathOperation.add<IAllCalculationParameters>(
                                MathOperation.multiply<IAllCalculationParameters>(urgencyValue, impactValue),
                                urgencyValue
                            ),
                            impactValue
                        ),
                        ternaryOperation
                    );
                    break;
                case BaseFormulaType.addMultiply:
                    // ((urgencyValue + impactValue) * urgencyValue * impactValue) + (parameters.vip ? (parameters.businessCritical ? this._vipWeight + this._businessCriticalWeight : this._vipWeight) : parameters.businessCritical ? this._businessCriticalWeight : 0)
                    calculationStatement = MathOperation.add<IAllCalculationParameters>(
                        MathOperation.multiply<IAllCalculationParameters>(
                            MathOperation.multiply<IAllCalculationParameters>(
                                MathOperation.add<IAllCalculationParameters>(urgencyValue, impactValue),
                                urgencyValue
                            ),
                            impactValue
                        ),
                        ternaryOperation
                    );
                    break;
                default:
                    // (urgencyValue * impactValue) + (parameters.vip ? (parameters.businessCritical ? this._vipWeight + this._businessCriticalWeight : this._vipWeight) : parameters.businessCritical ? this._businessCriticalWeight : 0)
                    calculationStatement = MathOperation.add<IAllCalculationParameters>(
                        MathOperation.multiply<IAllCalculationParameters>(urgencyValue, impactValue),
                        ternaryOperation
                    );
                    break;
            }
            this._minIntermediateResult = calculationStatement.getValue({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true, businessCritical: true });
            this._intermediateResultRange = calculationStatement.getValue({ urgency: this._baseValue, impact: this._baseValue, vip: false, businessCritical: false }) - this._minIntermediateResult;
            // Math.???((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
            this.$scope.formulaText = "Math." + ((this._rounding == RoundingType.nearest) ? "round" : this._rounding) + "(" + MathOperation.add(
                MathOperation.multiply(
                    MathOperation.divide(
                        MathOperation.subtract(calculationStatement, new LiteralStatement(this._minIntermediateResult)),
                        new LiteralStatement(this._intermediateResultRange)
                    ),
                    new LiteralStatement(this._priorityRange - 1)
                ),
                new LiteralStatement(this._baseValue)
            ).toString() + ")";
            var calculationParameters: IAllCalculationParameters[] = [];
            var urgencyEnd: number = this._baseValue + this._urgencyRange;
            var impactEnd: number = this._baseValue + this._impactRange;
            for (var urgency: number = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact: number = this._baseValue; impact < impactEnd; impact++) {
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: false, businessCritical: false });
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: false, businessCritical: true });
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: true, businessCritical: false });
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: true, businessCritical: true });
                }
            }
            var intermediateResults: IIntermediateResult<IAllCalculationParameters>[] = calculationParameters.map(function(this: MathOperation<IAllCalculationParameters>, parameters: IAllCalculationParameters): IIntermediateResult<IAllCalculationParameters> {
                return { parameters: parameters, intermediateResult: this.getValue(parameters) };
            }, calculationStatement);
            switch (this._rounding) {
                case RoundingType.ceiling:
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IAllCalculationParameters>): ICalculationResultRow {
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
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IAllCalculationParameters>): ICalculationResultRow {
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
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IAllCalculationParameters>): ICalculationResultRow {
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

        private recalculateVip() {
            // var urgency: number = this._baseValue + this._valueShift + this._urgencyRange - parameters.urgency;
            var urgencyValue: ICalculationStatement<IVipCalculationParameters, number> = MathOperation.subtract<IVipCalculationParameters>(
                MathOperation.add<IVipCalculationParameters>(
                    MathOperation.add<IVipCalculationParameters>(
                        new LiteralStatement<IVipCalculationParameters, number>(this._baseValue),
                        new LiteralStatement<IVipCalculationParameters, number>(this._valueShift)
                    ),
                    new LiteralStatement<IVipCalculationParameters, number>(this._urgencyRange)
                ),
                new VariableStatement<IVipCalculationParameters, number>("urgency", function(source: IVipCalculationParameters) { return source.urgency; })
            );
            // var impact: number = this._baseValue + this._valueShift + this._impactRange - parameters.impact;
            var impactValue: ICalculationStatement<IVipCalculationParameters, number> = MathOperation.subtract<IVipCalculationParameters>(
                MathOperation.add<IVipCalculationParameters>(
                    MathOperation.add<IVipCalculationParameters>(
                        new LiteralStatement<IVipCalculationParameters, number>(this._baseValue),
                        new LiteralStatement<IVipCalculationParameters, number>(this._valueShift)
                    ),
                    new LiteralStatement<IVipCalculationParameters, number>(this._impactRange)
                ),
                new VariableStatement<IVipCalculationParameters, number>("impact", function(source: IVipCalculationParameters) { return source.impact; })
            );
            // parameters.vip ? this._vipWeight : 0
            var ternaryOperation: TernaryOperation<IVipCalculationParameters, number> = new TernaryOperation(
                new VariableStatement<IVipCalculationParameters, boolean>("vip", function(source: IVipCalculationParameters) { return source.vip; }),
                new LiteralStatement<IVipCalculationParameters, number>(this._vipWeight),
                new LiteralStatement<IVipCalculationParameters, number>(0)
            )
            var calculationStatement: ICalculationStatement<IVipCalculationParameters, number>;
            switch (this._baseFormula) {
                case BaseFormulaType.add:
                    // urgencyValue + impactValue + (parameters.vip ? this._vipWeight : 0)
                    calculationStatement = MathOperation.add<IVipCalculationParameters>(
                        MathOperation.add<IVipCalculationParameters>(urgencyValue, impactValue),
                        ternaryOperation
                    );
                    break;
                case BaseFormulaType.multiplyAdd:
                    // (urgencyValue * impactValue) + urgencyValue + impactValue + (parameters.vip ? this._vipWeight : 0)
                    calculationStatement = MathOperation.add<IVipCalculationParameters>(
                        MathOperation.add<IVipCalculationParameters>(
                            MathOperation.add<IVipCalculationParameters>(
                                MathOperation.multiply<IVipCalculationParameters>(urgencyValue, impactValue),
                                urgencyValue
                            ),
                            impactValue
                        ),
                        ternaryOperation
                    );
                    break;
                case BaseFormulaType.addMultiply:
                    // ((urgencyValue + impactValue) * urgencyValue * impactValue) + (parameters.vip ? this._vipWeight : 0)
                    calculationStatement = MathOperation.add<IVipCalculationParameters>(
                        MathOperation.multiply<IVipCalculationParameters>(
                            MathOperation.multiply<IVipCalculationParameters>(
                                MathOperation.add<IVipCalculationParameters>(urgencyValue, impactValue),
                                urgencyValue
                            ),
                            impactValue
                        ),
                        ternaryOperation
                    );
                    break;
                default:
                    // (urgencyValue * impactValue) + (parameters.vip ? this._vipWeight : 0)
                    calculationStatement = MathOperation.add<IVipCalculationParameters>(
                        MathOperation.multiply<IVipCalculationParameters>(urgencyValue, impactValue),
                        ternaryOperation
                    );
                    break;
            }
            this._minIntermediateResult = calculationStatement.getValue({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true });
            this._intermediateResultRange = calculationStatement.getValue({ urgency: this._baseValue, impact: this._baseValue, vip: false }) - this._minIntermediateResult;
            // Math.???((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
            this.$scope.formulaText = "Math." + ((this._rounding == RoundingType.nearest) ? "round" : this._rounding) + "(" + MathOperation.add(
                MathOperation.multiply(
                    MathOperation.divide(
                        MathOperation.subtract(calculationStatement, new LiteralStatement(this._minIntermediateResult)),
                        new LiteralStatement(this._intermediateResultRange)
                    ),
                    new LiteralStatement(this._priorityRange - 1)
                ),
                new LiteralStatement(this._baseValue)
            ).toString() + ")";
            var calculationParameters: IVipCalculationParameters[] = [];
            var urgencyEnd: number = this._baseValue + this._urgencyRange;
            var impactEnd: number = this._baseValue + this._impactRange;
            for (var urgency: number = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact: number = this._baseValue; impact < impactEnd; impact++) {
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: false });
                    calculationParameters.push({ urgency: urgency, impact: impact, vip: true });
                }
            }
            var intermediateResults: IIntermediateResult<IVipCalculationParameters> [] = calculationParameters.map(function(this: MathOperation<IVipCalculationParameters>, parameters: IVipCalculationParameters): IIntermediateResult<IVipCalculationParameters> {
                return { parameters: parameters, intermediateResult: this.getValue(parameters) };
            }, calculationStatement);
            switch (this._rounding) {
                case RoundingType.ceiling:
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IVipCalculationParameters>): ICalculationResultRow {
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
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IVipCalculationParameters>): ICalculationResultRow {
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
                    /*
                        private _urgencyRange: number = 3;
                        private _impactRange: number = 3;
                        private _priorityRange: number = 5;
                        private _baseValue: number = 1;
                        private _valueShift: number = 3;
                        private _vipWeight: number = 4;
                        private _businessCriticalWeight: number = 2;
                        private _minIntermediateResult: number = 16;
                        private _intermediateResultRange: number = 20;
                        intermediateResult = 16;
                        intermediateResult = 36;
                        Math.floor((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
                        Math.floor((((16 - 16) / 20) * (5 - 1)) + 1)
                        Math.floor((((36 - 16) / 20) * (5 - 1)) + 1)
                    */
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IVipCalculationParameters>): ICalculationResultRow {
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

        private recalculateBusinessCritical() {
            // var urgency: number = this._baseValue + this._valueShift + this._urgencyRange - parameters.urgency;
            var urgencyValue: ICalculationStatement<IBusinessCriticalCalculationParameters, number> = MathOperation.subtract<IBusinessCriticalCalculationParameters>(
                MathOperation.add<IBusinessCriticalCalculationParameters>(
                    MathOperation.add<IBusinessCriticalCalculationParameters>(
                        new LiteralStatement<IBusinessCriticalCalculationParameters, number>(this._baseValue),
                        new LiteralStatement<IBusinessCriticalCalculationParameters, number>(this._valueShift)
                    ),
                    new LiteralStatement<IBusinessCriticalCalculationParameters, number>(this._urgencyRange)
                ),
                new VariableStatement<IBusinessCriticalCalculationParameters, number>("urgency", function(source: IBusinessCriticalCalculationParameters) { return source.urgency; })
            );
            // var impact: number = this._baseValue + this._valueShift + this._impactRange - parameters.impact;
            var impactValue: ICalculationStatement<IBusinessCriticalCalculationParameters, number> = MathOperation.subtract<IBusinessCriticalCalculationParameters>(
                MathOperation.add<IBusinessCriticalCalculationParameters>(
                    MathOperation.add<IBusinessCriticalCalculationParameters>(
                        new LiteralStatement<IBusinessCriticalCalculationParameters, number>(this._baseValue),
                        new LiteralStatement<IBusinessCriticalCalculationParameters, number>(this._valueShift)
                    ),
                    new LiteralStatement<IBusinessCriticalCalculationParameters, number>(this._impactRange)
                ),
                new VariableStatement<IBusinessCriticalCalculationParameters, number>("impact", function(source: IBusinessCriticalCalculationParameters) { return source.impact; })
            );
            // parameters.businessCritical ? this._businessCriticalWeight : 0
            var ternaryOperation: TernaryOperation<IBusinessCriticalCalculationParameters, number> = new TernaryOperation(
                new VariableStatement<IBusinessCriticalCalculationParameters, boolean>("businessCritical", function(source: IBusinessCriticalCalculationParameters) { return source.businessCritical; }),
                new LiteralStatement<IBusinessCriticalCalculationParameters, number>(this._businessCriticalWeight),
                new LiteralStatement<IBusinessCriticalCalculationParameters, number>(0)
            )
            var calculationStatement: ICalculationStatement<IBusinessCriticalCalculationParameters, number>;
            switch (this._baseFormula) {
                case BaseFormulaType.add:
                    // urgencyValue + impactValue + (parameters.businessCritical ? this._businessCriticalWeight : 0)
                    calculationStatement = MathOperation.add<IBusinessCriticalCalculationParameters>(
                        MathOperation.add<IBusinessCriticalCalculationParameters>(urgencyValue, impactValue),
                        ternaryOperation
                    );
                    break;
                case BaseFormulaType.multiplyAdd:
                    // (urgencyValue * impactValue) + urgencyValue + impactValue + (parameters.businessCritical ? this._businessCriticalWeight : 0)
                    calculationStatement = MathOperation.add<IBusinessCriticalCalculationParameters>(
                        MathOperation.add<IBusinessCriticalCalculationParameters>(
                            MathOperation.add<IBusinessCriticalCalculationParameters>(
                                MathOperation.multiply<IBusinessCriticalCalculationParameters>(urgencyValue, impactValue),
                                urgencyValue
                            ),
                            impactValue
                        ),
                        ternaryOperation
                    );
                    break;
                case BaseFormulaType.addMultiply:
                    // ((urgencyValue + impactValue) * urgencyValue * impactValue) + (parameters.businessCritical ? this._businessCriticalWeight : 0)
                    calculationStatement = MathOperation.add<IBusinessCriticalCalculationParameters>(
                        MathOperation.multiply<IBusinessCriticalCalculationParameters>(
                            MathOperation.multiply<IBusinessCriticalCalculationParameters>(
                                MathOperation.add<IBusinessCriticalCalculationParameters>(urgencyValue, impactValue),
                                urgencyValue
                            ),
                            impactValue
                        ),
                        ternaryOperation
                    );
                    break;
                default:
                    // (urgencyValue * impactValue) + (parameters.businessCritical ? this._businessCriticalWeight : 0)
                    calculationStatement = MathOperation.add<IBusinessCriticalCalculationParameters>(
                        MathOperation.multiply<IBusinessCriticalCalculationParameters>(urgencyValue, impactValue),
                        ternaryOperation
                    );
                    break;
            }
            this._minIntermediateResult = calculationStatement.getValue({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, businessCritical: true });
            this._intermediateResultRange = calculationStatement.getValue({ urgency: this._baseValue, impact: this._baseValue, businessCritical: false }) - this._minIntermediateResult;
            // Math.???((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
            this.$scope.formulaText = "Math." + ((this._rounding == RoundingType.nearest) ? "round" : this._rounding) + "(" + MathOperation.add(
                MathOperation.multiply(
                    MathOperation.divide(
                        MathOperation.subtract(calculationStatement, new LiteralStatement(this._minIntermediateResult)),
                        new LiteralStatement(this._intermediateResultRange)
                    ),
                    new LiteralStatement(this._priorityRange - 1)
                ),
                new LiteralStatement(this._baseValue)
            ).toString() + ")";
            var calculationParameters: IBusinessCriticalCalculationParameters[] = [];
            var urgencyEnd: number = this._baseValue + this._urgencyRange;
            var impactEnd: number = this._baseValue + this._impactRange;
            for (var urgency: number = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact: number = this._baseValue; impact < impactEnd; impact++) {
                    calculationParameters.push({ urgency: urgency, impact: impact, businessCritical: false });
                    calculationParameters.push({ urgency: urgency, impact: impact,  businessCritical: true });
                }
            }
            var intermediateResults: IIntermediateResult<IBusinessCriticalCalculationParameters>[] = calculationParameters.map(function(this: MathOperation<IBusinessCriticalCalculationParameters>, parameters: IBusinessCriticalCalculationParameters): IIntermediateResult<IBusinessCriticalCalculationParameters> {
                return { parameters: parameters, intermediateResult: this.getValue(parameters) };
            }, calculationStatement);
            switch (this._rounding) {
                case RoundingType.ceiling:
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IBusinessCriticalCalculationParameters>): ICalculationResultRow {
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
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IBusinessCriticalCalculationParameters>): ICalculationResultRow {
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
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<IBusinessCriticalCalculationParameters>): ICalculationResultRow {
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

        private recalculateUrgencyImpactOnly() {
            // var urgency: number = this._baseValue + this._valueShift + this._urgencyRange - parameters.urgency;
            var urgencyValue: ICalculationStatement<ICalculationParameters, number> = MathOperation.subtract<ICalculationParameters>(
                MathOperation.add<ICalculationParameters>(
                    MathOperation.add<ICalculationParameters>(
                        new LiteralStatement<ICalculationParameters, number>(this._baseValue),
                        new LiteralStatement<ICalculationParameters, number>(this._valueShift)
                    ),
                    new LiteralStatement<ICalculationParameters, number>(this._urgencyRange)
                ),
                new VariableStatement<ICalculationParameters, number>("urgency", function(source: ICalculationParameters) { return source.urgency; })
            );
            // var impact: number = this._baseValue + this._valueShift + this._impactRange - parameters.impact;
            var impactValue: ICalculationStatement<ICalculationParameters, number> = MathOperation.subtract<ICalculationParameters>(
                MathOperation.add<ICalculationParameters>(
                    MathOperation.add<ICalculationParameters>(
                        new LiteralStatement<ICalculationParameters, number>(this._baseValue),
                        new LiteralStatement<ICalculationParameters, number>(this._valueShift)
                    ),
                    new LiteralStatement<ICalculationParameters, number>(this._impactRange)
                ),
                new VariableStatement<ICalculationParameters, number>("impact", function(source: ICalculationParameters) { return source.impact; })
            );
            var calculationStatement: ICalculationStatement<ICalculationParameters, number>;
            switch (this._baseFormula) {
                case BaseFormulaType.add:
                    // urgencyValue + impactValue
                    calculationStatement = MathOperation.add<ICalculationParameters>(urgencyValue, impactValue);
                    break;
                case BaseFormulaType.multiplyAdd:
                    // (urgencyValue * impactValue) + urgencyValue + impactValue
                    calculationStatement = MathOperation.add<ICalculationParameters>(
                        MathOperation.add<ICalculationParameters>(
                            MathOperation.multiply<ICalculationParameters>(urgencyValue, impactValue),
                            urgencyValue
                        ),
                        impactValue
                    );
                    break;
                case BaseFormulaType.addMultiply:
                    // (urgencyValue + impactValue) * urgencyValue * impactValue
                    calculationStatement = MathOperation.multiply<ICalculationParameters>(
                        MathOperation.multiply<ICalculationParameters>(
                            MathOperation.add<ICalculationParameters>(urgencyValue, impactValue),
                            urgencyValue
                        ),
                        impactValue
                    );
                    break;
                default:
                    // urgencyValue * impactValue
                    calculationStatement = MathOperation.multiply<ICalculationParameters>(urgencyValue, impactValue);
                    break;
            }
            this._minIntermediateResult = calculationStatement.getValue({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue });
            this._intermediateResultRange = calculationStatement.getValue({ urgency: this._baseValue, impact: this._baseValue }) - this._minIntermediateResult;
            // Math.???((((result.intermediateResult - this._minIntermediateResult) / this._intermediateResultRange) * (this._priorityRange - 1)) + this._baseValue)
            this.$scope.formulaText = "Math." + ((this._rounding == RoundingType.nearest) ? "round" : this._rounding) + "(" + MathOperation.add(
                MathOperation.multiply(
                    MathOperation.divide(
                        MathOperation.subtract(calculationStatement, new LiteralStatement(this._minIntermediateResult)),
                        new LiteralStatement(this._intermediateResultRange)
                    ),
                    new LiteralStatement(this._priorityRange - 1)
                ),
                new LiteralStatement(this._baseValue)
            ).toString() + ")";
            var calculationParameters: ICalculationParameters[] = [];
            var urgencyEnd: number = this._baseValue + this._urgencyRange;
            var impactEnd: number = this._baseValue + this._impactRange;
            for (var urgency: number = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact: number = this._baseValue; impact < impactEnd; impact++)
                calculationParameters.push({ urgency: urgency, impact: impact });
            }
            var intermediateResults: IIntermediateResult<ICalculationParameters>[] = calculationParameters.map(function(this: MathOperation<ICalculationParameters>, parameters: ICalculationParameters): IIntermediateResult<ICalculationParameters> {
                return { parameters: parameters, intermediateResult: this.getValue(parameters) };
            }, calculationStatement);
            switch (this._rounding) {
                case RoundingType.ceiling:
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<ICalculationParameters>): ICalculationResultRow {
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
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<ICalculationParameters>): ICalculationResultRow {
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
                    this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult<ICalculationParameters>): ICalculationResultRow {
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

        recalculate(): void {
            if (this._vipOption) {
                if (this._businessCriticalOption) {
                    this.recalculateAllOptions();
                } else {
                    this.recalculateVip();
                }
            } else {
                if (this._businessCriticalOption) {
                    this.recalculateBusinessCritical();
                } else {
                    this.recalculateUrgencyImpactOnly();
                }
            }
            this.applySort();
        }

        onUrgencyRangeChanged(newValue: number): void {
            if (newValue == this._urgencyRange) return;
            this._urgencyRange = newValue;
            this.recalculate();
        }

        onImpactRangeChanged(newValue: number): void {
            if (newValue == this._impactRange) return;
            this._impactRange = newValue;
            this.recalculate();
        }

        onPriorityRangeChanged(newValue: number): void {
            if (newValue == this._priorityRange) return;
            this._priorityRange = newValue;
            this.recalculate();
        }

        onVipOptionChanged(newValue: boolean): void {
            if (newValue == this._vipOption) return;
            this._vipOption = newValue;
            this.recalculate();
        }

        onBusinessCriticalOptionChanged(newValue: boolean): void {
            if (newValue == this._businessCriticalOption) return;
            this._businessCriticalOption = newValue;
            this.recalculate();
        }

        onBaseValueChanged(newValue: number): void {
            if (newValue == this._baseValue) return;
            this._baseValue = newValue;
            this.recalculate();
        }

        onValueShiftChanged(newValue: number): void {
            if (newValue == this._valueShift) return;
            this._valueShift = newValue;
            this.recalculate();
        }

        onRoundingChanged(newValue: RoundingType): void {
            if (newValue == this._rounding) return;
            this._rounding = newValue;
            this.recalculate();
        }

        onVipWeightChanged(newValue: number): void {
            if (newValue == this._vipWeight) return;
            this._vipWeight = newValue;
            this.recalculate();
        }

        onBusinessCriticalWeightChanged(newValue: number): void {
            if (newValue == this._businessCriticalWeight) return;
            this._businessCriticalWeight = newValue;
            this.recalculate();
        }

        onBaseFormulaChanged(newValue: BaseFormulaType): void {
            if (newValue == this._baseFormula) return;
            this._baseFormula = newValue;
            this.recalculate();
        }
    }
    
    mainModule.controller("MainController", MainController);
}