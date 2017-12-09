'use strict';

let request = require('./../request');
let _ = require('lodash');

let getListOrganisations = async function (host, skip, token) {
    let options = {uri: `${host}/api/v1/organisation`, qs: {skip: skip}, json: true};
    let org = await request.sendRequest(options, token);
    return _.uniqBy(org.organisations, 'id');
};

let importOrganisation = function (host, id, token) {
    let options = {uri: `${host}/api/v1/organisation/${id}`, json: true};
    return request.sendRequest(options, token);
};

let getListEvents = async function (host, skip, token) {
    let options = {uri: `${host}/api/v1/event`, qs: {skip: skip}, json: true};
    let events =  await request.sendRequest(options, token);
    return _.uniqBy(events.events, 'uid');
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
