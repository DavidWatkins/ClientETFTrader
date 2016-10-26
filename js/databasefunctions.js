"use strict";

var mongo = require('mongodb');
var monk = require('monk');
var _ = require('underscore');

var connection_string = '127.0.0.1:27017/etftrader';
var db = monk(connection_string);

exports.submitTrade = function(req, res, callback) {

    if(req.body == null) {
        res.send("Invalid Query");
        return;
    }

    var data = req.body;

    var orderId = new Date().getTime(); 
    var amount = data.amount;
    var collection = db.get('trades');

    for (var i = 0; i < 10; i++) { 
        var trade = {
            orderId: orderId,
            amount: amount/10,
            tradeTime: orderId + (i * 1000 * 60)
        }

        collection.insert(trade, function(err, doc) {
        })
    }
};

exports.getSubmittedTrades = function(req, res, callback) {
    var collection = db.get('current_trades');

    collection.find({},{},function(e,docs){

        if(docs == null) {
            res.send("No data in database!");
            return;
        }

        if (res == null) {
            callback();
        }

        //SANITIZE
        res.send(docs);
    });
};

exports.getTopBidHistory = function(req, res) {
    var collection = db.get('exchangerefs');

    collection.find({}, {sort : { timestamp: -1 }}, function(e, docs) {
        if (docs == null) {
            res.send("No data in database!");
            return;
        }

        var dataset = docs;
        dataset = _.pluck(dataset, 'top_bid');
        dataset = _.pluck(dataset, 'price');

        res.send(dataset);
    })
}

exports.generateRandomShit = function() {
    var collection = db.get('exchangerefs');

    collection.remove({});
    var timestamp = new Date().getTime();

    var askPrice = 100.00;
    var bidPrice = 100.00;

    for(var i=0;i<500;i++) {
        askPrice += ((Math.random())-.5);
        var scm = {
            "top_ask":
            {
                "price": askPrice,
                "size":(Math.floor(Math.random()*100)+1)
            },
            "timestamp": timestamp - (5 * i * 1000) ,
            "top_bid":
            {
                "price": askPrice - Math.random(),
                "size":(Math.floor(Math.random()*100)+1)
            },
            "id": null
        }

        collection.insert(scm, function(err, doc) {
        })
    }
};

