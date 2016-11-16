#!/bin/env node
//ETF Trader Node application
var express = require('express');
var favicon = require('serve-favicon');

// set up ======================================================================
// get all the tools we need
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');
var dbfunctions = require("./app/tradeutils");
var tradesubmitter = require("./app/tradesubmitter.js");
var __dirname = 'dist/';

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

var ETFTraderApp = function() {

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
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.app = express();

        // set up our express application
        self.app.use(morgan('dev')); // log every request to the console
        self.app.use(cookieParser()); // read cookies (needed for auth)
        self.app.use(bodyParser()); // get information from html forms

        self.app.set('view engine', 'ejs'); // set up ejs for templating

        // required for passport
        self.app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
        self.app.use(passport.initialize());
        self.app.use(passport.session()); // persistent login sessions
        self.app.use(flash()); // use connect-flash for flash messages stored in session

        self.app.use(favicon(__dirname + '/favicon.ico')); //Favicon

        self.app.use(bodyParser.urlencoded({
            extended: true
        }));
        self.app.use(bodyParser.json());

        // routes ======================================================================
        require('./app/routes.js')(self.app, passport, __dirname); // load our routes and pass in our app and fully configured passport
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
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
        // tradesubmitter.pollStart();
    };

};

/**
 *  main():  Main code.
 */
var zapp = new ETFTraderApp();
zapp.initialize();
zapp.start();