/**
 * Created by David on 10/25/2016.
 */

"use strict";

var _ = require('underscore');
var http = require('http');
var ObjectId = require('mongoose').Types.ObjectId;

var ExchangeRef = require('./models/exchangeref.js');
var Order = require('./models/order.js');
var Trade = require('./models/trade.js');

//live polling
exports.pollStart = function() {
	console.log("Polling has started!");

 	setInterval(function () {

 		var request_options = {
	        host: '127.0.0.1',
	        port: 8080,
	        path: '/query?id=1',
	        method: 'GET'
	    };

	    //get current time from server
	    http.request(request_options, function(response) {
	        var content = "";

	        // Handle data chunks
	        response.on('data', function(chunk) {
	            content += chunk;
	        });

	        // Once we're done streaming the response, parse it as json.
	        response.on('end', function() {
	            try {
	                var json = JSON.parse(content);
	            } catch (e) {
	                return;
	            }

	            var snapshot = new ExchangeRef();
				snapshot.local = json;
				snapshot.save(function(err) {
            		if (err)
                		console.log(err);
        		});

	            var current_time = new Date(json.timestamp);

		        Trade.find({"local.fulfillBy" : { $lt: current_time }, "local.status": "Unfulfilled"}, function(err, data) {

					_.map(data, function(x) {

						console.log(current_time);
						console.log(x.local.fulfillBy);
						console.log("-------")

						var request_options = {
							host: '127.0.0.1',
							port: 8080,
							path: '/order?id=2&side=sell&qty=50&price=0.0',
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
								try {
									var json = JSON.parse(content);
								} catch (e) {
									return;
								}
								if (json.qty > 0) {
									Trade.update({_id: new ObjectId(x._id)}, { $set: 
										{
											"local.fulfilledAt": current_time,
											"local.price": json.avg_price,
											"local.status": "Fulfilled"
										}
									}, function() {
									})
								}

							});
						}).end();
					})
				});
	        });
	    }).end();

	}, 5000);
};
