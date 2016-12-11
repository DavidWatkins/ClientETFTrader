/*jslint node: true */
"use strict";
var mongoose = require('mongoose');

// define the schema for our user model
var tradeschema = mongoose.Schema({

    local            : {
        amount        : Number,
        price         : { type: Number, default: -1 },
        orderId       : { type: Number },
        fulfillBy     : { type: Date },
        fulfilledAt     : { type: Date, default: -1 },
        orderType     : {
            type: String,
            enum: ['BUY', "SELL"],
            default: 'SELL'
        },
        status        : {
            type: String,
            enum: ['Unfulfilled', 'Fulfilled', 'Failed']
        }
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Trade', tradeschema);