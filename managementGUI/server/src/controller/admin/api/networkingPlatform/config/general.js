'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let config = requireModel('admin/networkingPlatform/config/general');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaChangeGeneralConfigNp = {
    name: 'changeGeneralConfigNp',
    type: 'object',
    additionalProperties: false,
    required: ['platformId', 'description', 'link', 'manuallyAcceptOrganization'],
    properties: {
        platformId: {type: 'string', format: 'notEmptyString', maxLength: 50},
        description: {type: 'string', format: 'notEmptyString', maxLength: 700},
        link: {type: 'string', format: 'notEmptyString', maxLength: 1000},
        manuallyAcceptOrganization: {type: 'boolean'}
    },
};

module.exports = function (router) {

    router.put('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error occurs when changing general config of networking platform', req, res, logger, function () {
            return validation.validateRequest(req, schemaChangeGeneralConfigNp, logger).then(function (request) {
                logger.info(`Change general config of networking platform`, req);
                return config.changeConfig(req.user.id, request, req);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
