'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let adminConfig = requireModel('admin/networkingPlatform/config/admin');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaChangeAdminNp = {
    name: 'changeAdminConfigNp',
    type: 'object',
    additionalProperties: false,
    required: ['platformId', 'admins'],
    properties: {
        platformId: {type: 'string', format: 'notEmptyString', maxLength: 50},
        admins: {
            type: 'array',
            items: {type: 'string', format: 'notEmptyString', maxLength: 255},
            minItems: 1,
            maxItems: 100,
            uniqueItems: true
        }
    },
};

module.exports = function (router) {

    router.put('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error occurs when adding or removing an admin to an networking platform', req, res, logger, function () {
            return validation.validateRequest(req, schemaChangeAdminNp, logger).then(function (request) {
                logger.info(`Add or remove an admin to an networking platform`, req);
                return adminConfig.changeConfig(req.user.id, request, req);
            }).then(function () {
                res.status(200).end();
            });
        });
    });
};
