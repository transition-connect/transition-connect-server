'use strict';

let logger = require('server-lib').logging.getLogger(__filename);
let organizationEvent = requireModel('organization/event/event');
let controllerErrors = require('server-lib').controllerErrors;
let validation = require('server-lib').jsonValidation;
let rateLimit = require('server-lib').limiteRate;


let schemaCrateEvents = {
    name: 'createEvents',
    type: 'object',
    additionalProperties: false,
    required: ['organizationId', 'title', 'description'],
    properties: {
        organizationId: {type: 'string', format: 'id', maxLength: 30},
        title: {type: 'string', format: 'notEmptyString', maxLength: 160},
        description: {type: 'string', format: 'notEmptyString', maxLength: 1000},
    },
};

let schemaEditEvents = {
    name: 'editEvents',
    type: 'object',
    additionalProperties: false,
    required: ['eventId', 'title', 'description'],
    properties: {
        eventId: {type: 'string', format: 'id', maxLength: 30},
        title: {type: 'string', format: 'notEmptyString', maxLength: 160},
        description: {type: 'string', format: 'notEmptyString', maxLength: 1000},
    },
};

let schemaDeleteEvent = {
    name: 'deletePrivacySetting',
    type: 'object',
    additionalProperties: false,
    required: ['eventId'],
    properties: {
        eventId: {type: 'string', format: 'id', maxLength: 30}
    }
};

let apiLimiter = rateLimit.getRate({
    windowMs: 10 * 60 * 1000, // 10 minutes
    delayAfter: 20,
    delayMs: 3 * 1000,
    max: 50
});

module.exports = function (router) {

    router.post('/', apiLimiter, function (req, res) {

        return controllerErrors('Error occurs when creating events', req, res, logger, function () {
            return validation.validateRequest(req, schemaCrateEvents, logger).then(function (request) {
                logger.info(`Create event request`, req);
                return organizationEvent.createEvent(request);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });

    router.put('/', apiLimiter, function (req, res) {

        return controllerErrors('Error occurs when edit events', req, res, logger, function () {
            return validation.validateRequest(req, schemaEditEvents, logger).then(function (request) {
                logger.info(`Edit event request`, req);
                return organizationEvent.editEvent(request);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });

    router.delete('/', apiLimiter, function (req, res) {
        return controllerErrors('Error occurs when deleting an event', req, res, logger, function () {
            return validation.validateRequest(req, schemaDeleteEvent, logger).then(function (request) {
                return organizationEvent.deleteEvent(request.eventId);
            }).then(function () {
                res.status(200).end();
            });
        });
    });
};
