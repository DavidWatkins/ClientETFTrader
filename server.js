#!/bin/env node
//ETF Trader Node application
var express = require('express');
var fs      = require('fs');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var http = require('http');

//DB Code
var mongo = require('mongodb');
var monk = require('monk');

// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/etftrader';
var db = monk(connection_string);
var dbfunctions = require("./js/databasefunctions")

var __dirname = 'dist/';

/**
 *  Define the application.
 */

var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = "127.0.0.1";
        self.port      = process.env.PORT || 3002;
    };

    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync(__dirname + 'index.html');
    };

    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.getRoutes = { };
        self.postRoutes = { };

        // self.getRoutes['/'] = function(req, res) {
        //     var db = req.db;

        //     res.setHeader('Content-Type', 'text/html');
        //     res.send( fs.readFileSync(__dirname + 'index.html') );
        // };
        self.getRoutes['/getSubmittedTrades'] = dbfunctions.getSubmittedTrades;

        self.postRoutes['/submitTrade'] = dbfunctions.submitTrade;

        self.postRoutes['/getExchangeTrades'] = function(req, res) {

        };
    };

    self.addStaticDirectories = function() {
        self.app.use('/', express.static(__dirname));
        self.app.use('/index.html*', express.static(__dirname + 'index.html'));

        self.app.use(favicon(__dirname + '/favicon.ico'));

        self.app.use(bodyParser.urlencoded({
            extended: true
        }));
        self.app.use(bodyParser.json());
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.addStaticDirectories();

        // Make our db accessible to our router
        self.app.use(function(req,res,next){
            req.db = db;
            next();
        });

        //  Add handlers for the app (from the routes).
        for (var r in self.getRoutes) {
            self.app.get(r, self.getRoutes[r]);
        }
        for (var r in self.postRoutes) {
            self.app.post(r, self.postRoutes[r]);
        }

    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server.
     */
    self.start = function() {
        self.app.set('port', self.port);
        self.app.set('ip', self.ipaddress);

        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};

/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();