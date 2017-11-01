'use strict';

let request = require('request-promise');

let importICalEvents = function (url) {
    return request({uri: `${url}`});
};

module.exports = {
    importICalEvents
};
