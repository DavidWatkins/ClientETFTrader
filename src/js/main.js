(function () {
  'use strict';

  var mainApp = angular.module("mainApp", ["ngRoute"]);

  mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when("/", {
      templateUrl : "dashboard.html"
    })
    .when("/dashboard", {
      templateUrl : "dashboard.html"
    })
    .when("/pastTrades", {
      templateUrl : "pastTrades.html"
    })
    .otherwise({redirectTo: '#/dashboard'});
  }]); 

  mainApp.factory('OrderService', ['$http', function($http) {
     var OrderService = {};

     OrderService.placeOrder = function(order) {

     };

     OrderService.getOrder = function(id) {

     };

     return OrderService;
   }]);

  mainApp.factory('MarketDataService', ['$http', function($http) {
     var msgs = [];
     return function(msg) {
       msgs.push(msg);
       if (msgs.length === 3) {
         win.alert(msgs.join('\n'));
         msgs = [];
       }
     };
   }]);

  mainApp.controller('etfTraderController', ['$scope', '$http', '$location', function($scope, $http, $location) {

    $scope.trades = [];

    $scope.isActive = function(route) {
        return route === $location.path();
    };

    $scope.price = 0;
    $scope.numberAvailable = 954;
    $scope.quantity = 0;
    $scope.warning = false;

    $scope.getSeperatedTrades = function() {
      var trades = [];
      for (var i = 0; i <= 100; i++) {
        var trade = {
          "time": new Date(),
          "order": "SELL",
          "cost": Math.ceil(Math.random()*50) + 100,
          "status": Math.random() < 0.3 ? "unfulfilled" : Math.random() < 0.3 ? "fulfilled" : "failed",
          "subtrades": [],
          "id": i
        };

        for(var j = 0; j < trade.quantity/10; ++j) {
          trade.subtrades.push({
            "time": new Date(),
            "order": "SELL",
            "cost": trade.cost,
            "status": Math.random() < 0.3 ? "unfulfilled" : Math.random() < 0.3 ? "fulfilled" : "failed"
          });
        }

         trades.push(trade);
      }
      return trades;
    };

    $scope.separatedTrades = $scope.getSeperatedTrades();

    getTrades();

    $scope.addTrade = function() {

      var new_trade = {
        "time": new Date(),
        "order": "SELL",
        "cost": Math.ceil(Math.random()*50) + 100,
        "status": Math.random() < 0.3 ? "unfulfilled" : Math.random() < 0.3 ? "fulfilled" : "failed"
      };

      $scope.trades.push(new_trade);

      // $http.post('/submitTrade', new_trade);

    };

    $scope.initializeChart = function(data) {
      console.log(data);
      //Create the chart
      var start = new Date();
      $('#container').highcharts({
        chart: {
          events: {
            load: function () {
              if (!window.isComparing) {
                this.setTitle(null, {
                  text: 'Built chart in ' + (new Date() - start) + 'ms'
                });
              }
            }
          },
          zoomType: 'x'
        },

        rangeSelector: {

          buttons: [{
            type: 'day',
            count: 3,
            text: '3d'
          }, {
            type: 'week',
            count: 1,
            text: '1w'
          }, {
            type: 'month',
            count: 1,
            text: '1m'
          }, {
            type: 'month',
            count: 6,
            text: '6m'
          }, {
            type: 'year',
            count: 1,
            text: '1y'
          }, {
            type: 'all',
            text: 'All'
          }],
          selected: 3
        },

        yAxis: {
          title: {
            text: 'USD ($)'
          }
        },

        title: {
          text: 'ETF top bids over time'
        },

        subtitle: {
                text: 'Built chart in ...' // dummy text to reserve space for dynamic subtitle
              },

              series: [{
                name: 'USD',
                data: data.data,
                pointStart: data.pointStart,
                pointInterval: data.pointInterval,
                tooltip: {
                  valueDecimals: 1,
                  valueSuffix: '$'
                }
              }]

            });
    };

      // return $http.get('/getSubmittedTrades').then(function(res) {
      //   var i;

      //   for (i = 0; i < res.data.length; i++) {
      //     $scope.trades.push(res.data[i]);
      //   }
      //   return res.data;
      // });

    $http.get('/getETFBidHistory').then($scope.initializeChart);

    $scope.$on('$routeChangeStart', function(event) {
        $http.get('/getETFBidHistory').then($scope.initializeChart);
    });

  }]);
})();