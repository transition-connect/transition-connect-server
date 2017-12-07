'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createWebsiteEvent = function (uid, data) {
    data.summary = data.summary || `event${uid}Summary`;
    data.description = data.description || `event${uid}Description`;
    data.location = data.location || `event${uid}Location`;
    data.startDate = data.startDate || 500;
    data.endDate = data.endDate || 600;
    data.iCal = data.iCal || `BEGIN:VCALENDAR
                              END:VCALENDAR`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(organization:Organization {organizationId: {organizationId}})`)
        .create(`(organization)-[:WEBSITE_EVENT]->(:Event {uid: {uid}, summary: {summary}, description: {description}, 
                  location: {location}, startDate: {startDate}, endDate: {endDate}, iCal: {iCal}})`)
        .end({
            uid: uid, organizationId: data.organizationId, summary: data.summary, description: data.description,
            location: data.location, startDate: data.startDate, endDate: data.endDate, iCal: data.iCal
        }).getCommand());
};

let createNpEvent = function (uid, data) {
    data.summary = data.summary || `event${uid}Summary`;
    data.description = data.description || `event${uid}Description`;
    data.modifiedOnNp = data.modifiedOnNp || 600;
    data.location = data.location || `event${uid}Location`;
    data.startDate = data.startDate || 500;
    data.endDate = data.endDate || 600;
    data.iCal = data.iCal || `BEGIN:VCALENDAR
                              END:VCALENDAR`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(organization:Organization {organizationId: {organizationId}})`)
        .create(`(organization)-[:EVENT]->(:Event {uid: {uid}, summary: {summary}, description: {description}, 
                  location: {location}, startDate: {startDate}, endDate: {endDate}, iCal: {iCal},
                  modifiedOnNp: {modifiedOnNp}})`)
        .end({
            uid: uid, organizationId: data.organizationId, summary: data.summary, description: data.description,
            location: data.location, startDate: data.startDate, endDate: data.endDate, iCal: data.iCal,
            modifiedOnNp: data.modifiedOnNp
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

module.exports = {
    createWebsiteEvent,
    createNpEvent,
    exportEventToNp
};