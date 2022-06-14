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

    interface ICalculatorsOld {
        calculateUrgencyImpactVipBusinessCritical(context: IFullCalculationContext, calculationParameterSets: FullCalculationParameterSet[]): IFullCalculationProduct[];
        calculateUrgencyImpactVip(context: IVipCalculationContext, calculationParameterSets: VipCalculationParameterSet[]): IVipCalculationProduct[];
        calculateUrgencyImpactBusinessCritical(context: IBusinessCriticalCalculationContext, calculationParameterSets: BusinessCriticalCalculationParameterSet[]): IBusinessCriticalCalculationProduct[];
        calculateUrgencyImpact(context: IUrgencyImpactCalculationContext, calculationParameterSets: UrgencyImpactCalculationParameterSet[]): IUrgencyImpactCalculationProduct[];
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
        values: number[];
        priority: number;
    }
    
    interface IMainControllerScope extends ng.IScope {
        urgencyRange: RangeString;
        impactRange: RangeString;
        priorityRange: RangeString;
        vipOption: BoolString;
        businessCriticalOption: BoolString;
        baseValue: number;
        valueShift: number;
        rounding: RoundingType;
        vipWeight: number;
        businessCriticalWeight: number;
        baseFormula: BaseFormulaType;
        headings: string[];
        calculationResults: ICalculationResultRow[];
    }

    export let mainModule: angular.IModule = angular.module("mainModule", []);

    export class MainController {
        static $inject: Array<string> = ["$scope"];
        constructor(private $scope: IMainControllerScope) {
            $scope.urgencyRange = "3";
            $scope.impactRange = "3";
            $scope.priorityRange = "5";
            $scope.vipOption = "false";
            $scope.businessCriticalOption = "false";
            $scope.baseValue = 1;
            $scope.valueShift = 3;
            $scope.rounding = "ceiling";
            $scope.vipWeight = 1.5;
            $scope.businessCriticalWeight = 0.5;
            $scope.baseFormula = "multiply";
            $scope.$watchGroup(["urgencyRange", "impactRange", "priorityRange", "vipOption", "businessCriticalOption", "baseValue", "valueShift", "rounding", "vipWeight", "businessCriticalWeight", "baseFormula"],
                function(newValue: any, oldValue: any, scope: ng.IScope) {
                    MainController.onCalculationParameterChanged(undefined, undefined, <IMainControllerScope>scope);
                })
            
        }
        
        static calculators: ICalculatorSets = {
            multiply: {
                calculateUrgencyImpactVipBusinessCritical: function(context: IFullCalculationContext, parameterSet: FullCalculationParameterSet): number {
                    var product: number = (parameterSet.urgency + context.valueShift) * (parameterSet.impact + context.valueShift);
                    if (parameterSet.vip) product += context.vipWeight;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpactVip: function(context: IVipCalculationContext, parameterSet: VipCalculationParameterSet): number {
                    var product: number = (parameterSet.urgency + context.valueShift) * (parameterSet.impact + context.valueShift);
                    return parameterSet.vip ? product + context.vipWeight : product;
                },
                calculateUrgencyImpactBusinessCritical: function(context: IBusinessCriticalCalculationContext, parameterSet: BusinessCriticalCalculationParameterSet): number {
                    var product: number = (parameterSet.urgency + context.valueShift) * (parameterSet.impact + context.valueShift);
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpact: function(context: IUrgencyImpactCalculationContext, parameterSet: UrgencyImpactCalculationParameterSet): number {
                    return (parameterSet.urgency + context.valueShift) * (parameterSet.impact + context.valueShift);
                }
            },
            add: {
                calculateUrgencyImpactVipBusinessCritical: function(context: IFullCalculationContext, parameterSet: FullCalculationParameterSet): number {
                    var product: number = parameterSet.urgency + context.valueShift + parameterSet.impact + context.valueShift;
                    if (parameterSet.vip) product += context.vipWeight;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpactVip: function(context: IVipCalculationContext, parameterSet: VipCalculationParameterSet): number {
                    var product: number = parameterSet.urgency + context.valueShift + parameterSet.impact + context.valueShift;
                    return parameterSet.vip ? product + context.vipWeight : product;
                },
                calculateUrgencyImpactBusinessCritical: function(context: IBusinessCriticalCalculationContext, parameterSet: BusinessCriticalCalculationParameterSet): number {
                    var product: number = parameterSet.urgency + context.valueShift + parameterSet.impact + context.valueShift;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpact: function(context: IUrgencyImpactCalculationContext, parameterSet: UrgencyImpactCalculationParameterSet): number {
                    return parameterSet.urgency + context.valueShift + parameterSet.impact + context.valueShift;
                }
            },
            multiplyAdd: {
                calculateUrgencyImpactVipBusinessCritical(context: IFullCalculationContext, parameterSet: FullCalculationParameterSet): number {
                    var urgency: number = parameterSet.urgency + context.valueShift;
                    var impact: number = parameterSet.impact + context.valueShift;
                    var product: number = (urgency * impact) + urgency + impact;
                    if (parameterSet.vip) product += context.vipWeight;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpactVip(context: IVipCalculationContext, parameterSet: VipCalculationParameterSet): number {
                    var urgency: number = parameterSet.urgency + context.valueShift;
                    var impact: number = parameterSet.impact + context.valueShift;
                    var product: number = (urgency * impact) + urgency + impact;
                    return parameterSet.vip ? product + context.vipWeight : product;
                },
                calculateUrgencyImpactBusinessCritical(context: IBusinessCriticalCalculationContext, parameterSet: BusinessCriticalCalculationParameterSet): number {
                    var urgency: number = parameterSet.urgency + context.valueShift;
                    var impact: number = parameterSet.impact + context.valueShift;
                    var product: number = (urgency * impact) + urgency + impact;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpact(context: IUrgencyImpactCalculationContext, parameterSet: UrgencyImpactCalculationParameterSet): number {
                    var urgency: number = parameterSet.urgency + context.valueShift;
                    var impact: number = parameterSet.impact + context.valueShift;
                    return (urgency * impact) + urgency + impact;
                }
            },
            addMultiply: {
                calculateUrgencyImpactVipBusinessCritical(context: IFullCalculationContext, parameterSet: FullCalculationParameterSet): number {
                    var urgency: number = parameterSet.urgency + context.valueShift;
                    var impact: number = parameterSet.impact + context.valueShift;
                    var product: number = (urgency + impact) * urgency * impact;
                    if (parameterSet.vip) product += context.vipWeight;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpactVip(context: IVipCalculationContext, parameterSet: VipCalculationParameterSet): number {
                    var urgency: number = parameterSet.urgency + context.valueShift;
                    var impact: number = parameterSet.impact + context.valueShift;
                    var product: number = (urgency + impact) * urgency * impact;
                    return parameterSet.vip ? product + context.vipWeight : product;
                },
                calculateUrgencyImpactBusinessCritical(context: IBusinessCriticalCalculationContext, parameterSet: BusinessCriticalCalculationParameterSet): number {
                    var urgency: number = parameterSet.urgency + context.valueShift;
                    var impact: number = parameterSet.impact + context.valueShift;
                    var product: number = (urgency + impact) * urgency * impact;
                    return parameterSet.businessCritical ? product + context.businessCriticalWeight : product;
                },
                calculateUrgencyImpact(context: IUrgencyImpactCalculationContext, parameterSet: UrgencyImpactCalculationParameterSet): number {
                    var urgency: number = parameterSet.urgency + context.valueShift;
                    var impact: number = parameterSet.impact + context.valueShift;
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
    
        static onCalculationParameterChanged(newValue: any, oldValue: any, scope: IMainControllerScope): void {
            var baseValue: number = (typeof scope.baseValue === 'number') ? scope.baseValue :  parseFloat('' + scope.baseValue);
            var urgencyRange: number = parseInt(scope.urgencyRange);
            var impactRange: number = parseInt(scope.impactRange);
            if (typeof baseValue !== 'number' || isNaN(baseValue) || typeof urgencyRange !== 'number' || isNaN(urgencyRange) || urgencyRange < 2 || typeof impactRange !== 'number' || isNaN(impactRange) ||
                impactRange < 2 || typeof scope.valueShift !== 'number' || isNaN(scope.valueShift)) return;
            var calculationResults: AnyCalculationProductArray;
            var minValue: number;
            var maxValue: number;
            if (scope.vipOption == "true") {
                if (typeof scope.vipWeight !== 'number' || isNaN(scope.vipWeight)) return;
                if (scope.businessCriticalOption == "true") {
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
                    minValue = this.calculators[scope.baseFormula].calculateUrgencyImpactVipBusinessCritical(fullContext, { urgency: baseValue, impact: baseValue + impactRange - 1, vip: false, businessCritical: false });
                    maxValue = this.calculators[scope.baseFormula].calculateUrgencyImpactVipBusinessCritical(fullContext, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1, vip: true, businessCritical: true });
                    calculationResults = FullCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function(this: FullCalculationMapContext, parameterSet: FullCalculationParameterSet): IFullCalculationProduct {
                        return {
                            urgency: parameterSet.urgency,
                            impact: parameterSet.impact,
                            vip: parameterSet.vip,
                            businessCritical: parameterSet.businessCritical,
                            product: this.calculators.calculateUrgencyImpactVipBusinessCritical(this, parameterSet)
                        };
                    }, fullContext);
                    scope.headings = ["VIP", "Business Critical"];
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
                    minValue = this.calculators[scope.baseFormula].calculateUrgencyImpactVip(vipContext, { urgency: baseValue, impact: baseValue + impactRange - 1, vip: false });
                    maxValue = this.calculators[scope.baseFormula].calculateUrgencyImpactVip(vipContext, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1, vip: true });
                    calculationResults = VipCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function(this: VipCalculationMapContext, parameterSet: VipCalculationParameterSet): IVipCalculationProduct {
                        return {
                            urgency: parameterSet.urgency,
                            impact: parameterSet.impact,
                            vip: parameterSet.vip,
                            product: this.calculators.calculateUrgencyImpactVip(this, parameterSet)
                        };
                    }, vipContext);
                    scope.headings = ["VIP"];
                }
            } else if (scope.businessCriticalOption == "true") {
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
                minValue = this.calculators[scope.baseFormula].calculateUrgencyImpactBusinessCritical(bcContext, { urgency: baseValue, impact: baseValue + impactRange - 1, businessCritical: false });
                maxValue = this.calculators[scope.baseFormula].calculateUrgencyImpactBusinessCritical(bcContext, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1, businessCritical: true });
                calculationResults = BusinessCriticalCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function(this: BusinessCriticalCalculationMapContext, parameterSet: BusinessCriticalCalculationParameterSet): IBusinessCriticalCalculationProduct {
                    return {
                        urgency: parameterSet.urgency,
                        impact: parameterSet.impact,
                        businessCritical: parameterSet.businessCritical,
                        product: this.calculators.calculateUrgencyImpactBusinessCritical(this, parameterSet)
                    };
                }, bcContext);
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
                minValue = this.calculators[scope.baseFormula].calculateUrgencyImpact(context, { urgency: baseValue, impact: baseValue + impactRange - 1 });
                maxValue = this.calculators[scope.baseFormula].calculateUrgencyImpact(context, { urgency: baseValue + urgencyRange - 1, impact: baseValue + impactRange - 1 });
                calculationResults = UrgencyImpactCalculationParameterSet.getParameterSets(baseValue, urgencyRange, impactRange).map(function(this: UrgencyImpactCalculationMapContext, parameterSet: UrgencyImpactCalculationParameterSet): IUrgencyImpactCalculationProduct {
                    return {
                        urgency: parameterSet.urgency,
                        impact: parameterSet.impact,
                        product: this.calculators.calculateUrgencyImpact(this, parameterSet)
                    };
                }, context);
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