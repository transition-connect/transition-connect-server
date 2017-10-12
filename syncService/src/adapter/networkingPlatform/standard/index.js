'use strict';

let request = require('request-promise');

let importOrganizations = function (url, lastSync, skip) {
    let options = {uri: `${url}/organization`, qs: {skip: skip, lastSync: lastSync}, json: true};
    return request(options);
};

module.exports = {
    importOrganizations
};
