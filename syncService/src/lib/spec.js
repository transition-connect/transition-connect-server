'use strict';

let db = require('server-lib').databaseConfig;
let eMailQueue = require('server-lib').eMailQueue;
let eMail = require('server-lib').eMail;

module.exports = function () {

    return {
        onconfig: function (config, next) {

            let dbConfig = config.get('databaseConfig'),
                emailConfig = config.get('emailConfig');

            db.config(dbConfig);
            eMailQueue.config(emailConfig);
            eMail.config(emailConfig.smtp);
            next(null, config);
        }
    };

};
