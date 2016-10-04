"use strict";

var mongo = require('mongodb');
var monk = require('monk');

var connection_string = '127.0.0.1:27017/etftrader';
var db = monk(connection_string);

exports.submitTrade = function(req, res, callback) {

    if(req.body == null) {
        res.send("Invalid Query");
    }

    var data = req.body;

    var collection = db.get('current_trades');

    collection.insert(data, function(err, doc) {//Should be sanitizing our input
        if(err) {
            res.send("There was a problem adding the information to the database");
        } else {
            callback();
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

        callback();
        //SANITIZE
        res.send(docs);
    });
};

