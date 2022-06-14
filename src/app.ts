/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/@types/angular/index.d.ts"/>
/// <reference path="../node_modules/@types/bootstrap/index.d.ts"/>
/// <reference path="../node_modules/@types/angular-ui-bootstrap/index.d.ts"/>

namespace itilPriorityCalculator {
     'use strict';

    declare type RangeString = "2" | "3" | "4" | "5" | "6" | "7";
    declare type BoolString = "true" | "false";
    declare type RoundingType = "ceiling" | "floor" | "nearest";
    declare type BaseFormulaType = "multiply" | "add" | "multiplyAdd" | "addMultiply";

    interface ICalculationRow {
        heading: string;
        columns: string[];
    }
    
    interface ICalculationData {
        urgency: number;
        impact: number;
        vip?: boolean;
        businessCritical?: boolean;
    }

    interface ICalculationContext {
        minValue: number;
        valueShift: number;
        urgencyRange: number;
        impactRange: number;
        maxProduct: number;
        minProduct: number;
        priorityRange: number;
        rounding: RoundingType;
        vipWeight?: number;
        businessCriticalWeight?: number;
        getProduct(data: ICalculationData): number;
    }

    interface IMainControllerScope extends ng.IScope {
        urgencyRange: RangeString;
        impactRange: RangeString;
        priorityRange: RangeString;
        vipOption: BoolString;
        businessCriticalOption: BoolString;
        baseValue: number;
        baseValueError?: string;
        valueShift: number;
        valueShiftError?: string;
        rounding: RoundingType;
        vipWeight: number;
        businessCriticalWeight: number;
        baseFormula: BaseFormulaType;
        headings: string[];
        rows: ICalculationRow[];
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
                MainController.onWatchGroup)
            MainController.onWatchGroup(undefined, undefined, $scope);
        }
        static onWatchGroup(newValue: any, oldValue: any, scope: IMainControllerScope): void {
            var calculationData: ICalculationData[];
            var context: ICalculationContext = <ICalculationContext>{
                impactRange: parseInt(scope.impactRange),
                minValue: (typeof scope.baseValue === 'number') ? scope.baseValue :  parseFloat('' + scope.baseValue),
                priorityRange: parseInt(scope.priorityRange),
                rounding: scope.rounding,
                urgencyRange: parseInt(scope.urgencyRange),
                valueShift: (typeof scope.valueShift === 'number') ? scope.valueShift :  parseFloat('' + scope.valueShift)
            };
            if (typeof(context.minValue) != "number" || isNaN(context.minValue) || typeof(context.valueShift) != "number" || isNaN(context.valueShift)) return;
            if (scope.vipOption == "true") {
                context.vipWeight = (typeof scope.vipWeight === 'number') ? scope.vipWeight :  parseFloat('' + scope.vipWeight);
                if (typeof(context.vipWeight) != "number" || isNaN(context.vipWeight)) return;
            }
            if (scope.businessCriticalOption == "true") {
                context.businessCriticalWeight = (typeof scope.businessCriticalWeight === 'number') ? scope.businessCriticalWeight :  parseFloat('' + scope.businessCriticalWeight);
                if (typeof(context.businessCriticalWeight) != "number" || isNaN(context.businessCriticalWeight)) return;
            }
            var urgencyEnd = context.minValue + context.urgencyRange;
            var impactEnd = context.minValue + context.impactRange;

            if (typeof context.vipWeight === 'number') {
                if (typeof context.businessCriticalWeight === 'number') {
                    scope.headings = ['Urgency', 'Impact', 'VIP', 'Business Critical', 'Priority'];
                    for (var u = context.minValue; u < urgencyEnd; u++) {
                        for (var i = context.minValue; i < impactEnd; i++) {
                            calculationData.push({ urgency: u, impact: i, vip: false, businessCritical: false });
                            calculationData.push({ urgency: u, impact: i, vip: true, businessCritical: false });
                            calculationData.push({ urgency: u, impact: i, vip: false, businessCritical: true });
                            calculationData.push({ urgency: u, impact: i, vip: true, businessCritical: true });
                        }
                    }
                    switch (scope.baseFormula) {
                        case "add":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var n = data.impact + this.valueShift + data.urgency + this.valueShift;
                                if (data.vip) n += this.vipWeight + this.valueShift;
                                return data.businessCritical ? n + this.businessCriticalWeight + this.valueShift : n;
                            };
                            break;
                        case "addMultiply":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var i = data.impact + this.valueShift;
                                var u = data.urgency + this.valueShift;
                                var n = (i + u) * i * u;
                                if (data.vip) n += this.vipWeight + this.valueShift;
                                return data.businessCritical ? n + this.businessCriticalWeight + this.valueShift : n;
                            };
                            break;
                        case "multiplyAdd":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var i = data.impact + this.valueShift;
                                var u = data.urgency + this.valueShift;
                                var n = (i * u) + i + u;
                                if (data.vip) n += this.vipWeight + this.valueShift;
                                return data.businessCritical ? n + this.businessCriticalWeight + this.valueShift : n;
                            };
                            break;
                        default:
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var n = (data.impact + this.valueShift) * (data.urgency + this.valueShift);
                                if (data.vip) n += this.vipWeight + this.valueShift;
                                return data.businessCritical ? n + this.businessCriticalWeight + this.valueShift : n;
                            };
                            break;
                    }
                    context.minProduct = context.getProduct({ impact: context.minValue, urgency: context.minValue, businessCritical: false, vip: false })
                    context.maxProduct = context.getProduct({ impact: context.minValue + context.impactRange - 1, urgency: context.minValue + context.urgencyRange - 1,
                        businessCritical: true, vip: true });
                } else {
                    scope.headings = ['Urgency', 'Impact', 'VIP', 'Priority'];
                    for (var u = context.minValue; u < urgencyEnd; u++) {
                        for (var i = context.minValue; i < impactEnd; i++) {
                            calculationData.push({ urgency: u, impact: i, vip: false });
                            calculationData.push({ urgency: u, impact: i, vip: true });
                        }
                    }
                    switch (scope.baseFormula) {
                        case "add":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var n = data.impact + this.valueShift + data.urgency + this.valueShift;
                                return data.vip ? n + this.vipWeight + this.valueShift : n;
                            };
                            break;
                        case "addMultiply":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var i = data.impact + this.valueShift;
                                var u = data.urgency + this.valueShift;
                                var n = (i + u) * i * u;
                                return data.vip ? n + this.vipWeight + this.valueShift : n;
                            };
                            break;
                        case "multiplyAdd":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var i = data.impact + this.valueShift;
                                var u = data.urgency + this.valueShift;
                                var n = (i * u) + i + u;
                                return data.vip ? n + this.vipWeight + this.valueShift : n;
                            };
                            break;
                        default:
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var n = (data.impact + this.valueShift) * (data.urgency + this.valueShift);
                                return data.vip ? n + this.vipWeight + this.valueShift : n;
                            };
                            break;
                    }
                    context.minProduct = context.getProduct({ impact: context.minValue, urgency: context.minValue, vip: false })
                    context.maxProduct = context.getProduct({ impact: context.minValue + context.impactRange - 1, urgency: context.minValue + context.urgencyRange - 1,
                        vip: true });
                }
            } else {
                if (typeof context.businessCriticalWeight === 'number') {
                    scope.headings = ['Urgency', 'Impact', 'Business Critical', 'Priority'];
                    for (var u = context.minValue; u < urgencyEnd; u++) {
                        for (var i = context.minValue; i < impactEnd; i++) {
                            calculationData.push({ urgency: u, impact: i, businessCritical: false });
                            calculationData.push({ urgency: u, impact: i, businessCritical: true });
                        }
                    }
                    switch (scope.baseFormula) {
                        case "add":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var n = data.impact + this.valueShift + data.urgency + this.valueShift;
                                return data.businessCritical ? n + this.businessCriticalWeight + this.valueShift : n;
                            };
                            break;
                        case "addMultiply":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var i = data.impact + this.valueShift;
                                var u = data.urgency + this.valueShift;
                                var n = (i + u) * i * u;
                                return data.businessCritical ? n + this.businessCriticalWeight + this.valueShift : n;
                            };
                            break;
                        case "multiplyAdd":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var i = data.impact + this.valueShift;
                                var u = data.urgency + this.valueShift;
                                var n = (i * u) + i + u;
                                return data.businessCritical ? n + this.businessCriticalWeight + this.valueShift : n;
                            };
                            break;
                        default:
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var n = (data.impact + this.valueShift) * (data.urgency + this.valueShift);
                                return data.businessCritical ? n + this.businessCriticalWeight + this.valueShift : n;
                            };
                            break;
                    }
                    context.minProduct = context.getProduct({ impact: context.minValue, urgency: context.minValue, businessCritical: false })
                    context.maxProduct = context.getProduct({ impact: context.minValue + context.impactRange - 1, urgency: context.minValue + context.urgencyRange - 1,
                        businessCritical: true })
                } else {
                    scope.headings = ['Urgency', 'Impact', 'Priority'];
                    for (var u = context.minValue; u < urgencyEnd; u++) {
                        for (var i = context.minValue; i < impactEnd; i++)
                            calculationData.push({ urgency: u, impact: i });
                    }
                    switch (scope.baseFormula) {
                        case "add":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                return data.impact + this.valueShift + data.urgency + this.valueShift;
                            };
                            break;
                        case "addMultiply":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var i = data.impact + this.valueShift;
                                var u = data.urgency + this.valueShift;
                                return (i + u) * i * u;
                            };
                            break;
                        case "multiplyAdd":
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                var i = data.impact + this.valueShift;
                                var u = data.urgency + this.valueShift;
                                return (i * u) + i + u;
                            };
                            break;
                        default:
                            context.getProduct = function(this: ICalculationContext, data: ICalculationData): number {
                                return (data.impact + this.valueShift) * (data.urgency + this.valueShift);
                            };
                            break;
                    }
                    context.minProduct = context.getProduct({ impact: context.minValue, urgency: context.minValue })
                    context.maxProduct = context.getProduct({ impact: context.minValue + context.impactRange - 1, urgency: context.minValue + context.urgencyRange - 1 })
                }
            }
        }
    }

    mainModule.controller("MainController", MainController);
}