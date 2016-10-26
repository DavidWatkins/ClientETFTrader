/**
 * Created by David on 10/25/2016.
 */

"use strict";

var _ = require('underscore');
var http = require('http');

var ExchangeRef = require('./models/exchangeref.js');
var Order = require('./models/order.js');
var Trade = require('./models/trade.js');

exports.pollStart = function() {
	console.log("Polling has started!");

 	setInterval(function () {

 		var current_time = new Date().getTime();

		Trade.find({fulfillBy : { $lt: current_time }, status: "Unfulfilled"}, function(err, data) {

			console.log(data);

			_.map(data, function(x) {

				var request_options = {
					host: '127.0.0.1',
					port: 8080,
					path: '/order?side=sell&qty=50&price=0.0',
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
						console.log(json);
						if (json.qty > 0) {
							Trade.findById(x._id, function (err, trade) {

								trade.fulfilledAt = json.timestamp;
								trade.price = json.avg_price;
								trade.status = 'Fulfilled'
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

		console.log('started snapshoot');
		http.request(request_options, function(response) {

			var content = "";

			// Handle data chunks
			response.on('data', function(chunk) {
				content += chunk;
			});

			// Once we're done streaming the response, parse it as json.
			response.on('end', function() {
				var json = JSON.parse(content);
				console.log(json);
				var snapshot = new ExchangeRef();
				snapshot.local = json;
				snapshot.save(function(err) {
            		if (err)
                		throw err;
                	else
                		console.log('added snapshoot');
        		});

			});
		}).end();

	}, 5000);
}