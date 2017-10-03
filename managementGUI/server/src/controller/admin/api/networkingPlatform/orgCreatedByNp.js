'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let orgCreatedByNp = requireModel('admin/networkingPlatform/orgCreatedByNp');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaGetOrgCreatedByNp = {
    name: 'getOrgCreatedByNp',
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
        return controllerErrors(`Error when getting organization created by networking platform`, req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaGetOrgCreatedByNp, logger).then(function (request) {
                logger.info("Organization created by networking platform requested", req);
                return orgCreatedByNp.getOrg(req.user.id, request);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
