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
    let events = await request.sendRequest(options, token);
    return _.uniqBy(events.events, 'uid');
};

let importEvent = function (host, uid, token) {
    let options = {uri: `${host}/api/v1/event/${uid}`, json: true};
    return request.sendRequest(options, token);
};

let exportOrganization = async function (orgToExport, firstExport, idForExport, host, token) {
    let options;
    if (firstExport) {
        options = {method: 'POST', url: `${host}/api/v1/organisation`, json: orgToExport};
    } else {
        options = {method: 'PUT', url: `${host}/api/v1/organisation/${idForExport}`, json: orgToExport};
    }
    let resp = await request.sendRequest(options, token);
    if (idForExport) {
        return {id: idForExport};
    }
    return {id: resp.id};
};

module.exports = {
    getListOrganisations,
    importOrganisation,
    getListEvents,
    importEvent,
    exportOrganization
};
