// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var orderschema = mongoose.Schema({

    local            : {
        amount        : Number,
        orderId       : { type: Date },
        timestamp     : { type: Date },
        status        : String
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Trade', orderschema);