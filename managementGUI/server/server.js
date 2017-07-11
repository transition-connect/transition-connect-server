'use strict';

if (!process.env.BASE_DIR) {
    process.env.BASE_DIR = __dirname;
}

global.requireModel = function (name) {
    return require(`${__dirname}/src/model/${name}`);
};

require('server-lib').jsonValidation;
let promise = require('bluebird');

promise.Promise.config({warnings: false, longStackTraces: true, cancellation: true});

let kraken = require('kraken-js');
let emailService = require('./src/model/eMailService/eMail');
let dbConfig = require('server-lib').databaseConfig;
let app = require('express')();
let options = require('./src/lib/spec')(app);
let logger = require('server-lib').logging.getLogger(__filename);
let port = process.env.PORT || 8080;

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    app.enable('trust proxy');
    logger.info('Enabled trust proxy');
}

app.use(kraken(options));

app.listen(port, function (err) {
    if (err) {
        logger.fatal('Server failed to start', {message: err});
    } else {
        logger.info('[' + app.settings.env + '] Listening on http://localhost:' + port);
    }
});

app.on('start', function () {
    dbConfig.connected.then(function () {
        emailService.start();
        logger.info('Server started');
    });
});

app.on('exit', function () {
    requireDb().closeDriver();
});

module.exports = app;


