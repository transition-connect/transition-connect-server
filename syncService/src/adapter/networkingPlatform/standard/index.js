'use strict';

let request = require('request-promise');

let importOrganizations = function (url, lastUpdateTimestamp, skip) {
    let options = {uri: `${url}/organization`, json: true};
    return request(options);
};

module.exports = {
    importOrganizations
};
