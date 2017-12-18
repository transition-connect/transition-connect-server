'use strict';

let db = require('server-lib').databaseConfig;
let eMailQueue = require('server-lib').eMailQueue;
let eMail = require('server-lib').eMail;
let logger = require('server-lib').logging;
let connectionHandler = requireConnectionHandler('connectionHandler');

module.exports = function () {

    return {
        onconfig: function (config, next) {

            let dbConfig = config.get('databaseConfig'),
                emailConfig = config.get('emailConfig'),
                timerConfig = config.get('timerConfig'),
                loggingConfig = config.get('logging');

            if (process.env.NODE_ENV !== 'testing') {
                setInterval(() => {
                    return connectionHandler.startSync();
                }, timerConfig.interval * 1000);
            }

            db.config(dbConfig);
            eMailQueue.config(emailConfig);
            eMail.config(emailConfig.smtp);
            logger.config(loggingConfig);
            next(null, config);
        }
    };

};
