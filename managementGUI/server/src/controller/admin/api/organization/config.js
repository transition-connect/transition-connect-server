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
        organizationId: {type: 'string', format: 'id', maxLength: 30},
        language: {enum: ['DE', 'EN', 'FR', 'IT']}
    }
};

let schemaChangeConfigOrg = {
    name: 'changeConfigOrg',
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

    router.put('/', function (req, res) {

        return controllerErrors('Error occurs when changing config of org', req, res, logger, function () {
            return validation.validateRequest(req, schemaChangeConfigOrg, logger).then(function (request) {
                logger.info(`Change config of org`, req);
                return config.changeConfig(req.user.id, request);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
