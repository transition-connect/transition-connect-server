'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let config = requireModel('admin/organization/config');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaGetConfig = {
    name: 'getOrgConfig',
    type: 'object',
    additionalProperties: false,
    required: ['organizationId', 'language'],
    properties: {
        organizationId: {type: 'string', format: 'notEmptyString', maxLength: 50},
        language: {enum: ['DE', 'EN', 'FR', 'IT']}
    }
};

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), function (req, res) {
        return controllerErrors(`Error when getting organization config`, req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaGetConfig, logger).then(function (request) {
                logger.info("Organization configuration requested", req);
                return config.getConfig(req.user.id, request.organizationId, request.language);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
