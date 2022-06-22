"use strict";
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
var itilPriorityCalculator;
(function (itilPriorityCalculator) {
    'use strict';
    class BasicColumnSort {
        constructor(id) {
            this.isDescending = false;
            this.id = id;
        }
        compare(a, b) {
            return this.isDescending ? b[this.id] - a[this.id] : a[this.id] - b[this.id];
        }
    }
    class VipOnlyColumnSort {
        constructor(id) {
            this.isDescending = false;
            this.id = id;
        }
        compare(a, b) {
            return this.isDescending ? b[this.id] - a[this.id] : a[this.id] - b[this.id];
        }
    }
    itilPriorityCalculator.itilPriorityCalculatorModule = angular.module("itilPriorityCalculatorModule", []);
    class MainController {
        constructor($scope) {
            this.$scope = $scope;
            this._urgencyRange = 3;
            this._impactRange = 3;
            this._priorityRange = 5;
            this._isZeroBased = false;
            this._vipOnlyDelta = 3;
            this._vipDelta = 4;
            this._businessRelatedOnlyDelta = 3;
            this._businessRelatedDelta = 2;
            this._currentRoundingOption = statements.RoundingType.nearest;
            this._currentBaseFormula = statements.BaseFormulaType.add;
            this._sorting = [
                new BasicColumnSort("priority"),
                new BasicColumnSort("urgency"),
                new BasicColumnSort("impact")
            ];
            let controller = this;
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
            $scope.showModifySettingsDialog = function (e) {
                e.preventDefault();
                $("#modifySettingsDialog").modal('show');
                return false;
            };
            $scope.hideModifySettingsDialog = function (e) {
                e.preventDefault();
                $("#modifySettingsDialog").modal('hide');
                var urgencyRange = parseInt($scope.urgencyRange);
                var impactRange = parseInt($scope.impactRange);
                var priorityRange = parseInt($scope.priorityRange);
                var isZeroBased = $scope.isZeroBased === true;
                var currentRoundingOption = $scope.currentRoundingOption;
                var currentBaseFormula = $scope.currentBaseFormula;
                var vipOnlyDelta = $scope.vipOnlyDelta;
                var vipDelta = $scope.vipDelta;
                var businessRelatedOnlyDelta = $scope.businessRelatedOnlyDelta;
                var businessRelatedDelta = $scope.businessRelatedDelta;
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
            var sorting = this._sorting;
            this.$scope.resultRows.sort(function (a, b) {
                for (var i = 0; i < sorting.length; i++) {
                    if (sorting[i] instanceof BasicColumnSort) {
                        var r = sorting[i].compare(a, b);
                        if (r != 0)
                            return r;
                    }
                }
                return 0;
            });
        }
        onColumnHeadingClick(id, e) {
            e.preventDefault();
            var index = this._sorting.findIndex(function (item) { return item.id == this; }, id);
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
        recalculate() {
            var baseCalculation;
            var divisor;
            var baseValue = this._isZeroBased ? 0.0 : 1.0;
            var maxUrgencyValue = this._urgencyRange + baseValue;
            var maxImpactValue = this._impactRange + baseValue;
            this.applySort();
        }
    }
    MainController.$inject = ["$scope"];
    itilPriorityCalculator.MainController = MainController;
    itilPriorityCalculator.itilPriorityCalculatorModule.controller("MainController", MainController);
})(itilPriorityCalculator || (itilPriorityCalculator = {}));
//# sourceMappingURL=itilPriorityCalculator.js.map