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

//for use with the simulated stock exchange 
//i.e. time does not flow according to system clock
exports.pollSimulation = function() {
	console.log("Polling has started!");

	setInterval(function() {

	}, 5000);
}

//live polling, not useful at the moment, basically legacy code at this point
exports.pollStart = function() {
	console.log("Polling has started!");

 	setInterval(function () {

 		var current_time = new Date();

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
						var json = JSON.parse(content);
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

		var request_options = {
			host: '127.0.0.1',
			port: 8080,
			path: '/query',
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
				var json = JSON.parse(content);
				var snapshot = new ExchangeRef();
				snapshot.local = json;
				snapshot.save(function(err) {
            		if (err)
                		console.log(err);
        		});

			});
		}).end();

	}, 5000);
};
