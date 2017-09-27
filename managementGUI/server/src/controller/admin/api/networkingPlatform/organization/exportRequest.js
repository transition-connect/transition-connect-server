'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let exportRequest = requireModel('admin/networkingPlatform/exportRequest');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaSetExportRequest = {
    name: 'setExportRequest',
    type: 'object',
    additionalProperties: false,
    required: ['platformId', 'organizationId', 'accept'],
    properties: {
        platformId: {type: 'string', format: 'notEmptyString', maxLength: 50},
        organizationId: {type: 'string', format: 'notEmptyString', maxLength: 50},
        accept: {type: 'boolean'}
    }
};

module.exports = function (router) {

    router.put('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error occurs when changing export config of org', req, res, logger, function () {
            return validation.validateRequest(req, schemaSetExportRequest, logger).then(function (request) {
                logger.info(`Change export config of org`, req);
                return exportRequest.setExportRequest(req.user.id, request, req);
            }).then(function () {
                res.status(200).end();
            });
        });
    });
};
