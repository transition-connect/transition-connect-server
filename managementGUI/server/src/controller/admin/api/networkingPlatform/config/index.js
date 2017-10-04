'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let config = requireModel('admin/networkingPlatform/config/config');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaGetNpConfig = {
    name: 'getNpConfig',
    type: 'object',
    additionalProperties: false,
    required: ['platformId'],
    properties: {
        platformId: {type: 'string', format: 'notEmptyString', maxLength: 50}
    }
};

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), function (req, res) {
        return controllerErrors(`Error when getting np config`, req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaGetNpConfig, logger).then(function (request) {
                logger.info("Np configuration requested", req);
                return config.getConfig(req.user.id, request.platformId);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
