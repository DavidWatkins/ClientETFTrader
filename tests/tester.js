/*jslint node: true */
/*jslint mocha: true */
"use strict";

// it('should check controller as', function() {
//   var container = element(by.id('ctrl-as-exmpl'));
//     expect(container.element(by.model('settings.name'))
//       .getAttribute('value')).toBe('John Smith');

//   var firstRepeat =
//       container.element(by.repeater('contact in settings.contacts').row(0));
//   var secondRepeat =
//       container.element(by.repeater('contact in settings.contacts').row(1));

//   expect(firstRepeat.element(by.model('contact.value')).getAttribute('value'))
//       .toBe('408 555 1212');

//   expect(secondRepeat.element(by.model('contact.value')).getAttribute('value'))
//       .toBe('john.smith@example.org');

//   firstRepeat.element(by.buttonText('clear')).click();

//   expect(firstRepeat.element(by.model('contact.value')).getAttribute('value'))
//       .toBe('');

//   container.element(by.buttonText('add')).click();

//   expect(container.element(by.repeater('contact in settings.contacts').row(2))
//       .element(by.model('contact.value'))
//       .getAttribute('value'))
//       .toBe('yourname@example.org');
// });

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var mockgoose = require('mockgoose');

var expect = require('expect.js');

describe("sanity check", function() {
	it("checks if true is equal to true", function() {
		expect(true).to.be(true);
	});
});

//Server Checks

var dbfunctions = require('../app/tradeutils');
var Order = require('../app/models/order.js');
var Trade = require('../app/models/trade.js');
var ExchangeRef= require('../app/models/exchangeref.js');

describe("interacts with database", function() {
	beforeEach(function(done) {
        mockgoose(mongoose).then(function() {	
        	mongoose.createConnection('mongodb://localhost/TestingDB',function(err)
        	{ 
        		done(err)
        	});
        });
    });

	it("can send a trade", function(done) {
		var orderId = new Date().getTime();

		var newOrder = new Order();

		newOrder.local.amount = 200;
		newOrder.local.orderId = orderId;
		newOrder.local.status = "Unfulfilled";

		newOrder.save(function(err) {
        if (err)
            console.log(err);
   		});

		var trade = new Trade();
        trade.local.amount = 50;
        trade.local.orderId = 1000;
        trade.local.fulfillBy = (new Date().getTime()) + (1 * 1000 * 60);
        trade.local.status = "Unfulfilled";

		trade.save(function(err,callback) {
            if (err)
                console.log(err);
            callback(err,'added')
   		});
        done();
   	});

	it("can receive data", function(done) {
		Order.find(function(err, orders) {
   		});
		done();
	});
	
	it("can get all trades", function(done)
	{
		Trade.find(function(err, trades) {
        });
		done();
	});

	it("can get trade by order id ", function(done)
	{
		Trade.find().where('orderId').equals(1000).exec(function(err, data) {
        });
	   done();
	});

	it("can get top bid history",function(done)
	{
		ExchangeRef.find().sort({'local.timestamp': -1}).exec(function(err, data) {
        });
		done();
	});

	it("can delete data",function(done) {
		Order.find().remove({}, function(err) {
            if (err)
                console.log(err);
    	});
    	Trade.find().remove({}, function(err) {
            if (err)
                console.log(err);
   	    });
    	ExchangeRef.find().remove({}, function(err) {
            if (err)
                console.log(err);
    	});
    	done();
	})
});