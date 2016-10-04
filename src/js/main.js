(function () {
  'use strict';

  var mainApp = angular.module("mainApp", []);

  mainApp.controller('etfTraderController', ['$scope', '$http', function($scope, $http) {

    $scope.trades = [];

    function getTrades() {
      return $http.get('/getSubmittedTrades').then(function(res) {
        var i;

        for (i = 0; i < res.data.length; i++) {
          $scope.trades.push(res.data[i]);
        }
        return res.data;
      })
    }

    getTrades();

    $scope.addTrade = function() {

      var new_trade = {
        "time": Date.now(),
        "quantity": Math.floor(Math.random() * 100 + 100),
        "order": "SELL",
        "cost": Math.random() * 200 + 50
      };

      $scope.trades.push(new_trade);

      $http.post('/submitTrade', new_trade);

      console.log($scope.trades);
    };

  }]);
})();