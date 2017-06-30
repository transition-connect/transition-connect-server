'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createEvent = function (eventId, data) {
    data.title = data.title || `event${eventId}Title`;
    data.description = data.description || `event${eventId}Title`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(organization:Organization {organizationId: {organizationId}})`)
        .create(`(organization)-[:HAS]->(:Event {eventId: {eventId}, title: {title}, description: {description}})`)
        .end({
            eventId: eventId, organizationId: data.organizationId, title: data.title, description: data.description
        }).getCommand());
};

module.exports = {
    createEvent: createEvent
};