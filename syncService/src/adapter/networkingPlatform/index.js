'use strict';

let request = require('./../request');

let getListOrganisations = function (host, skip, token) {
    let options = {uri: `${host}/api/v1/organisation`, qs: {skip: skip}, json: true};
    return request.sendRequest(options, token);
};

let importOrganisation = function (host, id, token) {
    let options = {uri: `${host}/api/v1/organisation/${id}`, json: true};
    return request.sendRequest(options, token);
};

let getListEvents = function (host, skip, token) {
    let options = {uri: `${host}/api/v1/event`, qs: {skip: skip}, json: true};
    return request.sendRequest(options, token);
};

let importEvent = function (host, uid, token) {
    let options = {uri: `${host}/api/v1/event/${uid}`, json: true};
    return request.sendRequest(options, token);
};

let exportOrganizations = function (orgsToExport, host, token) {
    let options = {method: 'PUT', url: `${host}/organization`, json: {organizations: orgsToExport}};
    return request.sendRequest(options, token);
};

module.exports = {
    getListOrganisations,
    importOrganisation,
    getListEvents,
    importEvent,
    exportOrganizations
};
