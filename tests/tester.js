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

describe("sanity check", function() {
	it("checks if true is equal to true", function() {
		expect(true).toBe(true);
	})
})

//Server Checks

var dbfunctions = require('../js/databasefunctions');

describe("interacts with database", function() {

	it("can send a trade", function(done) {
		var trade = {name: 'lul', body: {
	        "time": Date.now(),
	        "quantity": Math.floor(Math.random() * 100 + 100),
	        "order": "SELL",
	        "cost": Math.random() * 200 + 50
		}}
		dbfunctions.submitTrade(trade, null, function() {
			done();
		});
	})

	it("can receive data", function(done) {
		dbfunctions.getSubmittedTrades(null, null, function() {
			done();
		});
	})
})