"use strict";

var Order = require('models/order.js');
var Trade = require('models/trade.js');
var ExchangeRef = require('models/exchangeref.js');

exports.submitTrade = function(req, res, callback) {

    if(req.body == null) {
        res.send("Invalid Query");
        return;
    }

    var data = req.body;

    var collection = db.get('current_trades');

    collection.insert(data, function(err, doc) {//Should be sanitizing our input
        if(err) {
            res.send("There was a problem adding the information to the database");
        } else {
            if (res == null) {
                callback();
            }
            res.send("Success");
        }
    });
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
