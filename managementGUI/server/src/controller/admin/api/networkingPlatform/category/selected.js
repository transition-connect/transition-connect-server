'use strict';

let auth = requireLib('auth');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let category = requireModel('admin/networkingPlatform/category');
let logger = require('server-lib').logging.getLogger(__filename);

let schemaGetSelectedCategories = {
    name: 'getSelectedCategories',
    type: 'object',
    additionalProperties: false,
    required: ['platformId'],
    properties: {
        platformId: {type: 'string', format: 'id', maxLength: 30}
    }
};

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), function (req, res) {
        return controllerErrors('Error when getting selected categories of networking platform', req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaGetSelectedCategories, logger).then(function (request) {
                logger.info("Networking Platform categories requested", req);
                return category.getSelectedCategory(req.user.id, request.platformId);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
