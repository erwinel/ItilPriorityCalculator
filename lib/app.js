"use strict";
/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/@types/angular/index.d.ts"/>
/// <reference path="../node_modules/@types/bootstrap/index.d.ts"/>
/// <reference path="../node_modules/@types/angular-ui-bootstrap/index.d.ts"/>
var app;
(function (app) {
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
    function isBaseFormulaType(value) {
        return typeof value === 'string' && (value === BaseFormulaType.multiply || value === BaseFormulaType.add || value === BaseFormulaType.multiplyAdd || value === BaseFormulaType.addMultiply);
    }
    let ResultFieldName;
    (function (ResultFieldName) {
        ResultFieldName["urgency"] = "urgency";
        ResultFieldName["impact"] = "impact";
        ResultFieldName["vip"] = "vip";
        ResultFieldName["businessRelated"] = "businessRelated";
        ResultFieldName["priority"] = "priority";
    })(ResultFieldName || (ResultFieldName = {}));
    class NavigationTab {
        constructor() {
            this.isActive = false;
            this.tabClassNames = ['nav-link'];
            this.contentClassNames = ['tab-pane', 'fade'];
        }
        setActiveResultsTab(isActive) {
            this.isActive = isActive;
            if (isActive) {
                if (this.tabClassNames.indexOf('active') < 0)
                    this.tabClassNames.push('active');
                if (this.contentClassNames.indexOf('active') < 0)
                    this.contentClassNames.push('active');
                if (this.contentClassNames.indexOf('show') < 0)
                    this.contentClassNames.push('show');
            }
            else {
                if (this.tabClassNames.indexOf('active') > 0)
                    this.tabClassNames = this.tabClassNames.filter(function (n) { return n != 'active'; });
                if (this.contentClassNames.indexOf('active') >= 0) {
                    if (this.contentClassNames.indexOf('show') >= 0)
                        this.tabClassNames = this.tabClassNames.filter(function (n) { return n != 'active' && n != 'show'; });
                    else
                        this.tabClassNames = this.tabClassNames.filter(function (n) { return n != 'active'; });
                }
                else if (this.contentClassNames.indexOf('show') >= 0)
                    this.tabClassNames = this.tabClassNames.filter(function (n) { return n != 'show'; });
            }
        }
    }
    app.mainModule = angular.module("mainModule", []);
    class MainController {
        constructor($scope) {
            this.$scope = $scope;
            this._urgencyRange = 3;
            this._impactRange = 3;
            this._priorityRange = 5;
            this._zeroBased = false;
            this._rounding = RoundingType.floor;
            this._vipWeight = 2;
            this._businessRelatedWeight = 1.5;
            this._baseFormula = BaseFormulaType.multiply;
            this._sortOrder = [
                { field: ResultFieldName.priority, descending: false },
                { field: ResultFieldName.impact, descending: false },
                { field: ResultFieldName.urgency, descending: false },
                { field: ResultFieldName.vip, descending: false },
                { field: ResultFieldName.businessRelated, descending: false }
            ];
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
            let controller = this;
            $scope.setActiveResultsTab = function (navId, e) {
                e.preventDefault();
                controller.setActiveResultsTab(navId);
                return false;
            };
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
            $scope.$watch('baseValue', function (newValue, oldValue, scope) {
                controller.onBaseValueChanged(newValue === '0');
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
            $scope.$watch('businessRelatedWeight', function (newValue, oldValue, scope) {
                if (typeof newValue === 'number') {
                    if (!isNaN(newValue))
                        controller.onBusinessRelatedWeightChanged(newValue);
                }
                else if (typeof newValue === 'string') {
                    let value = parseFloat(newValue);
                    if (!isNaN(value))
                        controller.onBusinessRelatedWeightChanged(value);
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
            $scope.toggleBusinessRelatedSort = function () { controller.toggleSort(ResultFieldName.businessRelated); return false; };
            $scope.togglePrioritySort = function () { controller.toggleSort(ResultFieldName.priority); return false; };
            this.setActiveResultsTab('basic');
            this.recalculate();
        }
        setActiveResultsTab(id) {
            var otherTabs;
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
            otherTabs.forEach(function (tab) { tab.setActiveResultsTab(false); });
        }
        applySort() {
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
        recalculate() {
            var startNumber = this._zeroBased ? 0 : 1; // zerobased = false => startNumber = 1
            var baseFormulaFunc;
            switch (this._baseFormula) {
                case BaseFormulaType.addMultiply:
                    baseFormulaFunc = function (urgency, impact) { return (urgency + impact) * urgency * impact; };
                    break;
                case BaseFormulaType.multiplyAdd:
                    baseFormulaFunc = function (urgency, impact) { return urgency * impact + urgency + impact; };
                    break;
                case BaseFormulaType.add:
                    baseFormulaFunc = function (urgency, impact) { return urgency + impact; };
                    break;
                default:
                    baseFormulaFunc = function (urgency, impact) { return urgency * impact; };
                    break;
            }
            var roundFunc;
            switch (this._rounding) {
                case RoundingType.ceiling:
                    roundFunc = function (value) { return Math.ceil(value); };
                    break;
                case RoundingType.nearest:
                    roundFunc = function (value) { return Math.round(value); };
                    break;
                default:
                    roundFunc = function (value) { return Math.floor(value); };
                    break;
            }
            var maxUrgency = this._urgencyRange - 1;
            var maxImpact = this._impactRange - 1;
            var basicDenominator = baseFormulaFunc(maxUrgency, maxImpact);
            var vipOnlyDenominator = basicDenominator + this._vipWeight;
            var businessRelatedOnlyDenominator = basicDenominator + this._businessRelatedWeight;
            var allOptionsDenominator = basicDenominator + this._vipWeight + this._businessRelatedWeight;
            var priorityMultiplier = this._priorityRange - 1.0;
            this.$scope.calculationResults = [];
            for (var urgency = 0; urgency < this._urgencyRange; urgency++) {
                for (var impact = 0; impact < this._impactRange; impact++) {
                    var baseResult = baseFormulaFunc(maxUrgency - urgency, maxImpact - impact);
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
                    });
                }
            }
            this.$scope.calculationResults.sort(function (a, b) { return (a.urgency + a.impact) - (b.urgency + b.impact); });
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
        onBaseValueChanged(newValue) {
            if (newValue == this._zeroBased)
                return;
            this._zeroBased = newValue;
            this.$scope.calculationResults;
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
        onBusinessRelatedWeightChanged(newValue) {
            if (newValue == this._businessRelatedWeight)
                return;
            this._businessRelatedWeight = newValue;
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
    app.MainController = MainController;
    app.mainModule.controller("MainController", MainController);
})(app || (app = {}));
//# sourceMappingURL=app.js.map