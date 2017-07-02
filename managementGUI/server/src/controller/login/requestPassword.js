'use strict';

let logger = require('server-lib').logging.getLogger(__filename);
let requestPassword = requireModel('login/requestPassword');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let rateLimit = require('server-lib').limiteRate;

let schemaRequestPassword = {
    name: 'passwordRequest',
    type: 'object',
    additionalProperties: false,
    required: ['email'],
    properties: {
        email: {type: 'string', format: 'notEmptyString', maxLength: 255}
    },
};

let apiLimiter = rateLimit.getRate({
    windowMs: 20 * 60 * 1000, // 20 minutes
    delayAfter: 5,
    delayMs: 3 * 1000,
    max: 15
});

module.exports = function (router) {

    router.post('/', apiLimiter, function (req, res) {

        return controllerErrors('Error occurs when sending a password request', req, res, logger, function () {
            return validation.validateRequest(req, schemaRequestPassword, logger).then(function (request) {
                logger.info(`Request password for ${request.email}`, req);
                return requestPassword.sendPassword(request.email, req);
            }).then(function () {
                res.status(200).end();
            });
        });
    });

};
