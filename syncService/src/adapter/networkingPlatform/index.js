'use strict';

let request = require('request-promise');

let getListOrganisations = function (host, skip) {
    let options = {uri: `${host}/api/v1/organisation`, qs: {skip: skip}, json: true};
    return request(options);
};

let importOrganisation = function (host, id) {
    let options = {uri: `${host}/api/v1/organisation/${id}`, json: true};
    return request(options);
};

let getListEvents = function (host, skip) {
    let options = {uri: `${host}/api/v1/event`, qs: {skip: skip}, json: true};
    return request(options);
};

let importEvent = function (host, uid) {
    let options = {uri: `${host}/api/v1/event/${uid}`, json: true};
    return request(options);
};

let exportOrganizations = function (orgsToExport, host) {
    let options = {method: 'PUT', url: `${host}/organization`, json: {organizations: orgsToExport}};
    return request(options);
};

module.exports = {
    getListOrganisations,
    importOrganisation,
    getListEvents,
    importEvent,
    exportOrganizations
};
