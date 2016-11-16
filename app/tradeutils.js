"use strict";

var _ = require('underscore');
var http = require('http');

var ExchangeRef = require('./models/exchangeref.js');
var Order = require('./models/order.js');
var Trade = require('./models/trade.js');

var TRADESIZE = 50;

//8 hour market
//from 12:30am - 8:00am
exports.submitOrderSimulation = function(req, res, callback) {

    if(req.body == null) {
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
            var marketEnd = new Date()
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

            // save the user
            newOrder.save(function(err) {
                if (err)
                    console.log(err);
            });

            var numTrades = data.amount/TRADESIZE;
            var separation = timeLeft/numTrades;

            for (var i = 0; i < numTrades; i++) {
                var trade = new Trade();
                trade.local.amount = TRADESIZE;
                trade.local.orderId = orderId;
                trade.local.fulfillBy = timestampDate.getTime() + (i * separation)
                trade.local.status = "Unfulfilled";

                trade.save(function(err) {
                    if (err)
                        console.log(err);
                });
            }
        });
        res.send("Success");
    }).end();
};

exports.submitOrder = function(req, res, callback) {

    if(req.body == null) {
        res.send("Invalid Query");
        return;
    }

    var data = req.body;

    var orderId = new Date().getTime();

    var newOrder = new Order();

    newOrder.local.amount = data.amount;
    newOrder.local.orderId = orderId;
    newOrder.local.status = "Unfulfilled";

    // save the user
    newOrder.save(function(err) {
        if (err)
            console.log(err);
    });

    var numTrades = data.amount/TRADESIZE;

    for (var i = 0; i < numTrades; i++) {
        var trade = new Trade();
        trade.local.amount = TRADESIZE;
        trade.local.orderId = orderId;
        trade.local.fulfillBy = (new Date().getTime()) + (i * 1000 * 60);
        trade.local.status = "Unfulfilled";

        trade.save(function(err) {
            if (err)
                console.log(err);
        });
    }
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

exports.getTopBidHistory = function(req, res) {

    ExchangeRef.find().sort({'local.timestamp': -1}).exec(function(err, data) {
        data = _.pluck(data, 'local');
        data = _.pluck(data, 'top_bid');
        data = _.pluck(data, 'price');
        res.send(data);
    });

};

//used to test our graph tool
//shouldn't be necessary now
exports.generateRandomShit = function() {

    ExchangeRef.remove({}, function(err,removed) {

        var timestamp = new Date().getTime();
        var askPrice = 100.00;
        var bidPrice = 100.00;

        for(var i=0;i<500;i++) {
            askPrice += ((Math.random())-.5);

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

            scm.save(function(err) {
                if (err)
                    console.log(err);
            });
        }
    });

};

