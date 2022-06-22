/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/@types/angular/index.d.ts"/>
/// <reference path="../node_modules/@types/bootstrap/index.d.ts"/>
/// <reference path="../node_modules/@types/angular-ui-bootstrap/index.d.ts"/>

namespace app {
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

    function isBaseFormulaType(value: any): value is BaseFormulaType {
        return typeof value === 'string' && (value === BaseFormulaType.multiply || value === BaseFormulaType.add || value === BaseFormulaType.multiplyAdd || value === BaseFormulaType.addMultiply);
    }
    
    enum ResultFieldName {
        urgency = "urgency",
        impact = "impact",
        vip = "vip",
        businessRelated = "businessRelated",
        priority = "priority"
    }

    interface IFieldSortParameter {
        field: ResultFieldName;
        descending: boolean;
    }

    interface ICalculationParameters {
        urgency: number;
        impact: number;
    }
    
    interface ICalculationResultRow extends ICalculationParameters {
        urgencyImpactOnly: number;
        vipOnly: {
            vipTrue: number;
            vipFalse: number;
        };
        businessRelatedOnly: {
            businessRelatedTrue: number;
            businessRelatedFalse: number;
        };
        full: {
            vipTrue: {
                businessRelatedTrue: number;
                businessRelatedFalse: number;
            };
            vipFalse: {
                businessRelatedTrue: number;
                businessRelatedFalse: number;
            };
        }
    }

    class NavigationTab {
        isActive: boolean = false;
        tabClassNames: string[] = ['nav-link'];
        contentClassNames: string[] = ['tab-pane', 'fade'];

        setActiveResultsTab(isActive: boolean) {
            this.isActive = isActive;
            if (isActive) {
                if (this.tabClassNames.indexOf('active') < 0) this.tabClassNames.push('active');
                if (this.contentClassNames.indexOf('active') < 0) this.contentClassNames.push('active');
                if (this.contentClassNames.indexOf('show') < 0) this.contentClassNames.push('show');
            } else {
                if (this.tabClassNames.indexOf('active') > 0) this.tabClassNames = this.tabClassNames.filter(function(n) { return n != 'active'; });
                if (this.contentClassNames.indexOf('active') >= 0) {
                    if (this.contentClassNames.indexOf('show') >= 0)
                        this.tabClassNames = this.tabClassNames.filter(function(n) { return n != 'active' && n != 'show'; });
                    else
                        this.tabClassNames = this.tabClassNames.filter(function(n) { return n != 'active'; });
                }
                else if (this.contentClassNames.indexOf('show') >= 0)
                    this.tabClassNames = this.tabClassNames.filter(function(n) { return n != 'show'; });
            }
        }
    }
    
    interface INavigationTabSet {
        basic: NavigationTab;
        vipOnly: NavigationTab;
        businessRelatedOnly: NavigationTab;
        allOptions: NavigationTab;
    }

    declare type NavgationId = keyof INavigationTabSet;

    interface IUrgencyImpactOnlyContext { denominator: number; controller: MainController; }
    interface IUrgencyImpactOnlyFunc { (this: IUrgencyImpactOnlyContext, urgency: number, impact: number): number }
    
    interface IMainControllerScope extends ng.IScope {
        tabs: INavigationTabSet;
        rangeValues: string[];
        urgencyRange: string;
        impactRange: string;
        priorityRange: string;
        baseValue: "0" | "1";
        rounding: RoundingType;
        vipWeight: number;
        businessRelatedWeight: number;
        baseFormula: BaseFormulaType;
        formulaText: string;
        urgencySortDirection: SortDirection;
        impactSortDirection: SortDirection;
        vipSortDirection: SortDirection;
        businessRelatedSortDirection: SortDirection;
        prioritySortDirection: SortDirection;
        calculationResults: ICalculationResultRow[];
        setActiveResultsTab(navId: NavgationId, e: JQuery.Event): boolean;
        toggleUrgencySort(): boolean;
        toggleImpactSort(): boolean;
        toggleVipSort(): boolean;
        toggleBusinessRelatedSort(): boolean;
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
        private _zeroBased: boolean = false;
        private _rounding: RoundingType = RoundingType.floor;
        private _vipWeight: number = 2;
        private _businessRelatedWeight: number = 1.5;
        private _baseFormula: BaseFormulaType = BaseFormulaType.multiply;
        private _sortOrder: IFieldSortParameter[] = [
            { field: ResultFieldName.priority, descending: false },
            { field: ResultFieldName.impact, descending: false },
            { field: ResultFieldName.urgency, descending: false },
            { field: ResultFieldName.vip, descending: false },
            { field: ResultFieldName.businessRelated, descending: false }
        ];

        constructor(private $scope: IMainControllerScope) {
            this.$scope.tabs = {
                basic: new NavigationTab(),
                vipOnly: new NavigationTab(),
                businessRelatedOnly: new NavigationTab(),
                allOptions: new NavigationTab()
            };
            $scope.rangeValues = ["2", "3", "4", "5", "6", "7"];
            $scope.urgencyRange = '' + this._urgencyRange;
            $scope.impactRange = '' + this._impactRange;
            $scope.priorityRange = '' + this._priorityRange;
            $scope.baseValue = this._zeroBased ? "0" : "1";
            $scope.rounding = this._rounding;
            $scope.vipWeight = this._vipWeight;
            $scope.businessRelatedWeight = this._businessRelatedWeight;
            $scope.baseFormula = this._baseFormula;
            $scope.urgencySortDirection = 0;
            $scope.impactSortDirection = 0;
            $scope.vipSortDirection = 0;
            $scope.businessRelatedSortDirection = 0;
            $scope.prioritySortDirection = 1;
            let controller: MainController = this;
            $scope.setActiveResultsTab = function(navId: NavgationId, e: JQuery.Event): boolean {
                e.preventDefault();
                controller.setActiveResultsTab(navId);
                return false;
            };
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
            $scope.$watch('baseValue', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                controller.onBaseValueChanged(newValue === '0');
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
            $scope.$watch('businessRelatedWeight', function(newValue: any, oldValue: any, scope: ng.IScope): void {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue)) controller.onBusinessRelatedWeightChanged(newValue);
                } else if (typeof newValue === 'string') {
                    let value: number = parseFloat(newValue);
                    if (!isNaN(value)) controller.onBusinessRelatedWeightChanged(value);
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
            $scope.toggleBusinessRelatedSort = function(): boolean { controller.toggleSort(ResultFieldName.businessRelated); return false; }
            $scope.togglePrioritySort = function(): boolean { controller.toggleSort(ResultFieldName.priority); return false; }
            this.setActiveResultsTab('basic');
            this.recalculate();
        }

        setActiveResultsTab(id: NavgationId) {
            var otherTabs: NavigationTab[];
            switch (id) {
                case "vipOnly":
                    this.$scope.tabs.vipOnly.setActiveResultsTab(true);
                    otherTabs = [this.$scope.tabs.basic, this.$scope.tabs.businessRelatedOnly, this.$scope.tabs.allOptions];
                    break;
                case "businessRelatedOnly":
                    this.$scope.tabs.businessRelatedOnly.setActiveResultsTab(true);
                    otherTabs = [this.$scope.tabs.basic, this.$scope.tabs.vipOnly, this.$scope.tabs.allOptions];
                    break;
                case "allOptions":
                    this.$scope.tabs.allOptions.setActiveResultsTab(true);
                    otherTabs = [this.$scope.tabs.basic, this.$scope.tabs.vipOnly, this.$scope.tabs.businessRelatedOnly];
                    break;
                default:
                    this.$scope.tabs.basic.setActiveResultsTab(true);
                    otherTabs = [this.$scope.tabs.vipOnly, this.$scope.tabs.businessRelatedOnly, this.$scope.tabs.allOptions];
                    break;
            }
            otherTabs.forEach(function(tab: NavigationTab) { tab.setActiveResultsTab(false); });
        }

        applySort(): void {
            
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

        recalculate(): void {
            var startNumber: number = this._zeroBased ? 0 : 1; // zerobased = false => startNumber = 1
            var baseFormulaFunc: { (urgency: number, impact: number): number };
            switch (this._baseFormula) {
                case BaseFormulaType.addMultiply:
                    baseFormulaFunc = function(urgency: number, impact: number): number { return (urgency + impact) * urgency * impact; }
                    break;
                case BaseFormulaType.multiplyAdd:
                    baseFormulaFunc = function(urgency: number, impact: number): number { return urgency * impact + urgency + impact; }
                    break;
                case BaseFormulaType.add:
                    baseFormulaFunc = function(urgency: number, impact: number): number { return urgency + impact; }
                    break;
                default:
                    baseFormulaFunc = function(urgency: number, impact: number): number { return urgency * impact; }
                    break;
            }
            var roundFunc: { (value: number): number };
            switch (this._rounding) {
                case RoundingType.ceiling:
                    roundFunc = function(value: number): number { return Math.ceil(value); };
                    break;
                case RoundingType.nearest:
                    roundFunc = function(value: number): number { return Math.round(value); };
                    break;
                default:
                    roundFunc = function(value: number): number { return Math.floor(value); };
                    break;
            }
            var maxUrgency: number = this._urgencyRange - 1;
            var maxImpact: number = this._impactRange - 1;
            var basicDenominator: number = baseFormulaFunc(maxUrgency, maxImpact);
            var vipOnlyDenominator: number = basicDenominator + this._vipWeight;
            var businessRelatedOnlyDenominator: number = basicDenominator + this._businessRelatedWeight;
            var allOptionsDenominator: number = basicDenominator + this._vipWeight + this._businessRelatedWeight;
            var priorityMultiplier: number = this._priorityRange - 1.0;
            this.$scope.calculationResults = [];
            for (var urgency: number = 0; urgency < this._urgencyRange; urgency++) {
                for (var impact: number = 0; impact < this._impactRange; impact++) {
                    var baseResult: number = baseFormulaFunc(maxUrgency - urgency, maxImpact - impact);
                    this.$scope.calculationResults.push({
                        impact: impact + startNumber, urgency: urgency + startNumber,
                        urgencyImpactOnly: roundFunc(priorityMultiplier - ((baseResult / basicDenominator) * priorityMultiplier) + startNumber),
                        vipOnly: {
                            vipFalse: roundFunc(priorityMultiplier - ((baseResult / vipOnlyDenominator) * priorityMultiplier) + startNumber),
                            vipTrue: roundFunc(priorityMultiplier - (((baseResult + this._vipWeight) / vipOnlyDenominator) * priorityMultiplier) + startNumber)
                        },
                        businessRelatedOnly: {
                            businessRelatedFalse: roundFunc(priorityMultiplier - ((baseResult / businessRelatedOnlyDenominator) * priorityMultiplier) + startNumber),
                            businessRelatedTrue: roundFunc(priorityMultiplier - (((baseResult + this._businessRelatedWeight) / businessRelatedOnlyDenominator) * priorityMultiplier) + startNumber)
                        },
                        full: {
                            vipTrue: {
                                businessRelatedFalse: roundFunc(priorityMultiplier - (((baseResult + this._vipWeight) / allOptionsDenominator) * priorityMultiplier) + startNumber),
                                businessRelatedTrue: roundFunc(priorityMultiplier - (((baseResult + this._vipWeight + this._businessRelatedWeight) / allOptionsDenominator) * priorityMultiplier) + startNumber)
                            },
                            vipFalse: {
                                businessRelatedFalse: roundFunc(priorityMultiplier - ((baseResult / allOptionsDenominator) * priorityMultiplier) + startNumber),
                                businessRelatedTrue: roundFunc(priorityMultiplier - (((baseResult + this._businessRelatedWeight) / allOptionsDenominator) * priorityMultiplier) + startNumber)
                            }
                        }
                    })               
                }
            }
            this.$scope.calculationResults.sort(function(a: ICalculationParameters, b: ICalculationParameters) { return (a.urgency + a.impact) - (b.urgency + b.impact); });
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

        onBaseValueChanged(newValue: boolean): void {
            if (newValue == this._zeroBased) return;
            this._zeroBased = newValue;
            this.$scope.calculationResults
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

        onBusinessRelatedWeightChanged(newValue: number): void {
            if (newValue == this._businessRelatedWeight) return;
            this._businessRelatedWeight = newValue;
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