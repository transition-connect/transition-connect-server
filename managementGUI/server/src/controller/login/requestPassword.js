'use strict';

let logger = requireLib().logging.getLogger(__filename);
let requestPassword = requireModel('login/requestPassword');
let controllerErrors = requireLib().controllerErrors;
let validation = requireLib().jsonValidation;
let rateLimit = requireLib().limiteRate;

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
    windowMs: 10 * 60 * 1000, // 10 minutes
    delayAfter: 20,
    delayMs: 3 * 1000,
    max: 50
});

module.exports = function (router) {

    router.post('/', apiLimiter, function (req, res) {

        return controllerErrors('Error occurs when sending a password request', req, res, logger, function () {
            return validation.validateRequest(req, schemaRequestPassword, logger).then(function (request) {
                logger.info(`Request password for ${request.email}`, req);
                return requestPassword.sendPassword(request.email);
            }).then(function () {
                res.status(200).end();
            });
        });
    });

};
