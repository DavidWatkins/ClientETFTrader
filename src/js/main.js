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

  mainApp.factory('OrderService', ['$http', '$q', function($http, $q) {
    var OrderService = {};

    OrderService.placeOrder = function(amount) {
      return $http.post('/submitOrder', {amount: amount});
    };

    OrderService.getOrder = function(id) {

    };

    OrderService.getAllOrders = function() {
      return $http.get('/getAllOrders').then(function(data){
        return data;
      });
    };

    OrderService.getAllTrades = function () {
      return $http.get('/getAllTrades').then(function(data){
        return data;
      });
    };

    return OrderService;
  }]);

  mainApp.factory('MarketDataService', ['$http', function($http) {
    var MarketDataService = {};

    MarketDataService.getAllMarketData = function () {

    };

    return MarketDataService;
  }]);

  mainApp.controller('etfTraderController', ['$scope', '$http', '$location', 'OrderService', 'MarketDataService', function($scope, $http, $location, OrderService, MarketDataService) {

    $scope.trades = [];

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.quantityContainer = {
      quantity : 0
    };

    $scope.banner = {
      msg: "",
      bannerVisible: true,
      bannerSuccess: false
    };
    $scope.bannerVisible = false;
    $scope.msg = "";

    $scope.getOrderData = function() {
      OrderService.getAllOrders().then(function (orders) {
        $scope.orders = orders.data;
        return OrderService.getAllTrades();
      }).then(function (trades) {
        var orders = $scope.orders;
        trades = trades.data;
        $scope.trades = trades;
        $scope.trades.sort(function(a, b) {
          return a.local.timestamp - b.local.timestamp;
        });

        if(orders !== undefined && trades !== undefined) {

          for (var orderKey in orders) {
            var order = orders[orderKey];
            order.trades = [];
            for (var tradeKey in trades) {
              var trade = trades[tradeKey];
              trade.local.fulfillBy = new Date(trade.local.fulfillBy);

              trade.local.fulfilledAt = new Date(trade.local.fulfilledAt);
              if(trade.local.fulfilledAt.getYear() > 2015)
                trade.local.fulfilledAt = trade.local.fulfilledAt.getDate()  + "-" + (trade.local.fulfilledAt.getMonth()+1) + "-" + trade.local.fulfilledAt.getFullYear() +
                  " " + trade.local.fulfilledAt.getHours() + ":" + trade.local.fulfilledAt.getMinutes();
              else
                trade.local.fulfilledAt = "Unfulfilled";
              if (trade.local.orderId == order.local.orderId) {
                order.trades.push(trade);
              }
            }
          }
        }

        $scope.orderData = orders;
      });
    };

    $scope.getOrderData();

    $scope.submitOrder = function () {
      OrderService.placeOrder($scope.quantityContainer.quantity).then(function(data, err) {
        console.log($scope.banner);

        if(err) $scope.banner.msg = "Not successful";
        else $scope.banner.msg = "Data was successful";

        $scope.banner.bannerSuccess = true;
        $scope.banner.bannerVisible = true;
      });
    };

    $scope.initializeChart = function(data) {
      // console.log(data);
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

    $http.get('/getETFBidHistory').then($scope.initializeChart);

    $scope.$on('$routeChangeStart', function(event) {
      $scope.getOrderData();
      $http.get('/getETFBidHistory').then($scope.initializeChart);
    });

  }]);
})();