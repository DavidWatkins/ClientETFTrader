# ClientETFTrader
Allows a client to sell their ETF
[![Build Status](https://travis-ci.org/DavidWatkins/ClientETFTrader.svg?branch=master)](https://travis-ci.org/DavidWatkins/ClientETFTrader)
# Run Instructions
```bash
npm install
bower install
gulp build
node server.js
```
Make sure you have an instance of mongod running as well as server.py from https://github.com/Andrew-Stein/exchange_simulator

# Description
This client application is built to allow a trader to trade their ETF stock on a market. It is specifically designed to work with Andrew Stein's market and therefore should not be used for general purpose trading. It will display current market data, all active trades, and allow a trader to submit their trades. The trading platform uses TWAP to vary the placement of trades within an order to prevent market volatility ruining the value of the ETF. 

# Trello
We maintain a Trello taskboard containing all of our in progress tasks: https://trello.com/b/T21k3cOS

# Why did we do this project
This project was done in collaboration with a team of representatives from JP Morgan as part of our course plan within COMSW4156 at Columbia University. We made this application to learn about proper software design and how to interact with customers to get design specifications. 
