"use strict";

var _ = require('underscore');

var ExchangeRef = require('./models/exchangeref.js');
var Order = require('./models/order.js');
var Trade = require('./models/trade.js');

var TRADESIZE = 50;

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
            throw err;
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
                throw err;
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
                throw err;
    });
    Trade.find().remove({}, function(err) {
        if (err)
                throw err;
    });
    ExchangeRef.find().remove({}, function(err) {
        if (err)
                throw err;
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
                    throw err;
            });
        }
    });

};

