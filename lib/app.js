"use strict";
var itilPriorityCalculator;
(function (itilPriorityCalculator) {
    'use strict';
    class UrgencyImpactCalculationParameterSet {
        constructor(urgency, impact) {
            this.urgency = urgency;
            this.impact = impact;
        }
        static getParameterSets(baseValue, urgencyRange, impactRange) {
            var arr = [];
            var urgencyEnd = baseValue + urgencyRange;
            var impactEnd = baseValue + impactRange;
            for (var i = baseValue; i < impactEnd; i++) {
                for (var u = baseValue; u < urgencyEnd; u++) {
                    arr.push(new UrgencyImpactCalculationParameterSet(u, i));
                }
            }
            return arr;
        }
    }
    class VipCalculationParameterSet {
        constructor(urgency, impact, vip) {
            this.urgency = urgency;
            this.impact = impact;
            this.vip = vip;
        }
        static getParameterSets(baseValue, urgencyRange, impactRange) {
            var arr = [];
            var urgencyEnd = baseValue + urgencyRange;
            var impactEnd = baseValue + impactRange;
            for (var i = baseValue; i < impactEnd; i++) {
                for (var u = baseValue; u < urgencyEnd; u++) {
                    arr.push(new VipCalculationParameterSet(u, i, false));
                    arr.push(new VipCalculationParameterSet(u, i, true));
                }
            }
            return arr;
        }
    }
    class BusinessCriticalCalculationParameterSet {
        constructor(urgency, impact, businessCritical) {
            this.urgency = urgency;
            this.impact = impact;
            this.businessCritical = businessCritical;
        }
        static getParameterSets(baseValue, urgencyRange, impactRange) {
            var arr = [];
            var urgencyEnd = baseValue + urgencyRange;
            var impactEnd = baseValue + impactRange;
            for (var i = baseValue; i < impactEnd; i++) {
                for (var u = baseValue; u < urgencyEnd; u++) {
                    arr.push(new BusinessCriticalCalculationParameterSet(u, i, false));
                    arr.push(new BusinessCriticalCalculationParameterSet(u, i, true));
                }
            }
            return arr;
        }
    }
    class FullCalculationParameterSet {
        constructor(urgency, impact, vip, businessCritical) {
            this.urgency = urgency;
            this.impact = impact;
            this.vip = vip;
            this.businessCritical = businessCritical;
        }
        static getParameterSets(baseValue, urgencyRange, impactRange) {
            var arr = [];
            var urgencyEnd = baseValue + urgencyRange;
            var impactEnd = baseValue + impactRange;
            for (var i = baseValue; i < impactEnd; i++) {
                for (var u = baseValue; u < urgencyEnd; u++) {
                    arr.push(new FullCalculationParameterSet(u, i, false, false));
                    arr.push(new FullCalculationParameterSet(u, i, false, true));
                    arr.push(new FullCalculationParameterSet(u, i, true, false));
                    arr.push(new FullCalculationParameterSet(u, i, true, true));
                }
            }
            return arr;
        }
    }
    itilPriorityCalculator.mainModule = angular.module("mainModule", []);
    class MainController {
        constructor($scope) {
            this.$scope = $scope;
            $scope.urgencyRange = "3";
            $scope.impactRange = "3";
            $scope.priorityRange = "5";
            $scope.vipOption = false;
            $scope.businessCriticalOption = false;
            $scope.baseValue = 1;
            $scope.valueShift = 3;
            $scope.rounding = "floor";
            $scope.vipWeight = 1.5;
            $scope.businessCriticalWeight = 0.5;
            $scope.baseFormula = "multiply";
            $scope.$watchGroup(["urgencyRange", "impactRange", "priorityRange", "vipOption", "businessCriticalOption", "baseValue", "valueShift", "rounding", "vipWeight", "businessCriticalWeight", "baseFormula"], function (newValue, oldValue, scope) {
                MainController.onCalculationParameterChanged(scope);
            });
            $scope.showRangesModal = function () {
                $('#rangesModal').modal('show');
            };
            $scope.hideRangesModal = function () {
                $('#rangesModal').modal('hide');
            };
            $scope.showBaseFormulaModal = function () {
                $('#baseFormulaModal').modal('show');
            };
            $scope.hideBaseFormulaModal = function () {
                $('#baseFormulaModal').modal('hide');
            };
            $scope.showOptionalValues = function () {
                $('#optionalValuesModal').modal('show');
            };
            $scope.hideOptionalValues = function () {
                $('#optionalValuesModal').modal('hide');
            };
            $scope.showRoundingOptions = function () {
                $('#roundingOptionsModal').modal('show');
            };
            $scope.hideRoundingOptions = function () {
                $('#roundingOptionsModal').modal('hide');
            };
            MainController.onCalculationParameterChanged($scope);
        }
        static isUrgencyImpactCalculationProductExcplicit(value) {
            return typeof value === 'object' && value !== null && typeof value.vip !== 'boolean' && typeof value.businessCritical !== 'boolean';
        }
        static isVipCalculationProduct(value, explicit) {
            return typeof value === 'object' && value !== null && typeof value.vip === 'boolean' &&
                !(explicit && typeof value.businessCritical !== 'boolean');
        }
        static isBusinessCriticalCalculationProduct(value, explicit) {
            return typeof value === 'object' && value !== null && typeof value.businessCritical === 'boolean' &&
                !(explicit && typeof value.vip !== 'boolean');
        }
        static isFullCalculationProduct(value) {
            return typeof value === 'object' && value !== null && typeof value.vip === 'boolean' && typeof value.businessCritical === 'boolean';
        }
        static isUrgencyImpactParameterSet(arr) {
            if (!Array.isArray(arr))
                return false;
            for (var i = 0; i < arr.length; i++) {
                var e = arr[i];
                if (typeof e === 'object' && e !== null)
                    return MainController.isUrgencyImpactCalculationProductExcplicit(e);
            }
            return true;
        }
        static implementsVipParameterSetArray(arr) {
            if (!Array.isArray(arr))
                return false;
            for (var i = 0; i < arr.length; i++) {
                var e = arr[i];
                if (typeof e === 'object' && e !== null)
                    return MainController.isVipCalculationProduct(e);
            }
            return true;
        }
        static isVipParameterSetArray(arr) {
            if (!Array.isArray(arr))
                return false;
            for (var i = 0; i < arr.length; i++) {
                var e = arr[i];
                if (typeof e === 'object' && e !== null)
                    return MainController.isVipCalculationProduct(e, true);
            }
            return true;
        }
        static implementsBusinessCriticalParameterSetArray(arr) {
            if (!Array.isArray(arr))
                return false;
            for (var i = 0; i < arr.length; i++) {
                var e = arr[i];
                if (typeof e === 'object' && e !== null)
                    return MainController.isBusinessCriticalCalculationProduct(e, false);
            }
            return true;
        }
        static isBusinessCriticalParameterSetArray(arr) {
            if (!Array.isArray(arr))
                return false;
            for (var i = 0; i < arr.length; i++) {
                var e = arr[i];
                if (typeof e === 'object' && e !== null)
                    return MainController.isBusinessCriticalCalculationProduct(e, true);
            }
            return true;
        }
        static isFullCalculationParameterSetArray(arr) {
            if (!Array.isArray(arr))
                return false;
            for (var i = 0; i < arr.length; i++) {
                var e = arr[i];
                if (typeof e === 'object' && e !== null)
                    return MainController.isFullCalculationProduct(e);
            }
            return true;
        }
        static onCalculationParameterChanged(scope) {
            var baseValue = (typeof scope.baseValue === 'number') ? scope.baseValue : parseFloat('' + scope.baseValue);
            var urgencyRange = parseInt(scope.urgencyRange);
            var impactRange = parseInt(scope.impactRange);
            var priorityRange = parseInt(scope.priorityRange);
            if (typeof baseValue !== 'number' || isNaN(baseValue) || typeof urgencyRange !== 'number' || isNaN(urgencyRange) || urgencyRange < 2 || typeof impactRange !== 'number' || isNaN(impactRange) ||
                impactRange < 2 || typeof priorityRange !== 'number' || isNaN(priorityRange) || priorityRange < 2 || typeof scope.valueShift !== 'number' || isNaN(scope.valueShift))
                return;
            var minValue;
            var productRange;
            var formulaText;
            if (scope.vipOption) {
                if (typeof scope.vipWeight !== 'number' || isNaN(scope.vipWeight))
                    return;
                if (scope.businessCriticalOption) {
                    if (typeof scope.businessCriticalWeight !== 'number' || isNaN(scope.businessCriticalWeight))
                        return;
                    var fullContext = {
                        baseValue: baseValue,
                        businessCriticalWeight: scope.businessCriticalWeight,
                        vipWeight: scope.vipWeight,
                        valueShift: scope.valueShift,
                        impactRange: impactRange,
                        urgencyRange: urgencyRange,
                        calculators: this.calculators[scope.baseFormula],
                        baseFormula: scope.baseFormula
                    };
                    minValue = this.calculators[scope.baseFormula].calculateUrgencyImpactVipBusinessCritical(fullContext, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1, vip: true,
                        businessCritical: true });
                    var fullProductResult = FullCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function (parameterSet) {
                        return {
                            urgency: parameterSet.urgency,
                            impact: parameterSet.impact,
                            vip: parameterSet.vip,
                            businessCritical: parameterSet.businessCritical,
                            product: this.calculators.calculateUrgencyImpactVipBusinessCritical(this, parameterSet)
                        };
                    }, fullContext);
                    fullProductResult.sort(function (a, b) {
                        var diff = b.product - a.product;
                        if (diff != 0 || (diff = a.impact - b.impact) != 0 || (diff = a.urgency - b.urgency) != 0)
                            return diff;
                        if (a.vip) {
                            if (!b.vip)
                                return -1;
                        }
                        else if (b.vip)
                            return 1;
                        if (a.businessCritical)
                            return b.businessCritical ? 0 : -1;
                        return b.businessCritical ? 1 : 0;
                    });
                    productRange = this.calculators[scope.baseFormula].calculateUrgencyImpactVipBusinessCritical(fullContext, { urgency: baseValue, impact: baseValue, vip: false, businessCritical: false }) - minValue;
                    scope.calculationResults = fullProductResult.map(function (result) {
                        return {
                            urgency: result.urgency,
                            impact: result.impact,
                            priority: this.round(this.priorityRange - 1 - ((this.priorityRange - 1) * ((result.product - this.minValue) / this.productRange)) + this.baseValue),
                            values: [result.vip ? "Yes" : "No", result.businessCritical ? "Yes" : "No"]
                        };
                    }, {
                        priorityRange: priorityRange,
                        minValue: minValue,
                        productRange: productRange,
                        baseValue: baseValue,
                        round: (scope.rounding == "floor") ? function (value) { return Math.floor(value); } :
                            (scope.rounding == "nearest") ? function (value) { return Math.round(value); } :
                                function (value) { return Math.ceil(value); }
                    });
                    scope.headings = ["VIP", "Business Critical"];
                    var allWeight = scope.vipWeight + scope.businessCriticalWeight;
                }
                else {
                    var vipContext = {
                        baseValue: baseValue,
                        vipWeight: scope.vipWeight,
                        valueShift: scope.valueShift,
                        impactRange: impactRange,
                        urgencyRange: urgencyRange,
                        calculators: this.calculators[scope.baseFormula],
                        baseFormula: scope.baseFormula
                    };
                    minValue = this.calculators[scope.baseFormula].calculateUrgencyImpactVip(vipContext, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1, vip: false });
                    var vipProductResult = VipCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function (parameterSet) {
                        return {
                            urgency: parameterSet.urgency,
                            impact: parameterSet.impact,
                            vip: parameterSet.vip,
                            product: this.calculators.calculateUrgencyImpactVip(this, parameterSet)
                        };
                    }, vipContext);
                    vipProductResult.sort(function (a, b) {
                        var diff = b.product - a.product;
                        return (diff != 0 || (diff = a.impact - b.impact) != 0 || (diff = a.urgency - b.urgency) != 0) ? diff : a.urgency ? (b.urgency ? 0 : -1) : b.urgency ? 1 : 0;
                    });
                    productRange = this.calculators[scope.baseFormula].calculateUrgencyImpactVip(vipContext, { urgency: baseValue, impact: baseValue, vip: false }) - minValue;
                    scope.calculationResults = vipProductResult.map(function (result) {
                        return {
                            urgency: result.urgency,
                            impact: result.impact,
                            priority: this.round(this.priorityRange - 1 - ((this.priorityRange - 1) * ((result.product - this.minValue) / this.productRange)) + this.baseValue),
                            values: [result.vip ? "Yes" : "No"]
                        };
                    }, {
                        priorityRange: priorityRange,
                        minValue: minValue,
                        productRange: productRange,
                        baseValue: baseValue,
                        round: (scope.rounding == "floor") ? function (value) { return Math.floor(value); } :
                            (scope.rounding == "nearest") ? function (value) { return Math.round(value); } :
                                function (value) { return Math.ceil(value); }
                    });
                    scope.headings = ["VIP"];
                }
            }
            else if (scope.businessCriticalOption) {
                if (typeof scope.businessCriticalWeight !== 'number' || isNaN(scope.businessCriticalWeight))
                    return;
                var bcContext = {
                    baseValue: baseValue,
                    businessCriticalWeight: scope.businessCriticalWeight,
                    valueShift: scope.valueShift,
                    impactRange: impactRange,
                    urgencyRange: urgencyRange,
                    calculators: this.calculators[scope.baseFormula],
                    baseFormula: scope.baseFormula
                };
                minValue = this.calculators[scope.baseFormula].calculateUrgencyImpactBusinessCritical(bcContext, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1, businessCritical: false });
                var bcProductResult = BusinessCriticalCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function (parameterSet) {
                    return {
                        urgency: parameterSet.urgency,
                        impact: parameterSet.impact,
                        businessCritical: parameterSet.businessCritical,
                        product: this.calculators.calculateUrgencyImpactBusinessCritical(this, parameterSet)
                    };
                }, bcContext);
                bcProductResult.sort(function (a, b) {
                    var diff = b.product - a.product;
                    return (diff != 0 || (diff = a.impact - b.impact) != 0 || (diff = a.urgency - b.urgency) != 0) ? diff : a.businessCritical ? (b.businessCritical ? 0 : -1) : b.businessCritical ? 1 : 0;
                });
                productRange = this.calculators[scope.baseFormula].calculateUrgencyImpactBusinessCritical(bcContext, { urgency: baseValue, impact: baseValue, businessCritical: false }) - minValue;
                scope.calculationResults = bcProductResult.map(function (result) {
                    return {
                        urgency: result.urgency,
                        impact: result.impact,
                        priority: this.round(this.priorityRange - 1 - ((this.priorityRange - 1) * ((result.product - this.minValue) / this.productRange)) + this.baseValue),
                        values: [result.businessCritical ? "Yes" : "No"]
                    };
                }, {
                    priorityRange: priorityRange,
                    minValue: minValue,
                    productRange: productRange,
                    baseValue: baseValue,
                    round: (scope.rounding == "floor") ? function (value) { return Math.floor(value); } :
                        (scope.rounding == "nearest") ? function (value) { return Math.round(value); } :
                            function (value) { return Math.ceil(value); }
                });
                scope.headings = ["Business Critical"];
            }
            else {
                var context = {
                    baseValue: baseValue,
                    valueShift: scope.valueShift,
                    impactRange: impactRange,
                    urgencyRange: urgencyRange,
                    calculators: this.calculators[scope.baseFormula],
                    baseFormula: scope.baseFormula
                };
                minValue = this.calculators[scope.baseFormula].calculateUrgencyImpact(context, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1 });
                var productResult = UrgencyImpactCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function (parameterSet) {
                    return {
                        urgency: parameterSet.urgency,
                        impact: parameterSet.impact,
                        product: this.calculators.calculateUrgencyImpact(this, parameterSet)
                    };
                }, context);
                productResult.sort(function (a, b) {
                    var diff = b.product - a.product;
                    return (diff == 0 && (diff = a.impact - b.impact) == 0) ? a.urgency - b.urgency : diff;
                });
                productRange = this.calculators[scope.baseFormula].calculateUrgencyImpact(context, { urgency: baseValue, impact: baseValue }) - minValue;
                scope.calculationResults = productResult.map(function (result) {
                    return {
                        urgency: result.urgency,
                        impact: result.impact,
                        priority: this.round(this.priorityRange - 1 - ((this.priorityRange - 1) * ((result.product - this.minValue) / this.productRange)) + this.baseValue),
                        values: []
                    };
                }, {
                    priorityRange: priorityRange,
                    minValue: minValue,
                    productRange: productRange,
                    baseValue: baseValue,
                    round: (scope.rounding == "floor") ? function (value) { return Math.floor(value); } :
                        (scope.rounding == "nearest") ? function (value) { return Math.round(value); } :
                            function (value) { return Math.ceil(value); }
                });
                scope.headings = [];
            }
        }
    }
    MainController.$inject = ["$scope"];
    MainController.calculators = {
        multiply: {
            calculateUrgencyImpactVipBusinessCritical: function (context, parameterSet) {
                var product = (context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift) * (context.impactRange - parameterSet.impact + context.baseValue + context.valueShift);
                if (parameterSet.vip)
                    product += context.vipWeight;
                return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
            },
            calculateUrgencyImpactVip: function (context, parameterSet) {
                var product = (context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift) * (context.impactRange - parameterSet.impact + context.baseValue + context.valueShift);
                return parameterSet.vip ? product + context.vipWeight : product;
            },
            calculateUrgencyImpactBusinessCritical: function (context, parameterSet) {
                var product = (context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift) * (context.impactRange - parameterSet.impact + context.baseValue + context.valueShift);
                return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
            },
            calculateUrgencyImpact: function (context, parameterSet) {
                return (context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift) * (context.impactRange - parameterSet.impact + context.baseValue + context.valueShift);
            }
        },
        add: {
            calculateUrgencyImpactVipBusinessCritical: function (context, parameterSet) {
                var product = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift + context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                if (parameterSet.vip)
                    product += context.vipWeight;
                return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
            },
            calculateUrgencyImpactVip: function (context, parameterSet) {
                var product = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift + context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                return parameterSet.vip ? product + context.vipWeight : product;
            },
            calculateUrgencyImpactBusinessCritical: function (context, parameterSet) {
                var product = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift + context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
            },
            calculateUrgencyImpact: function (context, parameterSet) {
                return context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift + context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
            }
        },
        multiplyAdd: {
            calculateUrgencyImpactVipBusinessCritical(context, parameterSet) {
                var urgency = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                var impact = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                var product = (urgency * impact) + urgency + impact;
                if (parameterSet.vip)
                    product += context.vipWeight;
                return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
            },
            calculateUrgencyImpactVip(context, parameterSet) {
                var urgency = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                var impact = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                var product = (urgency * impact) + urgency + impact;
                return parameterSet.vip ? product + context.vipWeight : product;
            },
            calculateUrgencyImpactBusinessCritical(context, parameterSet) {
                var urgency = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                var impact = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                var product = (urgency * impact) + urgency + impact;
                return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
            },
            calculateUrgencyImpact(context, parameterSet) {
                var urgency = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                var impact = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                return (urgency * impact) + urgency + impact;
            }
        },
        addMultiply: {
            calculateUrgencyImpactVipBusinessCritical(context, parameterSet) {
                var urgency = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                var impact = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                var product = (urgency + impact) * urgency * impact;
                if (parameterSet.vip)
                    product += context.vipWeight;
                return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
            },
            calculateUrgencyImpactVip(context, parameterSet) {
                var urgency = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                var impact = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                var product = (urgency + impact) * urgency * impact;
                return parameterSet.vip ? product + context.vipWeight : product;
            },
            calculateUrgencyImpactBusinessCritical(context, parameterSet) {
                var urgency = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                var impact = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                var product = (urgency + impact) * urgency * impact;
                return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
            },
            calculateUrgencyImpact(context, parameterSet) {
                var urgency = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                var impact = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                return (urgency + impact) * urgency * impact;
            }
        }
    };
    itilPriorityCalculator.MainController = MainController;
    itilPriorityCalculator.mainModule.controller("MainController", MainController);
})(itilPriorityCalculator || (itilPriorityCalculator = {}));
//# sourceMappingURL=app.js.map