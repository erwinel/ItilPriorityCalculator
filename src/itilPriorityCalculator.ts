/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/@types/angular/index.d.ts"/>
/// <reference path="../node_modules/@types/bootstrap/index.d.ts"/>
/// <reference path="../node_modules/@types/angular-ui-bootstrap/index.d.ts"/>
/// <reference path="./statements.ts"/>

/**
 * ITIL Priority Calculator
 * @module itilPriorityCalculator
 * @see itilPriorityCalculator:itilPriorityCalculatorModule
 * @see itilPriorityCalculator:MainController
 */
namespace itilPriorityCalculator {
    'use strict';

    /**
     * Represents an object that can be bound to an {@link HTMLOptionElement} within an {@link HTMLSelectElement}.
     * @template T - The value type.
     * @interface ISelectionItem
     * @see IMainControllerScope#roundingOptions
     * @see IMainControllerScope#baseFormulaOptions
     */
    interface ISelectionItem<T> {
        /** The text that is bound to the {@link HTMLOptionElement#text}, which is the text that is displayed to the user. */
        label: string;

        /** The value to be bound to the {@link HTMLOptionElement#value} attribute. */
        id: T;
    }

    /**
     *
     *
     * @interface IBasicPriorityCalculationResult
     */
    interface IBasicPriorityCalculationResult {
        urgency: number;
        impact: number;
        priority: number;
    }

    interface IColumnSort {
        id: BasicColumnNames;
        isDescending: boolean
    }

    declare type BasicColumnNames = keyof IBasicPriorityCalculationResult;

    class BasicColumnSort {
        id: BasicColumnNames;
        isDescending: boolean = false;
        constructor(id: BasicColumnNames) { this.id = id; }
        compare(a: IBasicPriorityCalculationResult, b: IBasicPriorityCalculationResult): number {
            return this.isDescending ? b[this.id] - a[this.id] : a[this.id] - b[this.id];
        }
    }

    interface IVipOnlyPriorityCalculationResult extends IBasicPriorityCalculationResult {
        vipPriority: number;
    }

    declare type VipOnlyColumnNames = keyof IVipOnlyPriorityCalculationResult;

    class VipOnlyColumnSort {
        id: VipOnlyColumnNames;
        isDescending: boolean = false;
        constructor(id: VipOnlyColumnNames) { this.id = id; }
        compare(a: IVipOnlyPriorityCalculationResult, b: IVipOnlyPriorityCalculationResult): number {
            return this.isDescending ? b[this.id] - a[this.id] : a[this.id] - b[this.id];
        }
    }
    
    interface IBaseCalculationFactory {
        create<C extends statements.ICalculationContext>(urgency: statements.INumericalStatement<C>, impact: statements.INumericalStatement<C>): statements.INumericalStatement<C>;
    }

    interface IRoundingFactory {
        create<C extends statements.ICalculationContext>(value: statements.INumericalStatement<C>): statements.INumericalStatement<C>;
    }
    
    interface IMainControllerScope extends ng.IScope {
        rangeOptions: string[];
        urgencyRange: string;
        impactRange: string;
        priorityRange: string;
        isZeroBased: boolean;
        vipOnlyDelta: number;
        vipDelta: number;
        businessRelatedOnlyDelta: number;
        businessRelatedDelta: number;
        roundingOptions: ISelectionItem<statements.RoundingType>[];
        currentRoundingOption: statements.RoundingType;
        baseFormulaOptions: ISelectionItem<statements.BaseFormulaType>[];
        currentBaseFormula: statements.BaseFormulaType;
        baseFormulaString: string;
        vipFormulaString: string;
        businessRelatedFormulaString;
        allOptionsFormulaString: string;
        resultRows: IBasicPriorityCalculationResult[];
        urgencySortDirection: -1 | 0 | 1;
        impactSortDirection: -1 | 0 | 1;
        prioritySortDirection: -1 | 0 | 1;
        showModifySettingsDialog(e: JQuery.Event): boolean;
        hideModifySettingsDialog(e: JQuery.Event): boolean;
    }

    export let itilPriorityCalculatorModule: angular.IModule = angular.module("itilPriorityCalculatorModule", []);

    export class MainController {
        static $inject: Array<string> = ["$scope"];
        private _urgencyRange: number = 3;
        private _impactRange: number = 3;
        private _priorityRange: number = 5;
        private _isZeroBased: boolean = false;
        private _vipOnlyDelta: number = 3;
        private _vipDelta: number = 4;
        private _businessRelatedOnlyDelta: number = 3;
        private _businessRelatedDelta: number = 2;
        private _currentRoundingOption: statements.RoundingType = statements.RoundingType.nearest;
        private _currentBaseFormula: statements.BaseFormulaType = statements.BaseFormulaType.add;
        private _sorting: IColumnSort[] = [
            new BasicColumnSort("priority"),
            new BasicColumnSort("urgency"),
            new BasicColumnSort("impact")
        ];

        applySort() {
            switch (this._sorting[0].id) {
                case "urgency":
                    this.$scope.urgencySortDirection = this._sorting[0].isDescending ? -1 : 1;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.prioritySortDirection = 0;
                    break;
                case "impact":
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.impactSortDirection = this._sorting[0].isDescending ? -1 : 1;
                    this.$scope.prioritySortDirection = 0;
                    break;
                default:
                    this.$scope.urgencySortDirection = 0;
                    this.$scope.impactSortDirection = 0;
                    this.$scope.prioritySortDirection = this._sorting[0].isDescending ? -1 : 1;
                    break;
            }
            var sorting: IColumnSort[] = this._sorting;
            this.$scope.resultRows.sort(function(a: IBasicPriorityCalculationResult, b: IBasicPriorityCalculationResult): number {
                for (var i = 0; i < sorting.length; i++) {
                    if (sorting[i] instanceof BasicColumnSort) {
                        var r = (<BasicColumnSort>sorting[i]).compare(a, b);
                        if (r != 0) return r;
                    }
                }
                return 0;
            });
        }
        onColumnHeadingClick(id: BasicColumnNames, e: JQuery.Event): boolean {
            e.preventDefault();
            var index: number = this._sorting.findIndex(function(this: BasicColumnNames, item: IColumnSort): boolean { return item.id == this; }, id);
            if (index >= 0) {
                var item = this._sorting[index];
                if (index == 0)
                    item.isDescending = !item.isDescending;
                else {
                    if (index == this._sorting.length - 1)
                        this._sorting.pop();
                    else
                        this._sorting.splice(index, 1);
                    this._sorting.unshift(item);
                }
                this.applySort();
            }
            return false;
        }

        recalculate(): void {
            var baseCalculation: IBaseCalculationFactory;
            var divisor: number;
            var baseValue: number = this._isZeroBased ? 0.0 : 1.0;
            var maxUrgencyValue = this._urgencyRange + baseValue;
            var maxImpactValue = this._impactRange + baseValue;
            this.applySort();
        }
        constructor(private $scope: IMainControllerScope) {
            let controller: MainController = this;
            $scope.rangeOptions = ['2', '3', '4', '5', '6', '7'];
            $scope.urgencyRange = this._urgencyRange.toString();
            $scope.impactRange = this._impactRange.toString();
            $scope.priorityRange = this._priorityRange.toString();
            $scope.isZeroBased = this._isZeroBased;
            $scope.vipOnlyDelta = this._vipOnlyDelta;
            $scope.vipDelta = this._vipDelta;
            $scope.businessRelatedOnlyDelta = this._businessRelatedOnlyDelta;
            $scope.businessRelatedDelta = this._businessRelatedDelta;
            $scope.roundingOptions = [
                { id: statements.RoundingType.floor, label: 'Floor' },
                { id: statements.RoundingType.nearest, label: 'Nearest' },
                { id: statements.RoundingType.ceiling, label: 'Ceiling' }
            ];
            $scope.currentRoundingOption = this._currentRoundingOption;
            $scope.baseFormulaOptions = [
                { id: statements.BaseFormulaType.add, label: "Add (urgency + impact)" },
                { id: statements.BaseFormulaType.multiply, label: "Multiply (urgency * impact)" },
                { id: statements.BaseFormulaType.addMultiply, label: "Add, then Multiply ((urgency + impact) * urgency * impact)" },
                { id: statements.BaseFormulaType.multiplyAdd, label: "Multiply, then Add ((urgency * impact) + urgency + impact)" }
            ];
            $scope.currentBaseFormula = statements.BaseFormulaType.add;
            $scope.showModifySettingsDialog = function(e: JQuery.Event): boolean {
                e.preventDefault();
                $("#modifySettingsDialog").modal('show');
                return false;
            };
            $scope.hideModifySettingsDialog = function(e: JQuery.Event): boolean {
                e.preventDefault();
                $("#modifySettingsDialog").modal('hide');
                var urgencyRange: number = parseInt($scope.urgencyRange);
                var impactRange: number = parseInt($scope.impactRange);
                var priorityRange: number = parseInt($scope.priorityRange);
                var isZeroBased: boolean = $scope.isZeroBased === true;
                var currentRoundingOption: statements.RoundingType = $scope.currentRoundingOption;
                var currentBaseFormula: statements.BaseFormulaType = $scope.currentBaseFormula;
                var vipOnlyDelta: number = $scope.vipOnlyDelta;
                var vipDelta: number = $scope.vipDelta;
                var businessRelatedOnlyDelta: number = $scope.businessRelatedOnlyDelta;
                var businessRelatedDelta: number = $scope.businessRelatedDelta;
                if (urgencyRange != controller._urgencyRange || impactRange != controller._impactRange || priorityRange != controller._priorityRange || isZeroBased != controller._isZeroBased ||
                        currentRoundingOption != controller._currentRoundingOption || currentBaseFormula != controller._currentBaseFormula || vipOnlyDelta != controller._vipOnlyDelta ||
                        vipDelta != controller._vipDelta || businessRelatedOnlyDelta != controller._businessRelatedOnlyDelta || businessRelatedDelta != controller._businessRelatedDelta) {
                    controller._urgencyRange = urgencyRange;
                    controller._impactRange = impactRange;
                    controller._priorityRange = priorityRange;
                    controller._isZeroBased = isZeroBased;
                    controller._currentRoundingOption = currentRoundingOption;
                    controller._currentBaseFormula = currentBaseFormula;
                    controller._vipOnlyDelta = vipOnlyDelta;
                    controller._vipDelta = vipDelta;
                    controller._businessRelatedOnlyDelta = businessRelatedOnlyDelta;
                    controller._businessRelatedDelta = businessRelatedDelta;
                    controller.recalculate();
                }
                return false;
            };
            this.recalculate();
        }
    }

    itilPriorityCalculatorModule.controller("MainController", MainController);
}