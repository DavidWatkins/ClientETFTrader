/*jslint node: true */
"use strict";

var _ = require('underscore');
var http = require('http');
var ObjectId = require('mongoose').Types.ObjectId;

var ExchangeRef = require('./models/exchangeref.js');
var Order = require('./models/order.js');
var Trade = require('./models/trade.js');

function updateOrderValues(orderId) {
	Order.find({"local.orderId": orderId}, function(err, data) {
		Trade.find({"local.orderId": orderId, "local.status": "Fulfilled"}, function(err, data) {
			if (data.length > 0) {
				var fulfilled = 0;
				var sumPrice = 0;

				_.each(data, function(x) {
					fulfilled += x.local.amount;
					sumPrice += x.local.price;
				});

				var avgPrice = sumPrice / data.length;

				Order.update({"local.orderId": orderId}, { $set: 
					{
						"local.fulfilled": fulfilled,
						"local.averagePrice": avgPrice
					}
				}, function() {});
			}
		});
	});
}

function handleExecutedTrades(x, current_time) {
	return function(response) {
		var content = "";

		// Handle data chunks
		response.on('data', function(chunk) {
			content += chunk;
		});

		// Once we're done streaming the response, parse it as json.
		response.on('end', function() {
			var json;
			try {
				json = JSON.parse(content);
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
					updateOrderValues(x.local.orderId);
				});
			}

		});
	}
}

function getCurrentTimeFromServer(response) {
	var content = "";

    // Handle data chunks
    response.on('data', function(chunk) {
    	content += chunk;
    });

    // Once we're done streaming the response, parse it as json.
    response.on('end', function() {
    	var json;
    	try {
    		json = JSON.parse(content);
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
    	var minPrice = json.top_bid.price - 10;

    	Trade.find({/*"local.fulfillBy" : { $lt: current_time },*/ "local.status": "Unfulfilled"}, function(err, data) {

    		_.map(data, function(x) {

    			console.log(current_time);
    			console.log(x.local.fulfillBy);
    			console.log("-------");

    			var request_options = {
    				host: '127.0.0.1',
    				port: 8080,
    				path: "/order?id=2&side=sell&qty=" + x.local.amount + "&price=" + minPrice,
    				method: 'GET'
    			};
    			http.request(request_options, handleExecutedTrades(x, current_time)).end();
    		});
    	});
    });
}

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

		Order.find({}, function(err, orders) {
			for(var orderKey in orders) {
				var order = orders[orderKey];
				var status;
				if(order.local.amount == order.local.fulfilled) {
					status = "Fulfilled";
				} else {
					status = "Unfulfilled";
				}

				Order.update({"local.orderId": order.local.orderId}, { $set: 
					{
						"local.status": status
					}
				}, function() {});
			}
		});

	    //get current time from server
	    http.request(request_options, getCurrentTimeFromServer)
	    .on('error', function(e) {
	    	console.log("Connection refused from exchange. Is the exchange down?");
	    }).end();

	}, 5000);
};