'use strict';

let logger = requireLib().logging.getLogger(__filename);
let overview = requireModel('organization/overview');
let controllerErrors = requireLib().controllerErrors;
let validation = requireLib().jsonValidation;
let rateLimit = requireLib().limiteRate;

let schemaGetOrganizationOverview = {
    name: 'getOrganizationOverview',
    type: 'object',
    additionalProperties: false,
    required: ['skip', 'maxItems'],
    properties: {
        skip: {type: 'integer', minimum: 0},
        maxItems: {type: 'integer', minimum: 1, maximum: 50}
    }
};

let apiLimiter = rateLimit.getRate({
    windowMs: 10 * 60 * 1000, // 10 minutes
    delayAfter: 20,
    delayMs: 3 * 1000,
    max: 50
});

module.exports = function (router) {

    router.get('/', apiLimiter, function (req, res) {

        return controllerErrors('Error occurs when getting organisation overview', req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaGetOrganizationOverview, logger).then(function (request) {
                logger.info("User requests organisation overview", req);
                return overview.getOverview(request);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
