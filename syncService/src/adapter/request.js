'use strict';

let request = require('request-promise');

let addSslRequired = function (options) {
    if (process.env.NODE_ENV === 'production') {
        options.strictSSL = true;
    }
};
let addAuthentication = function (options, token) {
    options.headers = {
        'authorization': token
    };
};

let sendRequest = function (options, token) {
    addSslRequired(options);
    addAuthentication(options, token);
    return request(options);
};

module.exports = {
    sendRequest
};
