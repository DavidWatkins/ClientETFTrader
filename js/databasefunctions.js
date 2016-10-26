"use strict";

var mongo = require('mongodb');
var monk = require('monk');

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
