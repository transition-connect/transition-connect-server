'use strict';

let request = require('request-promise');

let getListOrganisations = function (host, skip) {
    let options = {uri: `${host}/api/v1/organisation`, qs: {skip: skip}, json: true};
    return request(options);
};

let importOrganisation = function (url, id) {
    let options = {uri: `${url}/api/v1/organisation/${id}`, json: true};
    return request(options);
};

let exportOrganizations = function (orgsToExport, url) {
    let options = {method: 'PUT', url: `${url}/organization`, json: {organizations: orgsToExport}};
    return request(options);
};

module.exports = {
    getListOrganisations,
    importOrganisation,
    exportOrganizations
};
