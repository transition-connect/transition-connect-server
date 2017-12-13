'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let exportWebsiteEventConfig = requireModel('admin/organization/config/exportWebsiteEvent');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaChangeConfigEventWebsite = {
    name: 'changeExportWebsiteEventsConfig',
    type: 'object',
    additionalProperties: false,
    required: ['organizationId','exportActive'],
    properties: {
        organizationId: {type: 'string', format: 'notEmptyString', maxLength: 50},
        exportActive: {type: 'boolean'}
    }
};

module.exports = function (router) {

    router.put('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors(`Error occurs when changing export config of ` +
                                `website events to original networking platform`, req, res, logger, function () {
            return validation.validateRequest(req, schemaChangeConfigEventWebsite, logger).then(function (request) {
                logger.info(`Change export config of website events to original networking platform`, req);
                return exportWebsiteEventConfig.changeConfig(req.user.id, request.organizationId, request.exportActive, req);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
