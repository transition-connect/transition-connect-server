'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let exportConfig = requireModel('admin/organization/exportConfig');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaChangeConfigOrg = {
    name: 'changeExportConfigOrg',
    type: 'object',
    additionalProperties: false,
    required: ['organizationId', 'nps'],
    properties: {
        organizationId: {type: 'string', format: 'id', maxLength: 30},
        nps: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['platformId', 'categories'],
                properties: {
                    platformId: {type: 'string', format: 'id', maxLength: 30},
                    categories: {
                        type: 'array',
                        items: {type: 'string', format: 'id', maxLength: 30},
                        minItems: 1,
                        maxItems: 1000,
                        uniqueItems: true
                    }
                }
            },
            minItems: 0,
            maxItems: 100,
            uniqueItems: true
        }
    },
};

module.exports = function (router) {

    router.put('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error occurs when changing export config of org', req, res, logger, function () {
            return validation.validateRequest(req, schemaChangeConfigOrg, logger).then(function (request) {
                logger.info(`Change export config of org`, req);
                return exportConfig.changeConfig(req.user.id, request, req);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
