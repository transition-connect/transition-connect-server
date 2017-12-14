'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let setICalCompare = function (data) {
    let startIndex = data.iCal.indexOf('DTSTAMP');
    let endIndex = data.iCal.indexOf('\n', startIndex);
    if (startIndex !== -1 && endIndex !== -1) {
        data.iCalCompare = data.iCal.substring(0, startIndex) + data.iCal.substring(endIndex + 1);
    } else {
        data.iCalCompare = data.iCal;
    }
};

let createWebsiteEvent = function (uid, data) {
    data.summary = data.summary || `event${uid}Summary`;
    data.description = data.description || `event${uid}Description`;
    data.location = data.location || `event${uid}Location`;
    data.startDate = data.startDate || 500;
    data.endDate = data.endDate || 600;
    data.modified = data.modified || 602;
    data.iCal = data.iCal || `BEGIN:VCALENDAR
${uid}
END:VCALENDAR`;
    setICalCompare(data);
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(organization:Organization {organizationId: {organizationId}})`)
        .create(`(organization)-[:WEBSITE_EVENT]->(:Event {uid: {uid}, summary: {summary}, description: {description}, 
                  location: {location}, startDate: {startDate}, endDate: {endDate}, iCal: {iCal},
                  iCalCompare: {iCalCompare}, modified: {modified}})`)
        .end({
            uid: uid, organizationId: data.organizationId, summary: data.summary, description: data.description,
            location: data.location, startDate: data.startDate, endDate: data.endDate, iCal: data.iCal,
            iCalCompare: data.iCalCompare, modified: data.modified
        }).getCommand());
};

let createNpEvent = function (uid, data) {
    data.summary = data.summary || `event${uid}Summary`;
    data.description = data.description || `event${uid}Description`;
    data.modifiedOnNp = data.modifiedOnNp || 600;
    data.modified = data.modified || 602;
    data.location = data.location || `event${uid}Location`;
    data.startDate = data.startDate || 500;
    data.endDate = data.endDate || 600;
    data.iCal = data.iCal || `BEGIN:VCALENDAR
${uid}
END:VCALENDAR`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(organization:Organization {organizationId: {organizationId}})`)
        .create(`(organization)-[:EVENT]->(:Event {uid: {uid}, summary: {summary}, description: {description}, 
                  location: {location}, startDate: {startDate}, endDate: {endDate}, iCal: {iCal},
                  modifiedOnNp: {modifiedOnNp}, modified: {modified}})`)
        .end({
            uid: uid, organizationId: data.organizationId, summary: data.summary, description: data.description,
            location: data.location, startDate: data.startDate, endDate: data.endDate, iCal: data.iCal,
            modifiedOnNp: data.modifiedOnNp, modified: data.modified
        }).getCommand());
};

let exportEventToNp = function (data) {
    data.created = data.created || 500;
    data.lastExportTimestamp = data.lastExportTimestamp || null;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(event:Event {uid: {uid}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(event)-[:EXPORT {lastExportTimestamp: {lastExportTimestamp}, created: {created}}]->(np)`)
        .end({
            uid: data.uid, npId: data.npId, lastExportTimestamp: data.lastExportTimestamp,
            created: data.created
        }).getCommand());
};

let exportEventDeleteRequestToNp = function (data) {
    data.created = data.created || 500;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(event:Event {uid: {uid}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(event)-[:DELETE_REQUEST {lastExportTimestamp: {lastExportTimestamp}, created: {created}}]->(np)`)
        .end({
            uid: data.uid, npId: data.npId, lastExportTimestamp: data.lastExportTimestamp,
            created: data.created
        }).getCommand());
};

let exportEventDeleteRequestSuccessToNp = function (data) {
    data.created = data.created || 500;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(event:Event {uid: {uid}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(event)-[:DELETE_REQUEST_SUCCESS {created: {created}}]->(np)`)
        .end({
            uid: data.uid, npId: data.npId, created: data.created
        }).getCommand());
};

let createEventExportRule = function (organizationId, data) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(org)-[:EVENT_RULE]->(rule:EventRule)-[:EVENT_RULE_FOR]->(np)`)
        .end({
            organizationId: organizationId, npId: data.npId
        }).getCommand());
};

module.exports = {
    createWebsiteEvent,
    createNpEvent,
    exportEventToNp,
    exportEventDeleteRequestToNp,
    exportEventDeleteRequestSuccessToNp,
    createEventExportRule
};