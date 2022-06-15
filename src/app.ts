/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/@types/angular/index.d.ts"/>
/// <reference path="../node_modules/@types/bootstrap/index.d.ts"/>
/// <reference path="../node_modules/@types/angular-ui-bootstrap/index.d.ts"/>

namespace itilPriorityCalculator {
     'use strict';

    declare type RangeString = "2" | "3" | "4" | "5" | "6" | "7";
    declare type BoolString = "true" | "false";
    declare type RoundingType = "ceiling" | "floor" | "nearest";
    declare type BaseFormulaType = keyof ICalculatorSets;

    interface ICalculators {
        calculateUrgencyImpactVipBusinessCritical(context: IFullCalculationContext, calculationParameterSet: FullCalculationParameterSet): number;
        calculateUrgencyImpactVip(context: IVipCalculationContext, calculationParameterSet: VipCalculationParameterSet): number;
        calculateUrgencyImpactBusinessCritical(context: IBusinessCriticalCalculationContext, calculationParameterSet: BusinessCriticalCalculationParameterSet): number;
        calculateUrgencyImpact(context: IUrgencyImpactCalculationContext, calculationParameterSet: UrgencyImpactCalculationParameterSet): number;
    }

    interface ICalculatorSets {
        multiply: ICalculators;
        add: ICalculators;
        multiplyAdd: ICalculators;
        addMultiply: ICalculators;
    }

    class UrgencyImpactCalculationParameterSet {
        urgency: number;
        impact: number;
        
        constructor(urgency: number, impact: number) {
            this.urgency = urgency;
            this.impact = impact;
        }

        static getParameterSets(baseValue: number, urgencyRange: number, impactRange: number): UrgencyImpactCalculationParameterSet[] {
            var arr: UrgencyImpactCalculationParameterSet[] = [];
            var urgencyEnd: number = baseValue + urgencyRange;
            var impactEnd: number = baseValue + impactRange;
            for (var i = baseValue; i < impactEnd; i++) {
                for (var u = baseValue; u < urgencyEnd; u++) {
                    arr.push(new UrgencyImpactCalculationParameterSet(u, i));
                }
            }
            return arr;
        }
    }
    
    class VipCalculationParameterSet {
        urgency: number;
        impact: number;
        vip: boolean;
        
        constructor(urgency: number, impact: number, vip: boolean) {
            this.urgency = urgency;
            this.impact = impact;
            this.vip = vip;
        }

        static getParameterSets(baseValue: number, urgencyRange: number, impactRange: number): VipCalculationParameterSet[] {
            var arr: VipCalculationParameterSet[] = [];
            var urgencyEnd: number = baseValue + urgencyRange;
            var impactEnd: number = baseValue + impactRange;
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
        urgency: number;
        impact: number;
        businessCritical: boolean;
        
        constructor(urgency: number, impact: number, businessCritical: boolean) {
            this.urgency = urgency;
            this.impact = impact;
            this.businessCritical = businessCritical;
        }

        static getParameterSets(baseValue: number, urgencyRange: number, impactRange: number): BusinessCriticalCalculationParameterSet[] {
            var arr: BusinessCriticalCalculationParameterSet[] = [];
            var urgencyEnd: number = baseValue + urgencyRange;
            var impactEnd: number = baseValue + impactRange;
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
        urgency: number;
        impact: number;
        vip: boolean;
        businessCritical: boolean;

        constructor(urgency: number, impact: number, vip: boolean, businessCritical: boolean) {
            this.urgency = urgency;
            this.impact = impact;
            this.vip = vip;
            this.businessCritical = businessCritical;
        }

        static getParameterSets(baseValue: number, urgencyRange: number, impactRange: number): FullCalculationParameterSet[] {
            var arr: FullCalculationParameterSet[] = [];
            var urgencyEnd: number = baseValue + urgencyRange;
            var impactEnd: number = baseValue + impactRange;
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
    
    interface IUrgencyImpactCalculationContext {
        baseValue: number;
        urgencyRange: number;
        impactRange: number;
        valueShift: number;
    }
    
    interface IVipCalculationContext extends IUrgencyImpactCalculationContext {
        vipWeight: number;
    }
    
    interface IBusinessCriticalCalculationContext extends IUrgencyImpactCalculationContext {
        businessCriticalWeight: number;
    }

    interface IFullCalculationContext extends IVipCalculationContext, IBusinessCriticalCalculationContext { }
    
    interface IUrgencyImpactCalculationProduct {
        urgency: number;
        impact: number;
        product: number;
    }
    
    interface IVipCalculationProduct extends IUrgencyImpactCalculationProduct {
        vip: boolean;
    }
    
    interface IBusinessCriticalCalculationProduct extends IUrgencyImpactCalculationProduct {
        businessCritical: boolean;
    }

    interface IFullCalculationProduct extends IVipCalculationProduct, IBusinessCriticalCalculationProduct { }

    declare type AnyCalculationProductArray = IFullCalculationProduct[] | IVipCalculationProduct[] | IBusinessCriticalCalculationProduct[] | IUrgencyImpactCalculationProduct[];

    interface ICalculationResultRow {
        urgency: number;
        impact: number;
        values: ("Yes" | "No")[];
        priority: number;
    }
    
    interface IMainControllerScope extends ng.IScope {
        urgencyRange: RangeString;
        impactRange: RangeString;
        priorityRange: RangeString;
        vipOption: boolean;
        businessCriticalOption: boolean;
        baseValue: number;
        valueShift: number;
        rounding: RoundingType;
        vipWeight: number;
        businessCriticalWeight: number;
        baseFormula: BaseFormulaType;
        formulaText: string;
        headings: string[];
        calculationResults: ICalculationResultRow[];
        showRangesModal();
        hideRangesModal();
        showBaseFormulaModal();
        hideBaseFormulaModal();
        showOptionalValues();
        hideOptionalValues();
        showRoundingOptions();
        hideRoundingOptions();
    }

    interface IResultMapContext {
        priorityRange: number;
        minValue: number;
        productRange: number;
        baseValue: number
        round(value: number): number;
    }

    export let mainModule: angular.IModule = angular.module("mainModule", []);

    export class MainController {
        static $inject: Array<string> = ["$scope"];
        constructor(private $scope: IMainControllerScope) {
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
            $scope.$watchGroup(["urgencyRange", "impactRange", "priorityRange", "vipOption", "businessCriticalOption", "baseValue", "valueShift", "rounding", "vipWeight", "businessCriticalWeight", "baseFormula"],
                function(newValue: any, oldValue: any, scope: ng.IScope) {
                    MainController.onCalculationParameterChanged(<IMainControllerScope>scope);
                });
            $scope.showRangesModal = function() {
                $('#rangesModal').modal('show');
            }
            $scope.hideRangesModal = function() {
                $('#rangesModal').modal('hide');
            }
            $scope.showBaseFormulaModal = function() {
                $('#baseFormulaModal').modal('show');
            }
            $scope.hideBaseFormulaModal = function() {
                $('#baseFormulaModal').modal('hide');
            }
            $scope.showOptionalValues = function() {
                $('#optionalValuesModal').modal('show');
            }
            $scope.hideOptionalValues = function() {
                $('#optionalValuesModal').modal('hide');
            }
            $scope.showRoundingOptions = function() {
                $('#roundingOptionsModal').modal('show');
            }
            $scope.hideRoundingOptions = function() {
                $('#roundingOptionsModal').modal('hide');
            }
            MainController.onCalculationParameterChanged($scope);
        }
        
        static calculators: ICalculatorSets = {
            multiply: {
                calculateUrgencyImpactVipBusinessCritical: function(context: IFullCalculationContext, parameterSet: FullCalculationParameterSet): number {
                    
                    var product: number = (context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift) * (context.impactRange - parameterSet.impact + context.baseValue + context.valueShift);
                    if (parameterSet.vip) product += context.vipWeight;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpactVip: function(context: IVipCalculationContext, parameterSet: VipCalculationParameterSet): number {
                    var product: number = (context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift) * (context.impactRange - parameterSet.impact + context.baseValue + context.valueShift);
                    return parameterSet.vip ? product + context.vipWeight : product;
                },
                calculateUrgencyImpactBusinessCritical: function(context: IBusinessCriticalCalculationContext, parameterSet: BusinessCriticalCalculationParameterSet): number {
                    var product: number = (context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift) * (context.impactRange - parameterSet.impact + context.baseValue + context.valueShift);
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpact: function(context: IUrgencyImpactCalculationContext, parameterSet: UrgencyImpactCalculationParameterSet): number {
                    return (context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift) * (context.impactRange - parameterSet.impact + context.baseValue + context.valueShift);
                }
            },
            add: {
                calculateUrgencyImpactVipBusinessCritical: function(context: IFullCalculationContext, parameterSet: FullCalculationParameterSet): number {
                    var product: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift + context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    if (parameterSet.vip) product += context.vipWeight;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpactVip: function(context: IVipCalculationContext, parameterSet: VipCalculationParameterSet): number {
                    var product: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift + context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    return parameterSet.vip ? product + context.vipWeight : product;
                },
                calculateUrgencyImpactBusinessCritical: function(context: IBusinessCriticalCalculationContext, parameterSet: BusinessCriticalCalculationParameterSet): number {
                    var product: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift + context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpact: function(context: IUrgencyImpactCalculationContext, parameterSet: UrgencyImpactCalculationParameterSet): number {
                    return context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift + context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                }
            },
            multiplyAdd: {
                calculateUrgencyImpactVipBusinessCritical(context: IFullCalculationContext, parameterSet: FullCalculationParameterSet): number {
                    var urgency: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                    var impact: number = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    var product: number = (urgency * impact) + urgency + impact;
                    if (parameterSet.vip) product += context.vipWeight;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpactVip(context: IVipCalculationContext, parameterSet: VipCalculationParameterSet): number {
                    var urgency: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                    var impact: number = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    var product: number = (urgency * impact) + urgency + impact;
                    return parameterSet.vip ? product + context.vipWeight : product;
                },
                calculateUrgencyImpactBusinessCritical(context: IBusinessCriticalCalculationContext, parameterSet: BusinessCriticalCalculationParameterSet): number {
                    var urgency: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                    var impact: number = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    var product: number = (urgency * impact) + urgency + impact;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpact(context: IUrgencyImpactCalculationContext, parameterSet: UrgencyImpactCalculationParameterSet): number {
                    var urgency: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                    var impact: number = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    return (urgency * impact) + urgency + impact;
                }
            },
            addMultiply: {
                calculateUrgencyImpactVipBusinessCritical(context: IFullCalculationContext, parameterSet: FullCalculationParameterSet): number {
                    var urgency: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                    var impact: number = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    var product: number = (urgency + impact) * urgency * impact;
                    if (parameterSet.vip) product += context.vipWeight;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpactVip(context: IVipCalculationContext, parameterSet: VipCalculationParameterSet): number {
                    var urgency: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                    var impact: number = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    var product: number = (urgency + impact) * urgency * impact;
                    return parameterSet.vip ? product + context.vipWeight : product;
                },
                calculateUrgencyImpactBusinessCritical(context: IBusinessCriticalCalculationContext, parameterSet: BusinessCriticalCalculationParameterSet): number {
                    var urgency: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                    var impact: number = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    var product: number = (urgency + impact) * urgency * impact;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpact(context: IUrgencyImpactCalculationContext, parameterSet: UrgencyImpactCalculationParameterSet): number {
                    var urgency: number = context.impactRange - parameterSet.urgency + context.baseValue + context.valueShift;
                    var impact: number = context.impactRange - parameterSet.impact + context.baseValue + context.valueShift;
                    return (urgency + impact) * urgency * impact;
                }
            }
        };

        static isUrgencyImpactCalculationProductExcplicit(value: IUrgencyImpactCalculationProduct): value is IVipCalculationProduct {
            return typeof value === 'object' && value !== null && typeof (<IVipCalculationProduct>value).vip !== 'boolean' && typeof (<IBusinessCriticalCalculationProduct>value).businessCritical !== 'boolean';
        }
        
        static isVipCalculationProduct(value: IUrgencyImpactCalculationProduct, explicit?: boolean): value is IVipCalculationProduct {
            return typeof value === 'object' && value !== null && typeof (<IVipCalculationProduct>value).vip === 'boolean' &&
                !(explicit && typeof (<IBusinessCriticalCalculationProduct>value).businessCritical !== 'boolean'); 
        }
        
        static isBusinessCriticalCalculationProduct(value: IUrgencyImpactCalculationProduct, explicit?: boolean): value is IVipCalculationProduct {
            return typeof value === 'object' && value !== null && typeof (<IBusinessCriticalCalculationProduct>value).businessCritical === 'boolean' &&
                !(explicit && typeof (<IVipCalculationProduct>value).vip !== 'boolean'); 
        }
        
        static isFullCalculationProduct(value: IUrgencyImpactCalculationProduct): value is IFullCalculationProduct {
            return typeof value === 'object' && value !== null && typeof (<IVipCalculationProduct>value).vip === 'boolean' && typeof (<IBusinessCriticalCalculationProduct>value).businessCritical === 'boolean'; 
        }
        
        static isUrgencyImpactParameterSet(arr: AnyCalculationProductArray): arr is IUrgencyImpactCalculationProduct[] {
            if (!Array.isArray(arr)) return false;
            for (var i = 0; i < arr.length; i++)
            {
                var e = arr[i];
                if (typeof e === 'object' && e !== null) return MainController.isUrgencyImpactCalculationProductExcplicit(e);
            }
            return true;
        }
    
        static implementsVipParameterSetArray(arr: AnyCalculationProductArray): arr is (IVipCalculationProduct[] | IFullCalculationProduct[]) {
            if (!Array.isArray(arr)) return false;
            for (var i = 0; i < arr.length; i++)
            {
                var e = arr[i];
                if (typeof e === 'object' && e !== null) return MainController.isVipCalculationProduct(e);
            }
            return true;
        }
    
        static isVipParameterSetArray(arr: AnyCalculationProductArray): arr is IVipCalculationProduct[] {
            if (!Array.isArray(arr)) return false;
            for (var i = 0; i < arr.length; i++)
            {
                var e = arr[i];
                if (typeof e === 'object' && e !== null) return MainController.isVipCalculationProduct(e, true);
            }
            return true;
        }
    
        static implementsBusinessCriticalParameterSetArray(arr: AnyCalculationProductArray): arr is (IBusinessCriticalCalculationProduct | IFullCalculationProduct)[] {
            if (!Array.isArray(arr)) return false;
            for (var i = 0; i < arr.length; i++)
            {
                var e = arr[i];
                if (typeof e === 'object' && e !== null) return MainController.isBusinessCriticalCalculationProduct(e, false);
            }
            return true;
        }
    
        static isBusinessCriticalParameterSetArray(arr: AnyCalculationProductArray): arr is IBusinessCriticalCalculationProduct[] {
            if (!Array.isArray(arr)) return false;
            for (var i = 0; i < arr.length; i++)
            {
                var e = arr[i];
                if (typeof e === 'object' && e !== null) return MainController.isBusinessCriticalCalculationProduct(e, true);
            }
            return true;
        }
    
        static isFullCalculationParameterSetArray(arr: AnyCalculationProductArray): arr is IFullCalculationProduct[] {
            if (!Array.isArray(arr)) return false;
            for (var i = 0; i < arr.length; i++)
            {
                var e = arr[i];
                if (typeof e === 'object' && e !== null) return MainController.isFullCalculationProduct(e);
            }
            return true;
        }
    
        static onCalculationParameterChanged(scope: IMainControllerScope): void {
            var baseValue: number = (typeof scope.baseValue === 'number') ? scope.baseValue :  parseFloat('' + scope.baseValue);
            var urgencyRange: number = parseInt(scope.urgencyRange);
            var impactRange: number = parseInt(scope.impactRange);
            var priorityRange: number = parseInt(scope.priorityRange);
            if (typeof baseValue !== 'number' || isNaN(baseValue) || typeof urgencyRange !== 'number' || isNaN(urgencyRange) || urgencyRange < 2 || typeof impactRange !== 'number' || isNaN(impactRange) ||
                impactRange < 2 || typeof priorityRange !== 'number' || isNaN(priorityRange) || priorityRange < 2 || typeof scope.valueShift !== 'number' || isNaN(scope.valueShift)) return;
            var minValue: number;
            var productRange: number;
            var formulaText: string;
            if (scope.vipOption) {
                if (typeof scope.vipWeight !== 'number' || isNaN(scope.vipWeight)) return;
                if (scope.businessCriticalOption) {
                    if (typeof scope.businessCriticalWeight !== 'number' || isNaN(scope.businessCriticalWeight)) return;
                    var fullContext: FullCalculationMapContext = {
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
                    var fullProductResult: IFullCalculationProduct[] = FullCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function(this: FullCalculationMapContext,
                            parameterSet: FullCalculationParameterSet): IFullCalculationProduct {
                        return {
                            urgency: parameterSet.urgency,
                            impact: parameterSet.impact,
                            vip: parameterSet.vip,
                            businessCritical: parameterSet.businessCritical,
                            product: this.calculators.calculateUrgencyImpactVipBusinessCritical(this, parameterSet)
                        };
                    }, fullContext);
                    fullProductResult.sort(function(a: IFullCalculationProduct, b: IFullCalculationProduct): number {
                        var diff: number = b.product - a.product;
                        if (diff != 0 || (diff = a.impact - b.impact) != 0 || (diff = a.urgency - b.urgency) != 0) return diff;
                        if (a.vip) {
                            if (!b.vip) return -1;
                        }
                        else if (b.vip) return 1;
                        if (a.businessCritical) return b.businessCritical ? 0 : -1;
                        return b.businessCritical ? 1 : 0;
                        
                    });
                    productRange = this.calculators[scope.baseFormula].calculateUrgencyImpactVipBusinessCritical(fullContext,
                        { urgency: baseValue, impact: baseValue, vip: false, businessCritical: false }) - minValue;
                    scope.calculationResults = fullProductResult.map(function(this: IResultMapContext, result: IFullCalculationProduct): ICalculationResultRow {
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
                        round: (scope.rounding == "floor") ? function(value: number): number { return Math.floor(value); } :
                            (scope.rounding == "nearest") ? function(value: number): number { return Math.round(value); } :
                            function(value: number): number { return Math.ceil(value); }
                    });
                    scope.headings = ["VIP", "Business Critical"];
                    var allWeight: number = scope.vipWeight + scope.businessCriticalWeight;
                } else {
                    var vipContext: VipCalculationMapContext = {
                        baseValue: baseValue,
                        vipWeight: scope.vipWeight,
                        valueShift: scope.valueShift,
                        impactRange: impactRange,
                        urgencyRange: urgencyRange,
                        calculators: this.calculators[scope.baseFormula],
                        baseFormula: scope.baseFormula
                    };
                    minValue = this.calculators[scope.baseFormula].calculateUrgencyImpactVip(vipContext, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1, vip: false });
                    var vipProductResult: IVipCalculationProduct[] = VipCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function(this: VipCalculationMapContext,
                            parameterSet: VipCalculationParameterSet): IVipCalculationProduct {
                        return {
                            urgency: parameterSet.urgency,
                            impact: parameterSet.impact,
                            vip: parameterSet.vip,
                            product: this.calculators.calculateUrgencyImpactVip(this, parameterSet)
                        };
                    }, vipContext);
                    vipProductResult.sort(function(a: IVipCalculationProduct, b: IVipCalculationProduct): number {
                        var diff: number = b.product - a.product;
                        return (diff != 0 || (diff = a.impact - b.impact) != 0 || (diff = a.urgency - b.urgency) != 0) ? diff : a.urgency ? (b.urgency ? 0 : -1) : b.urgency ? 1 : 0;
                        
                    });
                    productRange = this.calculators[scope.baseFormula].calculateUrgencyImpactVip(vipContext, { urgency: baseValue, impact: baseValue, vip: false }) - minValue;
                    scope.calculationResults = vipProductResult.map(function(this: IResultMapContext, result: IVipCalculationProduct): ICalculationResultRow {
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
                        round: (scope.rounding == "floor") ? function(value: number): number { return Math.floor(value); } :
                            (scope.rounding == "nearest") ? function(value: number): number { return Math.round(value); } :
                            function(value: number): number { return Math.ceil(value); }
                    });
                    scope.headings = ["VIP"];
                }
            } else if (scope.businessCriticalOption) {
                if (typeof scope.businessCriticalWeight !== 'number' || isNaN(scope.businessCriticalWeight)) return;
                var bcContext: BusinessCriticalCalculationMapContext = {
                    baseValue: baseValue,
                    businessCriticalWeight: scope.businessCriticalWeight,
                    valueShift: scope.valueShift,
                    impactRange: impactRange,
                    urgencyRange: urgencyRange,
                    calculators: this.calculators[scope.baseFormula],
                    baseFormula: scope.baseFormula
                };
                minValue = this.calculators[scope.baseFormula].calculateUrgencyImpactBusinessCritical(bcContext, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1, businessCritical: false });
                var bcProductResult: IBusinessCriticalCalculationProduct[] = BusinessCriticalCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function(this: BusinessCriticalCalculationMapContext,
                        parameterSet: BusinessCriticalCalculationParameterSet): IBusinessCriticalCalculationProduct {
                    return {
                        urgency: parameterSet.urgency,
                        impact: parameterSet.impact,
                        businessCritical: parameterSet.businessCritical,
                        product: this.calculators.calculateUrgencyImpactBusinessCritical(this, parameterSet)
                    };
                }, bcContext);
                bcProductResult.sort(function(a: IBusinessCriticalCalculationProduct, b: IBusinessCriticalCalculationProduct): number {
                    var diff: number = b.product - a.product;
                    return (diff != 0 || (diff = a.impact - b.impact) != 0 || (diff = a.urgency - b.urgency) != 0) ? diff : a.businessCritical ? (b.businessCritical ? 0 : -1) : b.businessCritical ? 1 : 0;
                    
                });
                productRange = this.calculators[scope.baseFormula].calculateUrgencyImpactBusinessCritical(bcContext, { urgency: baseValue, impact: baseValue, businessCritical: false }) - minValue;
                scope.calculationResults = bcProductResult.map(function(this: IResultMapContext, result: IBusinessCriticalCalculationProduct): ICalculationResultRow {
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
                    round: (scope.rounding == "floor") ? function(value: number): number { return Math.floor(value); } :
                        (scope.rounding == "nearest") ? function(value: number): number { return Math.round(value); } :
                        function(value: number): number { return Math.ceil(value); }
                });
                scope.headings = ["Business Critical"];
            } else {
                var context: UrgencyImpactCalculationMapContext = {
                    baseValue: baseValue,
                    valueShift: scope.valueShift,
                    impactRange: impactRange,
                    urgencyRange: urgencyRange,
                    calculators: this.calculators[scope.baseFormula],
                    baseFormula: scope.baseFormula
                };
                minValue = this.calculators[scope.baseFormula].calculateUrgencyImpact(context, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1 });
                var productResult: IUrgencyImpactCalculationProduct[] = UrgencyImpactCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function(this: UrgencyImpactCalculationMapContext,
                        parameterSet: UrgencyImpactCalculationParameterSet): IUrgencyImpactCalculationProduct {
                    return {
                        urgency: parameterSet.urgency,
                        impact: parameterSet.impact,
                        product: this.calculators.calculateUrgencyImpact(this, parameterSet)
                    };
                }, context);
                productResult.sort(function(a: IUrgencyImpactCalculationProduct, b: IUrgencyImpactCalculationProduct): number {
                    var diff: number = b.product - a.product;
                    return (diff == 0 && (diff = a.impact - b.impact) == 0) ? a.urgency - b.urgency : diff;
                    
                });
                productRange = this.calculators[scope.baseFormula].calculateUrgencyImpact(context, { urgency: baseValue, impact: baseValue }) - minValue;
                scope.calculationResults = productResult.map(function(this: IResultMapContext, result: IUrgencyImpactCalculationProduct): ICalculationResultRow {
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
                    round: (scope.rounding == "floor") ? function(value: number): number { return Math.floor(value); } :
                        (scope.rounding == "nearest") ? function(value: number): number { return Math.round(value); } :
                        function(value: number): number { return Math.ceil(value); }
                });
                scope.headings = [];
            }
        }
    }
    declare type FullCalculationMapContext = IFullCalculationContext & {
        calculators: ICalculators;
        baseFormula: BaseFormulaType;
    }
    declare type VipCalculationMapContext = IVipCalculationContext & {
        calculators: ICalculators;
        baseFormula: BaseFormulaType;
    }
    declare type BusinessCriticalCalculationMapContext = IBusinessCriticalCalculationContext & {
        calculators: ICalculators;
        baseFormula: BaseFormulaType;
    }
    declare type UrgencyImpactCalculationMapContext = IUrgencyImpactCalculationContext & {
        calculators: ICalculators;
        baseFormula: BaseFormulaType;
    }
    mainModule.controller("MainController", MainController);
}