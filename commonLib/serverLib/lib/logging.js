'use strict';

let winston = require('winston');
require('winston-tcp-graylog');

let customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4
    },
    colors: {
        fatal: 'blue',
        error: 'red',
        info: 'green',
        warn: 'yellow',
        debug: 'grey'
    }
};

let logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            colorize: true
        })
    ],
    levels: customLevels.levels,
    colors: customLevels.colors
});

let log = function (module, level, message, metadata, request) {

    if (!metadata) {
        metadata = {};
    }

    if (request && request.headers && request.headers['user-agent']) {
        metadata.browser = request.headers['user-agent'];
    }

    if (request && request.user && request.user.id) {
        metadata.userId = request.user.id;
    }
    if (metadata && metadata.error) {
        metadata.errorMessage = metadata.error.message;
    }
    logger.log(level, '[' + module + '] ' + message, metadata);

};

module.exports = {
    getLogger: function (module) {
        module = module.replace(process.env.BASE_DIR, '');
        return {
            fatal: function (message, request, metadata) {
                log(module, 'fatal', message, metadata, request);
            },
            error: function (message, request, metadata) {
                log(module, 'error', message, metadata, request);
            },
            info: function (message, request, metadata) {
                log(module, 'info', message, metadata, request);
            },
            warn: function (message, request, metadata) {
                log(module, 'warn', message, metadata, request);
            },
            debug: function (message, request, metadata) {
                log(module, 'debug', message, metadata, request);
            }
        };
    },
    config: function (logging) {
        if (logging) {
            logger.add(new winston.transports.TcpGraylog({
                gelfPro: {
                    adapterName: 'tcp',
                    adapterOptions: {
                        host: logging.host,
                        port: logging.port
                    }
                }
            }));
        }
    }
};
