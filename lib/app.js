var itilPriorityCalculator;
(function (itilPriorityCalculator) {
    'use strict';
    itilPriorityCalculator.mainModule = angular.module("mainModule", []);
    class MainController {
        constructor($scope) {
            this.$scope = $scope;
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
            $scope.baseFormula = "add";
        }
    }
    MainController.$inject = ["$scope"];
    itilPriorityCalculator.MainController = MainController;
    itilPriorityCalculator.mainModule.controller("MainController", MainController);
})(itilPriorityCalculator || (itilPriorityCalculator = {}));
//# sourceMappingURL=app.js.map