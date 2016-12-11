/*jslint node: true */
"use strict";

var mongoose = require('mongoose');

// define the schema for our user model
var exchangerefschema = mongoose.Schema({

    local            : {
        top_ask       : {
            price : Number,
            size  : Number
        },
        timestamp     : { type: Date },
        top_bid       : {
            price : Number,
            size  : Number
        },
        id        : Number
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('ExchangeRef', exchangerefschema);