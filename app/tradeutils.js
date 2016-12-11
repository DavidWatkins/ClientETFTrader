/*jslint node: true */
"use strict";

var _ = require('underscore');
var http = require('http');

var ExchangeRef = require('./models/exchangeref.js');
var Order = require('./models/order.js');
var Trade = require('./models/trade.js');
var Mongoose = require('mongoose');

//assuming fixed trade size
var TRADESIZE = 50;

//8 hour market
//from 12:30am - 8:00am
//also simulates polling and completion of trades
exports.submitOrder = function(req, res, callback) {

    if(req.body === null) {
        res.send("Invalid Query");
        return;
    }

    var request_options = {
        host: '127.0.0.1',
        port: 8080,
        path: '/query?id=1',
        method: 'GET'
    };

    http.request(request_options, function(response) {

        var content = "";

        // Handle data chunks
        response.on('data', function(chunk) {
            content += chunk;
        });

        // Once we're done streaming the response, parse it as json.
        response.on('end', function() {
            var json = JSON.parse(content);
            var marketEnd = new Date();
            marketEnd.setHours(8);
            marketEnd.setMinutes(30);
            marketEnd.setSeconds(0);

            var timestamp = json.timestamp;
            var timestampDate = new Date(timestamp);
            var timeLeft = marketEnd.getTime() - timestampDate.getTime();

            var data = req.body;
            var orderId = new Date().getTime();
            var newOrder = new Order();

            newOrder.local.amount = data.amount;
            newOrder.local.orderId = orderId;
            newOrder.local.status = "Unfulfilled";

            // save the order
            newOrder.save(function(err) {
                if (err)
                    console.log(err);
            });

            var numTrades = data.amount/TRADESIZE;
            var separation = timeLeft/numTrades;

            var tradeArray = [];
            for (var i = 0; i < numTrades; i++) {
                var tradeFulfillBy = timestampDate.getTime() + (i * separation);
                var trade = {
                    local: {
                        amount: TRADESIZE,
                        orderId: orderId,
                        fulfillBy: new Date(tradeFulfillBy),
                        status: "Unfulfilled"
                    }
                };

                tradeArray.push(trade);
            }

            Trade.collection.insert(tradeArray, function(err, docs){
                // tickServer();
            });
        });
        res.send("Success");
    }).end();
};

//for non-realtime simulation
var tickServer = function() {

    var request_options = {
        host: '127.0.0.1',
        port: 8080,
        path: '/query?id=1',
        method: 'GET'
    };

    //get current time from server
    http.request(request_options, function(response) {
        var content = "";

        // Handle data chunks
        response.on('data', function(chunk) {
            content += chunk;
        });

        // Once we're done streaming the response, parse it as json.
        response.on('end', function() {
            var json;
            try {
                json = JSON.parse(content);
            } catch (e) {
                tickServer();
                return;
            }


            var current_time = new Date(json.timestamp);

            Trade.findOne({"local.status": "Unfulfilled"}, function(err, data) {
                if (data) {
                    executeTrades(current_time);
                }
            });
        });
    }).end();
};

var executeTrades = function(current_time) {
    Trade.find({"local.fulfillBy" : { $lt: current_time }, "local.status": "Unfulfilled"}, function(err, data) {

        if (!data.length) {
            tickServer();
        } else {
            var promises = _.map(data, function(x) {

                console.log(x.local.fulfillBy);
                console.log("-------");

                var request_options = {
                    host: '127.0.0.1',
                    port: 8080,
                    path: '/order?id=2&side=sell&qty=50&price=0.0',
                    method: 'GET'
                };

                return http.request(request_options, function(response) {

                    var content = "";

                    // Handle data chunks
                    response.on('data', function(chunk) {
                        content += chunk;
                    });

                    // Once we're done streaming the response, parse it as json.
                    response.on('end', function() {
                        var json = JSON.parse(content);
                        if (json.qty > 0) {
                            Trade.update({_id: new Mongoose.Types.ObjectId(x._id)}, { $set: 
                                {
                                    "local.fulfilledAt": current_time,
                                    "local.price": json.avg_price,
                                    "local.status": "Fulfilled"
                                }
                            }, function() {
                            });
                        }
                    });
                }).end();
            });

            Promise.all(promises).then(tickServer());
        }
    }); 
};

exports.getAllOrders = function (req, res, callback) {
    Order.find(function(err, orders) {
        res.send(orders);
    });
};

exports.dropData = function(req, res, callback) {
    Order.find().remove({}, function(err) {
        if (err)
                console.log(err);
    });
    Trade.find().remove({}, function(err) {
        if (err)
                console.log(err);
    });
    ExchangeRef.find().remove({}, function(err) {
        if (err)
                console.log(err);
    });
    res.send("Success");
};

exports.getAllTrades = function (req, res, callback) {
    Trade.find(function(err, trades) {
        res.send(trades);
    });
};

exports.getTradeWithOrderId = function(req, res, callback) {
    var orderId = req.body.orderId;

    Trade.find().where('orderId').equals(orderId).exec(function(err, data) {
       res.send(data);
    });
};

function zip(arrays) {
    return arrays[0].map(
        function(_,i){
            return arrays.map(
                function(array){
                    return array[i];
                }
            );
        }
    );
}

exports.getTopBidHistory = function(req, res) {

    ExchangeRef.find().sort({'local.timestamp': -1}).exec(function(err, data) {
        data = _.pluck(data, 'local');

        var prices = _.pluck(data, 'top_bid');
        prices = _.pluck(prices, 'price');

        var dates = _.pluck(data, 'timestamp');

        res.send(zip([dates, prices]));
    });

};

//used to test our graph tool
//shouldn't be necessary now
exports.generateRandomShit = function() {

    function err(err) {
        if(err)
            console.log(err);
    }

    ExchangeRef.remove({}, function(err,removed) {

        var timestamp = new Date().getTime();
        var askPrice = 100.00;
        var bidPrice = 100.00;

        for(var i=0;i<500;i++) {
            askPrice += ((Math.random())-0.5);

            var scm = new ExchangeRef();
            scm.local.top_ask = {
                "price": askPrice,
                "size":(Math.floor(Math.random()*100)+1)
            };
            scm.local.timestamp = timestamp - (5 * i * 1000);
            scm.local.top_bid = {
                "price": askPrice - Math.random(),
                "size":(Math.floor(Math.random()*100)+1)
            };
            scm.local.id = null;

            scm.save(err);
        }
    });

};

