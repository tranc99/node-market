'use strict';

var exchangeData = {}
	, exch = require('./lib/exchange')
	, nocklib = require('./lib/nocklib')
	, timeFloor = 500
	, timeRange = 1000
	, db = require('./lib/db')
	, express = require('express');

function submitRandomOrder() {
	//order
	var ord = nocklib.generateRandomOrder(exchangeData);
	console.log('order', ord);
	if (ord.type == exch.BUY)
		exchangeData = exch.buy(ord.price, ord.volume, exchangeData);
	else
		exchangeData = exch.sell(ord.price, ord.volume, exchangeData);

	db.insertOne('transactions', ord, function(err, order) {
		if(exchangeData.trades && exchangeData.trades.length > 0) {
			var trades = exchangeData.trades.map(function(trade) {
				trade.init = (ord.type == exch.BUY) ? 'b' : 's';
				return trade;
			});
			db.insert('transactions', trades, function(err, trades) {
				pauseThenTrade();
			});
		}
		else pauseThenTrade();
	});

	function pauseThenTrade() {
		var pause = Math.floor(Math.random() * timeRange) + timeFloor;
		setTimeout(submitRandomOrder, pause);
		console.log(exch.getDisplay(exchangeData));
	}
}

var app = express.createServer();
app.get('/', function(req, res) {
	res.send('Hello world');
})

db.open(function() {
	submitRandomOrder();
	//app.listen(3000);
});