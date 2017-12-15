'use strict';

if (!process.env.BASE_DIR) {
    process.env.BASE_DIR = __dirname;
}

global.requireAdapter = function (name) {
    name = name || '';
    return require(`${__dirname}/src/adapter/${name}`);
};

global.requireConnectionHandler = function (name) {
    name = name || '';
    return require(`${__dirname}/src/connectionHandler/${name}`);
};

global.requireSyncLogic = function (name) {
    name = name || '';
    return require(`${__dirname}/src/syncLogic/${name}`);
};

global.requireLib = function (name) {
    name = name || '';
    return require(`${__dirname}/src/lib/${name}`);
};

let promise = require('bluebird');

promise.Promise.config({warnings: false, longStackTraces: true, cancellation: true});

let kraken = require('kraken-js');
let emailService = require('./src/syncLogic/eMailService/eMail');
let dbConfig = require('server-lib').databaseConfig;
let app = require('express')();
let options = require('./src/lib/spec')(app);
let logger = require('server-lib').logging.getLogger(__filename);
let connectionHandler = requireConnectionHandler('connectionHandler');

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    app.enable('trust proxy');
    logger.info('Enabled trust proxy');
}

app.use(kraken(options));

app.on('start', function () {
    dbConfig.connected.then(function () {
        emailService.start();
        if (process.env.NODE_ENV !== 'testing') {
            connectionHandler.startSync();
        }
        logger.info('Server started');
    });
});

app.on('exit', function () {
    require('server-lib').neo4j.closeDriver();
});

module.exports = app;


