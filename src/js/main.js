'use strict';

var mainApp = angular.module("mainApp", []);

mainApp.controller('etfTraderController', ['$scope', function($scope) {
  $scope.trades = [
    {"time": "Now",
      "quantity": 1000,
      "order": "SELL",
      "cost":127.10
     }
  ];

  $scope.addTrade = function() {
    $scope.trades.push({
      "time": "NOW",
      "quantity": Math.floor(Math.random() * 100 + 100),
      "order": "SELL",
      "cost": Math.random() * 200 + 50
    });

    //service.saveTrades($scope.trades);
    //$scope.trades = service.getTrades();
  };
}]);