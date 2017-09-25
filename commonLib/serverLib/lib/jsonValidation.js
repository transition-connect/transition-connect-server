'use strict';

let tv4 = require('tv4');
let exceptions = require('./error/exceptions');
let formats = require('tv4-formats');
let _ = require('lodash');
let bluebirdPromise = require('bluebird');

tv4.addFormat(formats);

tv4.addFormat('notEmptyString', function (data) {
    if (typeof data === 'string' && /([^\s])/.test(data)) {
        return null;
    }
    return 'String is not empty';
});

let validate = function (req, data, requestSchema, logger) {
    let errors = tv4.validateMultiple(data, requestSchema),
        invalidJsonException;
    if (errors.valid) {
        return bluebirdPromise.resolve(data);
    }
    invalidJsonException = new exceptions.InvalidJsonRequest('Wrong input data');
    logger.warn(invalidJsonException.message, req, {error: errors}, req);
    return bluebirdPromise.reject(invalidJsonException);
};

let convertValues = function (data, requestSchema) {
    let key;
    for (key in requestSchema.properties) {
        if (requestSchema.properties.hasOwnProperty(key) && requestSchema.properties[key].type && data[key]) {
            if (requestSchema.properties[key].type === 'integer') {
                data[key] = parseInt(data[key], 10);
            } else if (requestSchema.properties[key].type === 'boolean') {
                data[key] = data[key] === 'true';
            } else if (requestSchema.properties[key].type === 'number') {
                data[key] = parseFloat(data[key]);
            } else if (requestSchema.properties[key].type === 'array' && _.isString(data[key])) {
                data[key] = [data[key]];
            }
        }
    }
};

module.exports = {
    validateRequest: function (req, requestSchema, logger) {

        if (req.body.params) {
            req.body = req.body.params;
        }

        return validate(req, req.body, requestSchema, logger);
    },
    validateQueryRequest: function (req, requestSchema, logger) {
        convertValues(req.query, requestSchema);
        return validate(req, req.query, requestSchema, logger);
    }
};
