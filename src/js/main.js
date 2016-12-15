(function () {
  'use strict';

  var mainApp = angular.module("mainApp", ["ngRoute", "bsLoadingOverlay", "ui.bootstrap"])
  .run(function(bsLoadingOverlayService) {
    bsLoadingOverlayService.setGlobalConfig({
      templateUrl: 'loading-overlay-template.html'
    });
  });

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

  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  mainApp.controller('etfTraderController', ['$scope', '$http', '$location', '$interval', '$uibModal', 'OrderService', 'MarketDataService', 'bsLoadingOverlayService',
    function($scope, $http, $location, $interval, $uibModal, OrderService, MarketDataService, bsLoadingOverlayService) {

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

      $scope.currentOrder = null;

      $scope.changeCurrentTrade = function(currentOrder) {
        $scope.currentOrder = currentOrder;
      };

      $scope.getOrderData = function() {
        OrderService.getAllOrders().then(function (orders) {
          $scope.orders = orders.data;
          return OrderService.getAllTrades();
        }).then(function (trades) {
          var orders = $scope.orders;
          console.log($scope.orders);
          trades = trades.data;
          $scope.trades = trades;
          $scope.trades.sort(function(a, b) {
            return new Date(a.local.timestamp) <= new Date(b.local.timestamp);
          });

          if(orders !== undefined && trades !== undefined) {

            for (var orderKey in orders) {
              var order = orders[orderKey];
              order.trades = [];

              var total = 0;
              for (var tradeKey in trades) {
                var trade = trades[tradeKey];
                trade.local.fulfillBy = new Date(trade.local.fulfillBy);

                trade.local.fulfilledAt = new Date(trade.local.fulfilledAt);
                if(trade.local.fulfilledAt.getYear() > 2015)
                  trade.local.fulfilledAt = $.datepicker.formatDate("M d, yy", trade.local.fulfilledAt) + " " + local.getHours() + ":" + pad(local.getMinutes(), 2) + ":" + pad(local.getSeconds(), 2);
                // trade.local.fulfilledAt = trade.local.fulfilledAt.getDate()  + "-" + (trade.local.fulfilledAt.getMonth()+1) + "-" + trade.local.fulfilledAt.getFullYear() +
                //   " " + trade.local.fulfilledAt.getHours() + ":" + trade.local.fulfilledAt.getMinutes();
                else
                  trade.local.fulfilledAt = "Unfulfilled";
                if (trade.local.orderId == order.local.orderId) {
                  order.trades.push(trade);
                }
              }
            }


            $scope.pendingTradeCount = 0;
            $scope.successfulTradeCount = 0;
            $scope.failedTradeCount = 0;

            for(tradeKey in trades) {
              trade = trades[tradeKey];
              if(trade.local.status === "Unfulfilled")
                $scope.pendingTradeCount++;
              else if(trade.local.status === "Fulfilled")
                $scope.successfulTradeCount++;
              else
                $scope.failedTradeCount++;
            }
          }

          $scope.orderData = orders;
        });
      };

      $scope.getOrderData();

      $scope.showOverlay = function() {
        bsLoadingOverlayService.start();
      };

      $scope.hideOverlay = function() {
        bsLoadingOverlayService.stop();
      };

      $scope.canPostTrade = true;

      $scope.submitOrder = function () {
        if($scope.canPostTrade) {
          $scope.showOverlay();
          $scope.canPostTrade = false;
          OrderService.placeOrder($scope.quantityContainer.quantity).then(function(data, err) {
            // console.log($scope.banner);

            if(err) $scope.banner.msg = "Trade was not posted";
            else $scope.banner.msg = "Trade Successfully Posted";

            $scope.banner.bannerSuccess = true;
            $scope.banner.bannerVisible = true;

            $scope.hideOverlay();
            $scope.canPostTrade = true;
          });
        }
      };

      $scope.initializeChart = function(data) {
        // console.log(data);
        //Create the chart
        var start = new Date();
        $('#container').highcharts({
          chart: {
            type: 'spline',
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

          xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
          },
          title: {
            text: 'Date'
          }
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
            data: data.data.slice(Math.max(data.data.length-20, 0)),
            tooltip: {
              valueDecimals: 1,
              valueSuffix: '$'
            }
          }]

        });
      };

      $http.get('/getETFBidHistory').then($scope.initializeChart);

      function updateChart() {
        $scope.getOrderData();
        $http.get('/getETFBidHistory').then(function(data) {
          // console.log(data.data);
          // $scope.chart.series[0].setData(data.data,true);
          $scope.initializeChart(data);
        });
      }

      $interval(updateChart, 10000);
      $scope.$on('$routeChangeStart', updateChart);

      $scope.openModal = function () {
        var modalInstance = $uibModal.open({
          // animation: $ctrl.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'submitTradeModal.html',
          controller: 'ModalInstanceCtrl',
          controllerAs: '$ctrl',
          scope: $scope,
          resolve: {}
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          // $log.info('Modal dismissed at: ' + new Date());
        });
      };
    }
    ]);

mainApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
  var $ctrl = this;

  $ctrl.ok = function () {
    console.log('ok');
    $scope.submitOrder();
    $uibModalInstance.close();
  };

  $ctrl.cancel = function () {
    console.log('cancel');
    $uibModalInstance.dismiss('cancel');
  };
});

  // Please note that the close and dismiss bindings are from $uibModalInstance.
  mainApp.component('modalComponent', {
    templateUrl: 'submitTradeModal.html',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
    controller: function () {
      var $ctrl = this;

      $ctrl.$onInit = function () {};

      $ctrl.ok = function () {
        console.log('ok');
        $ctrl.close({$value: 'ok'});
      };

      $ctrl.cancel = function () {
        console.log('cancel');
        $ctrl.dismiss({$value: 'cancel'});
      };
    }
  });
})();