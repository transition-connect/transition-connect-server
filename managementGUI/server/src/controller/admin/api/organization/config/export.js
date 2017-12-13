'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let exportConfig = requireModel('admin/organization/config/export');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaChangeConfigOrg = {
    name: 'changeExportConfigOrg',
    type: 'object',
    additionalProperties: false,
    required: ['organizationId', 'nps'],
    properties: {
        organizationId: {type: 'string', format: 'notEmptyString', maxLength: 70},
        nps: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['platformId', 'org', 'events'],
                properties: {
                    platformId: {type: 'string', format: 'notEmptyString', maxLength: 50},
                    org: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['categories'],
                        properties: {
                            categories: {
                                type: 'array',
                                items: {type: 'string', format: 'notEmptyString', maxLength: 50},
                                minItems: 1,
                                maxItems: 1000,
                                uniqueItems: true
                            }
                        }
                    },
                    events: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['exportActive'],
                        properties: {
                            exportActive: {type: 'boolean'}
                            //Filters are added here
                        }
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
