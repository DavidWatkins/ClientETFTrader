// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var orderschema = mongoose.Schema({

    local : {
        amount        : Number,
        orderId       : { type: Number },
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
module.exports = mongoose.model('Order', orderschema);