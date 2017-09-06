'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let detail = requireModel('admin/networkingPlatform/detail');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaGetNpDetail = {
    name: 'getNpDetail',
    type: 'object',
    additionalProperties: false,
    required: ['platformId', 'language'],
    properties: {
        platformId: {type: 'string', format: 'id', maxLength: 30},
        language: {enum: ['DE', 'EN', 'FR', 'IT']}
    }
};

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), function (req, res) {
        return controllerErrors(`Error when getting networking platform detail`, req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaGetNpDetail, logger).then(function (request) {
                logger.info("Networking platform details requested", req);
                return detail.getDetails(req.user.id, request.platformId, request.language);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
