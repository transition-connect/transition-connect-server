'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let orgExportedToNp = requireModel('admin/networkingPlatform/orgExportedToNp');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaGetOrgExportedToNp = {
    name: 'getOrgExportedToNp',
    type: 'object',
    additionalProperties: false,
    required: ['platformId', 'skip', 'limit', 'maxTime'],
    properties: {
        platformId: {type: 'string', format: 'notEmptyString', maxLength: 50},
        skip: {type: 'integer'},
        limit: {type: 'integer'},
        maxTime: {type: 'integer'}
    }
};

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), function (req, res) {
        return controllerErrors(`Error when getting organization exported to networking platform`, req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaGetOrgExportedToNp, logger).then(function (request) {
                logger.info("Organization exported to networking platform requested", req);
                return orgExportedToNp.getOrg(req.user.id, request);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
