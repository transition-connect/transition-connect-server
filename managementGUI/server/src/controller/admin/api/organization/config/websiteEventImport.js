'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let importEventConfig = requireModel('admin/organization/config/import');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaSetEventImportUrl = {
    name: 'setEventImportUrl',
    type: 'object',
    additionalProperties: false,
    required: ['organizationId', 'url'],
    properties: {
        organizationId: {type: 'string', format: 'notEmptyString', maxLength: 50},
        url: {type: 'string', maxLength: 1000}
    },
};

module.exports = function (router) {

    router.put('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error occurs when setting event import url', req, res, logger, function () {
            return validation.validateRequest(req, schemaSetEventImportUrl, logger).then(function (request) {
                logger.info(`Set event import url ${request.url}`, req);
                return importEventConfig.saveImportEventUrl(req.user.id, request.organizationId, request.url, req);
            }).then(function () {
                res.status(200).end();
            });
        });
    });
};
