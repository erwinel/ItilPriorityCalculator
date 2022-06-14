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

    interface ICalculationData {
        urgency: number;
        impact: number;
        vip?: boolean;
        businessCritical?: boolean;
    }
    interface ICalculationRow {
        heading: string;
        columns: string[];
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
        vipWeightError?: string;
        businessCriticalWeight: number;
        businessCriticalWeighttError?: string;
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
            var urgencyRange: number = parseInt(scope.urgencyRange);
            var impactRange: number = parseInt(scope.impactRange);
            var priorityRange: number = parseInt(scope.priorityRange);
            var vipOption: boolean = scope.vipOption == "true";
            var businessCriticalOption: boolean = scope.businessCriticalOption == "true";
            var baseValue = (typeof scope.baseValue === 'number') ? scope.baseValue :  parseFloat('' + scope.baseValue);
            var valueShift = (typeof scope.valueShift === 'number') ? scope.valueShift :  parseFloat('' + scope.valueShift);
            var vipWeight = (typeof scope.vipWeight === 'number') ? scope.vipWeight :  parseFloat('' + scope.vipWeight);
            var businessCriticalWeight = (typeof scope.businessCriticalWeight === 'number') ? scope.businessCriticalWeight :  parseFloat('' + scope.businessCriticalWeight);
            if (isNaN(baseValue) || isNaN(valueShift) || isNaN(vipWeight) || isNaN(businessCriticalWeight)) return;
            var calculationData: ICalculationData[];
            var startNumber = baseValue;
            var urgencyEnd = startNumber + urgencyRange;
            var impactEnd = startNumber + impactRange;
            if (vipOption) {
                if (businessCriticalOption) {
                    scope.headings = ['Urgency', 'Impact', 'VIP', 'Business Critical', 'Priority'];
                    for (var u = startNumber; u < urgencyEnd; u++) {
                        for (var i = startNumber; i < impactEnd; i++) {
                            calculationData.push({ urgency: u, impact: i, vip: false, businessCritical: false });
                            calculationData.push({ urgency: u, impact: i, vip: true, businessCritical: false });
                            calculationData.push({ urgency: u, impact: i, vip: false, businessCritical: true });
                            calculationData.push({ urgency: u, impact: i, vip: true, businessCritical: true });
                        }
                    }
                } else {
                    scope.headings = ['Urgency', 'Impact', 'VIP', 'Priority'];
                    for (var u = startNumber; u < urgencyEnd; u++) {
                        for (var i = startNumber; i < impactEnd; i++) {
                            calculationData.push({ urgency: u, impact: i, vip: false });
                            calculationData.push({ urgency: u, impact: i, vip: true });
                        }
                    }
                }
            } else {
                if (businessCriticalOption) {
                    scope.headings = ['Urgency', 'Impact', 'Business Critical', 'Priority'];
                    for (var u = startNumber; u < urgencyEnd; u++) {
                        for (var i = startNumber; i < impactEnd; i++) {
                            calculationData.push({ urgency: u, impact: i, businessCritical: false });
                            calculationData.push({ urgency: u, impact: i, businessCritical: true });
                        }
                    }
                } else {
                    scope.headings = ['Urgency', 'Impact', 'Priority'];
                    for (var u = startNumber; u < urgencyEnd; u++) {
                        for (var i = startNumber; i < impactEnd; i++)
                            calculationData.push({ urgency: u, impact: i });
                    }
                }
            }
            switch (scope.baseFormula) {
                case "add":
                    break;
                case "addMultiply":
                    break;
                case "multiplyAdd":
                    break;
                default:
                    break;
            }
        }
    }

    mainModule.controller("MainController", MainController);
}