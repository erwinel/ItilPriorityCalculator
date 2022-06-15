/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/@types/angular/index.d.ts"/>
/// <reference path="../node_modules/@types/bootstrap/index.d.ts"/>
/// <reference path="../node_modules/@types/angular-ui-bootstrap/index.d.ts"/>

namespace itilPriorityCalculator {
     'use strict';

    declare type RangeString = "2" | "3" | "4" | "5" | "6" | "7";
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
    
    interface IIntermediateResult extends ICalculationParameters {
        intermediateResult: number;
    }
    
    interface IVipCalculationParameters extends ICalculationParameters {
        vip: boolean;
    }
    
    interface IVipIntermediateResult extends IVipCalculationParameters, IIntermediateResult  { }
    
    interface IBusinessCriticalCalculationParameters extends ICalculationParameters {
        businessCritical: boolean;
    }
    
    interface IBusinessCriticalIntermediateResult extends IBusinessCriticalCalculationParameters, IIntermediateResult  { }
    
    interface IAllCalculationParameters extends IVipCalculationParameters, IBusinessCriticalCalculationParameters { }
    
    interface IAllIntermediateResult extends IVipIntermediateResult, IBusinessCriticalIntermediateResult  { }
    
    interface ICalculationResultRow extends IIntermediateResult {
        optionalValues: ("Yes" | "No")[];
        priority: number;
    }
    
    interface IMainControllerScope extends ng.IScope {
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
            var lastIndex: number = sortOrder.length = 1;
            switch (sortOrder[0].field) {
                case ResultFieldName.urgency:
                    this.$scope.urgencySortDirection = sortOrder[0].descending ? -1 : 1;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.vipSortDirection = 0;
                    this.$scope.businessCriticalSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                case ResultFieldName.impact:
                    this.$scope.impactSortDirection = sortOrder[0].descending ? -1 : 1;
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.vipSortDirection = 0;
                    this.$scope.businessCriticalSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                case ResultFieldName.vip:
                    this.$scope.vipSortDirection = sortOrder[0].descending ? -1 : 1;
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.businessCriticalSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                case ResultFieldName.businessCritical:
                    this.$scope.businessCriticalSortDirection = sortOrder[0].descending ? -1 : 1;
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.vipSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                default:
                    this.$scope.prioritySortDirection = sortOrder[0].descending ? -1 : 1;
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.vipSortDirection = 0;
                    this.$scope.businessCriticalSortDirection = 0;
                    break;
            }
            if (this._vipOption)
            {
                if (this._businessCriticalOption) {
                    this.$scope.calculationResults.sort(function(a: ICalculationResultRow, b: ICalculationResultRow): number {
                        var index: number = lastIndex;
                        var diff: number;
                        do {
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
                        } while (--index >- 0);
                        return 0;
                    });
                } else {
                    this.$scope.calculationResults.sort(function(a: ICalculationResultRow, b: ICalculationResultRow): number {
                        var index: number = lastIndex;
                        var diff: number;
                        do {
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
                        } while (--index >- 0);
                        return 0;
                    });
                }
            } else if (this._businessCriticalOption) {
                this.$scope.calculationResults.sort(function(a: ICalculationResultRow, b: ICalculationResultRow): number {
                    var index: number = lastIndex;
                    var diff: number;
                    do {
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
                    } while (--index >- 0);
                    return 0;
                });
            } else {
                this.$scope.calculationResults.sort(function(a: ICalculationResultRow, b: ICalculationResultRow): number {
                    var index: number = lastIndex;
                    var diff: number;
                    do {
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
                    } while (--index >- 0);
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

        private getAllParametersProduct(parameters: IAllCalculationParameters): number {
            var result: number = this.getUrgencyImpactOnlyParametersProduct(parameters);
            if (parameters.vip) result += this._vipWeight;
            return parameters.businessCritical ? result + this._businessCriticalWeight : result;
        }
        
        private getAllParametersSum(parameters: IAllCalculationParameters): number {
            var result: number = this.getUrgencyImpactOnlyParametersSum(parameters);
            if (parameters.vip) result += this._vipWeight;
            return parameters.businessCritical ? result + this._businessCriticalWeight : result;
        }
        
        private getAllParametersProductWithSum(parameters: IAllCalculationParameters): number {
            var result: number = this.getUrgencyImpactOnlyParametersProductWithSum(parameters);
            if (parameters.vip) result += this._vipWeight;
            return parameters.businessCritical ? result + this._businessCriticalWeight : result;
        }
        
        private getAllParametersSumWithProduct(parameters: IAllCalculationParameters): number {
            var result: number =this.getUrgencyImpactOnlyParametersSumWithProduct(parameters);
            if (parameters.vip) result += this._vipWeight;
            return parameters.businessCritical ? result + this._businessCriticalWeight : result;
        }
        
        private getVipParametersProduct(parameters: IVipCalculationParameters): number {
            return (parameters.vip) ? this.getUrgencyImpactOnlyParametersProduct(parameters) + this._vipWeight : this.getUrgencyImpactOnlyParametersProduct(parameters);
        }
        
        private getVipParametersSum(parameters: IVipCalculationParameters): number {
            return (parameters.vip) ? this.getUrgencyImpactOnlyParametersSum(parameters) + this._vipWeight : this.getUrgencyImpactOnlyParametersSum(parameters);
        }
        
        private getVipParametersProductWithSum(parameters: IVipCalculationParameters): number {
            return (parameters.vip) ? this.getUrgencyImpactOnlyParametersProductWithSum(parameters) + this._vipWeight : this.getUrgencyImpactOnlyParametersProductWithSum(parameters);
        }
        
        private getVipParametersSumWithProduct(parameters: IVipCalculationParameters): number {
            return (parameters.vip) ? this.getUrgencyImpactOnlyParametersSumWithProduct(parameters) + this._vipWeight : this.getUrgencyImpactOnlyParametersSumWithProduct(parameters);
        }
        
        private getBusinessCriticalParametersProduct(parameters: IBusinessCriticalCalculationParameters): number {
            return parameters.businessCritical ? this.getUrgencyImpactOnlyParametersProduct(parameters) + this._businessCriticalWeight : this.getUrgencyImpactOnlyParametersProduct(parameters);
        }
        
        private getBusinessCriticalParametersSum(parameters: IBusinessCriticalCalculationParameters): number {
            return parameters.businessCritical ? this.getUrgencyImpactOnlyParametersSum(parameters) + this._businessCriticalWeight : this.getUrgencyImpactOnlyParametersSum(parameters);
        }
        
        private getBusinessCriticalParametersProductWithSum(parameters: IBusinessCriticalCalculationParameters): number {
            return parameters.businessCritical ? this.getUrgencyImpactOnlyParametersProductWithSum(parameters) + this._businessCriticalWeight : this.getUrgencyImpactOnlyParametersProductWithSum(parameters);
        }
        
        private getBusinessCriticalParametersSumWithProduct(parameters: IBusinessCriticalCalculationParameters): number {
            return parameters.businessCritical ? this.getUrgencyImpactOnlyParametersSumWithProduct(parameters) + this._businessCriticalWeight : this.getUrgencyImpactOnlyParametersSumWithProduct(parameters);
        }
        
        private getUrgencyImpactOnlyParametersProduct(parameters: ICalculationParameters): number {
            return (this._urgencyRange - parameters.urgency + this._baseValue + this._valueShift) * (this._impactRange - parameters.impact + this._baseValue + this._valueShift);
        }
        
        private getUrgencyImpactOnlyParametersSum(parameters: ICalculationParameters): number {
            return this._urgencyRange - parameters.urgency + this._baseValue + this._valueShift + this._impactRange - parameters.impact + this._baseValue + this._valueShift;
        }
        
        private getUrgencyImpactOnlyParametersProductWithSum(parameters: ICalculationParameters): number {
            var urgency: number = this._urgencyRange - parameters.urgency + this._baseValue + this._valueShift;
            var impact: number = this._impactRange - parameters.impact + this._baseValue + this._valueShift;
            return (urgency * impact) + urgency + impact;
        }
        
        private getUrgencyImpactOnlyParametersSumWithProduct(parameters: ICalculationParameters): number {
            var urgency: number = this._urgencyRange - parameters.urgency + this._baseValue + this._valueShift;
            var impact: number = this._impactRange - parameters.impact + this._baseValue + this._valueShift;
            return (urgency + impact) * urgency + impact;
        }
        
        private getAllOptionsCalculationParameters(): IAllCalculationParameters[] {
            var result: IAllCalculationParameters[] = [];
            var urgencyEnd: number = this._baseValue + this._urgencyRange;
            var impactEnd: number = this._baseValue + this._impactRange;
            for (var urgency: number = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact: number = this._baseValue; impact < impactEnd; impact++) {
                    result.push({ urgency: urgency, impact: impact, vip: false, businessCritical: false });
                    result.push({ urgency: urgency, impact: impact, vip: false, businessCritical: true });
                    result.push({ urgency: urgency, impact: impact, vip: true, businessCritical: false });
                    result.push({ urgency: urgency, impact: impact, vip: true, businessCritical: true });
                }
            }
            return result;
        }
        
        private getVipCalculationParameters(): IVipCalculationParameters[] {
            var result: IVipCalculationParameters[] = [];
            var urgencyEnd: number = this._baseValue + this._urgencyRange;
            var impactEnd: number = this._baseValue + this._impactRange;
            for (var urgency: number = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact: number = this._baseValue; impact < impactEnd; impact++) {
                    result.push({ urgency: urgency, impact: impact, vip: false });
                    result.push({ urgency: urgency, impact: impact, vip: true });
                }
            }
            return result;
        }
        
        private getBusinessCriticalCalculationParameters(): IBusinessCriticalCalculationParameters[] {
            var result: IBusinessCriticalCalculationParameters[] = [];
            var urgencyEnd: number = this._baseValue + this._urgencyRange;
            var impactEnd: number = this._baseValue + this._impactRange;
            for (var urgency: number = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact: number = this._baseValue; impact < impactEnd; impact++) {
                    result.push({ urgency: urgency, impact: impact, businessCritical: false });
                    result.push({ urgency: urgency, impact: impact,  businessCritical: true });
                }
            }
            return result;
        }
        
        private getImpactUrgencyOnlyCalculationParameters(): ICalculationParameters[] {
            var result: ICalculationParameters[] = [];
            var urgencyEnd: number = this._baseValue + this._urgencyRange;
            var impactEnd: number = this._baseValue + this._impactRange;
            for (var urgency: number = this._baseValue; urgency < urgencyEnd; urgency++) {
                for (var impact: number = this._baseValue; impact < impactEnd; impact++)
                    result.push({ urgency: urgency, impact: impact });
            }
            return result;
        }

        private applyAllIntermediateResults(intermediateResults: IAllIntermediateResult[]): void {
            this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IAllIntermediateResult): ICalculationResultRow {
                return {
                    urgency: result.urgency,
                    impact: result.impact,
                    intermediateResult: result.intermediateResult,
                    optionalValues: [result.vip ? "Yes" : "No", result.businessCritical ? "Yes" : "No"],
                    priority: ((result.intermediateResult - this._minIntermediateResult / this._intermediateResultRange) * this._priorityRange) + this._baseValue
                };
            }, this);
            this.applySort();
        }

        private recalculateAllOptionsWithProduct(): void {
            this._minIntermediateResult = this.getAllParametersProduct({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true, businessCritical: true });
            this._intermediateResultRange = this.getAllParametersProduct({ urgency: this._baseValue, impact: this._baseValue, vip: false, businessCritical: false }) - this._minIntermediateResult;
            this.applyAllIntermediateResults(this.getAllOptionsCalculationParameters().map(function(this: MainController, parameters: IAllCalculationParameters): IAllIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, vip: parameters.vip, businessCritical: parameters.businessCritical, intermediateResult: this.getAllParametersProduct(parameters) };
            }));
        }
        
        private recalculateAllOptionsWithSum(): void {
            this._minIntermediateResult = this.getAllParametersSum({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true, businessCritical: true });
            this._intermediateResultRange = this.getAllParametersSum({ urgency: this._baseValue, impact: this._baseValue, vip: false, businessCritical: false }) - this._minIntermediateResult;
            this.applyAllIntermediateResults(this.getAllOptionsCalculationParameters().map(function(this: MainController, parameters: IAllCalculationParameters): IAllIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, vip: parameters.vip, businessCritical: parameters.businessCritical, intermediateResult: this.getAllParametersSum(parameters) };
            }));
        }
        
        private recalculateAllOptionsWithProductPlusSum(): void {
            this._minIntermediateResult = this.getAllParametersProductWithSum({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true, businessCritical: true });
            this._intermediateResultRange = this.getAllParametersProductWithSum({ urgency: this._baseValue, impact: this._baseValue, vip: false, businessCritical: false }) - this._minIntermediateResult;
            this.applyAllIntermediateResults(this.getAllOptionsCalculationParameters().map(function(this: MainController, parameters: IAllCalculationParameters): IAllIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, vip: parameters.vip, businessCritical: parameters.businessCritical, intermediateResult: this.getAllParametersProductWithSum(parameters) };
            }));
        }
        
        private recalculateAllOptionsWithProductFromSum(): void {
            this._minIntermediateResult = this.getAllParametersSumWithProduct({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true, businessCritical: true });
            this._intermediateResultRange = this.getAllParametersSumWithProduct({ urgency: this._baseValue, impact: this._baseValue, vip: false, businessCritical: false }) - this._minIntermediateResult;
            this.applyAllIntermediateResults(this.getAllOptionsCalculationParameters().map(function(this: MainController, parameters: IAllCalculationParameters): IAllIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, vip: parameters.vip, businessCritical: parameters.businessCritical, intermediateResult: this.getAllParametersSumWithProduct(parameters) };
            }));
        }
        
        private applyVipIntermediateResults(intermediateResults: IVipIntermediateResult[]): void {
            this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IVipIntermediateResult): ICalculationResultRow {
                return {
                    urgency: result.urgency,
                    impact: result.impact,
                    intermediateResult: result.intermediateResult,
                    optionalValues: [result.vip ? "Yes" : "No"],
                    priority: ((result.intermediateResult - this._minIntermediateResult / this._intermediateResultRange) * this._priorityRange) + this._baseValue
                };
            }, this);
            this.applySort();
        }
        
        private recalculateVipWithProduct(): void {
            this._minIntermediateResult = this.getVipParametersProduct({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true });
            this._intermediateResultRange = this.getVipParametersProduct({ urgency: this._baseValue, impact: this._baseValue, vip: false }) - this._minIntermediateResult;
            this.applyVipIntermediateResults(this.getVipCalculationParameters().map(function(this: MainController, parameters: IVipCalculationParameters): IVipIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, vip: parameters.vip,  intermediateResult: this.getVipParametersProduct(parameters) };
            }));
        }
        
        private recalculateVipWithSum(): void {
            this._minIntermediateResult = this.getVipParametersSum({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true });
            this._intermediateResultRange = this.getVipParametersSum({ urgency: this._baseValue, impact: this._baseValue, vip: false }) - this._minIntermediateResult;
            this.applyVipIntermediateResults(this.getVipCalculationParameters().map(function(this: MainController, parameters: IVipCalculationParameters): IVipIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, vip: parameters.vip,  intermediateResult: this.getVipParametersSum(parameters) };
            }));
        }
        
        private recalculateVipWithProductPlusSum(): void {
            this._minIntermediateResult = this.getVipParametersProductWithSum({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true });
            this._intermediateResultRange = this.getVipParametersProductWithSum({ urgency: this._baseValue, impact: this._baseValue, vip: false }) - this._minIntermediateResult;
            this.applyVipIntermediateResults(this.getVipCalculationParameters().map(function(this: MainController, parameters: IVipCalculationParameters): IVipIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, vip: parameters.vip,  intermediateResult: this.getVipParametersProductWithSum(parameters) };
            }));
        }
        
        private recalculateVipWithProductFromSum(): void {
            this._minIntermediateResult = this.getVipParametersSumWithProduct({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, vip: true });
            this._intermediateResultRange = this.getVipParametersSumWithProduct({ urgency: this._baseValue, impact: this._baseValue, vip: false }) - this._minIntermediateResult;
            this.applyVipIntermediateResults(this.getVipCalculationParameters().map(function(this: MainController, parameters: IVipCalculationParameters): IVipIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, vip: parameters.vip,  intermediateResult: this.getVipParametersSumWithProduct(parameters) };
            }));
        }
        
        private applyBusinessCriticalIntermediateResults(intermediateResults: IBusinessCriticalIntermediateResult[]): void {
            this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IBusinessCriticalIntermediateResult): ICalculationResultRow {
                return {
                    urgency: result.urgency,
                    impact: result.impact,
                    intermediateResult: result.intermediateResult,
                    optionalValues: [result.businessCritical ? "Yes" : "No"],
                    priority: ((result.intermediateResult - this._minIntermediateResult / this._intermediateResultRange) * this._priorityRange) + this._baseValue
                };
            }, this);
            this.applySort();
        }
        
        private recalculateBusinessCriticalWithProduct(): void {
            this._minIntermediateResult = this.getBusinessCriticalParametersProduct({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, businessCritical: true });
            this._intermediateResultRange = this.getBusinessCriticalParametersProduct({ urgency: this._baseValue, impact: this._baseValue, businessCritical: false }) - this._minIntermediateResult;
            this.applyBusinessCriticalIntermediateResults(this.getBusinessCriticalCalculationParameters().map(function(this: MainController, parameters: IBusinessCriticalCalculationParameters): IBusinessCriticalIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, businessCritical: parameters.businessCritical, intermediateResult: this.getBusinessCriticalParametersProduct(parameters) };
            }));
        }
        
        private recalculateBusinessCriticalWithSum(): void {
            this._minIntermediateResult = this.getBusinessCriticalParametersSum({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, businessCritical: true });
            this._intermediateResultRange = this.getBusinessCriticalParametersSum({ urgency: this._baseValue, impact: this._baseValue, businessCritical: false }) - this._minIntermediateResult;
            this.applyBusinessCriticalIntermediateResults(this.getBusinessCriticalCalculationParameters().map(function(this: MainController, parameters: IBusinessCriticalCalculationParameters): IBusinessCriticalIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, businessCritical: parameters.businessCritical, intermediateResult: this.getBusinessCriticalParametersSum(parameters) };
            }));
        }
        
        private recalculateBusinessCriticalWithProductPlusSum(): void {
            this._minIntermediateResult = this.getBusinessCriticalParametersProductWithSum({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, businessCritical: true });
            this._intermediateResultRange = this.getBusinessCriticalParametersProductWithSum({ urgency: this._baseValue, impact: this._baseValue, businessCritical: false }) - this._minIntermediateResult;
            this.applyBusinessCriticalIntermediateResults(this.getBusinessCriticalCalculationParameters().map(function(this: MainController, parameters: IBusinessCriticalCalculationParameters): IBusinessCriticalIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, businessCritical: parameters.businessCritical, intermediateResult: this.getBusinessCriticalParametersProductWithSum(parameters) };
            }));
        }
        
        private recalculateBusinessCriticalWithProductFromSum(): void {
            this._minIntermediateResult = this.getBusinessCriticalParametersSumWithProduct({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue, businessCritical: true });
            this._intermediateResultRange = this.getBusinessCriticalParametersSumWithProduct({ urgency: this._baseValue, impact: this._baseValue, businessCritical: false }) - this._minIntermediateResult;
            this.applyBusinessCriticalIntermediateResults(this.getBusinessCriticalCalculationParameters().map(function(this: MainController, parameters: IBusinessCriticalCalculationParameters): IBusinessCriticalIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, businessCritical: parameters.businessCritical, intermediateResult: this.getBusinessCriticalParametersSumWithProduct(parameters) };
            }));
        }
        
        private applyUrgencyImpactOnlyIntermediateResults(intermediateResults: IIntermediateResult[]): void {
            this.$scope.calculationResults = intermediateResults.map(function(this: MainController, result: IIntermediateResult): ICalculationResultRow {
                return {
                    urgency: result.urgency,
                    impact: result.impact,
                    intermediateResult: result.intermediateResult,
                    optionalValues: [],
                    priority: ((result.intermediateResult - this._minIntermediateResult / this._intermediateResultRange) * this._priorityRange) + this._baseValue
                };
            }, this);
            this.applySort();
        }
        
        private recalculateUrgencyImpactOnlyWithProduct(): void {
            this._minIntermediateResult = this.getUrgencyImpactOnlyParametersProduct({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue });
            this._intermediateResultRange = this.getUrgencyImpactOnlyParametersProduct({ urgency: this._baseValue, impact: this._baseValue }) - this._minIntermediateResult;
            this.applyUrgencyImpactOnlyIntermediateResults(this.getImpactUrgencyOnlyCalculationParameters().map(function(this: MainController, parameters: ICalculationParameters): IIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, intermediateResult: this.getUrgencyImpactOnlyParametersProduct(parameters) };
            }));
        }
        
        private recalculateUrgencyImpactOnlyWithSum(): void {
            this._minIntermediateResult = this.getUrgencyImpactOnlyParametersSum({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue });
            this._intermediateResultRange = this.getUrgencyImpactOnlyParametersSum({ urgency: this._baseValue, impact: this._baseValue }) - this._minIntermediateResult;
            this.applyUrgencyImpactOnlyIntermediateResults(this.getImpactUrgencyOnlyCalculationParameters().map(function(this: MainController, parameters: ICalculationParameters): IIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, intermediateResult: this.getUrgencyImpactOnlyParametersSum(parameters) };
            }));
        }
        
        private recalculateUrgencyImpactOnlyWithProductPlusSum(): void {
            this._minIntermediateResult = this.getUrgencyImpactOnlyParametersProductWithSum({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue });
            this._intermediateResultRange = this.getUrgencyImpactOnlyParametersProductWithSum({ urgency: this._baseValue, impact: this._baseValue }) - this._minIntermediateResult;
            this.applyUrgencyImpactOnlyIntermediateResults(this.getImpactUrgencyOnlyCalculationParameters().map(function(this: MainController, parameters: ICalculationParameters): IIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, intermediateResult: this.getUrgencyImpactOnlyParametersProductWithSum(parameters) };
            }));
        }
        
        private recalculateUrgencyImpactOnlyWithProductFromSum(): void {
            this._minIntermediateResult = this.getUrgencyImpactOnlyParametersSumWithProduct({ urgency: this._urgencyRange - 1 + this._baseValue, impact: this._impactRange - 1 + this._baseValue });
            this._intermediateResultRange = this.getUrgencyImpactOnlyParametersSumWithProduct({ urgency: this._baseValue, impact: this._baseValue }) - this._minIntermediateResult;
            this.applyUrgencyImpactOnlyIntermediateResults(this.getImpactUrgencyOnlyCalculationParameters().map(function(this: MainController, parameters: ICalculationParameters): IIntermediateResult {
                return { urgency: parameters.urgency, impact: parameters.impact, intermediateResult: this.getUrgencyImpactOnlyParametersSumWithProduct(parameters) };
            }));
        }
        
        recalculate(): void {
            if (this._vipOption) {
                if (this._businessCriticalOption) {
                    switch (this._baseFormula) {
                        case BaseFormulaType.add:
                            this.recalculateAllOptionsWithSum();
                            break;
                        case BaseFormulaType.multiplyAdd:
                            this.recalculateAllOptionsWithProductPlusSum();
                            break;
                        case BaseFormulaType.addMultiply:
                            this.recalculateAllOptionsWithProductFromSum();
                            break;
                        default:
                            this.recalculateAllOptionsWithProduct();
                            break;
                    }
                } else {
                    switch (this._baseFormula) {
                        case BaseFormulaType.add:
                            this.recalculateVipWithSum();
                            break;
                        case BaseFormulaType.multiplyAdd:
                            this.recalculateVipWithProductPlusSum();
                            break;
                        case BaseFormulaType.addMultiply:
                            this.recalculateVipWithProductFromSum();
                            break;
                        default:
                            this.recalculateVipWithProduct();
                            break;
                    }
                }
            } else {
                if (this._businessCriticalOption) {
                    switch (this._baseFormula) {
                        case BaseFormulaType.add:
                            this.recalculateBusinessCriticalWithSum();
                            break;
                        case BaseFormulaType.multiplyAdd:
                            this.recalculateBusinessCriticalWithProductPlusSum();
                            break;
                        case BaseFormulaType.addMultiply:
                            this.recalculateBusinessCriticalWithProductFromSum();
                            break;
                        default:
                            this.recalculateBusinessCriticalWithProduct();
                            break;
                    }
                } else {
                    switch (this._baseFormula) {
                        case BaseFormulaType.add:
                            this.recalculateUrgencyImpactOnlyWithSum();
                            break;
                        case BaseFormulaType.multiplyAdd:
                            this.recalculateUrgencyImpactOnlyWithProductPlusSum();
                            break;
                        case BaseFormulaType.addMultiply:
                            this.recalculateUrgencyImpactOnlyWithProductFromSum();
                            break;
                        default:
                            this.recalculateUrgencyImpactOnlyWithProduct();
                            break;
                    }
                }
            }
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