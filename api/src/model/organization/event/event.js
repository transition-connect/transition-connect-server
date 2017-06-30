'use strict';

let db = require('server-lib').neo4j;
let uuid = require('server-lib').uuid;

let deleteEvent = function (eventId) {
    return db.cypher().match(`(event:Event {eventId: {eventId}})<-[rel:HAS]-(:Organization)`)
        .delete(`event, rel`)
        .end({eventId: eventId}).send();
};

let editEvent = function (params) {
    return db.cypher().match(`(event:Event {eventId: {eventId}})`)
        .set(`event`, {title: params.title, description: params.description})
        .end({eventId: params.eventId}).send();
};

let createEvent = function (params) {
    let eventId = uuid.generateUUID();
    return db.cypher().match(`(organization:Organization {organizationId: {organizationId}})`)
        .createUnique(`(event:Event {eventId: {eventId}})<-[:HAS]-(organization)`)
        .set(`event`, {title: params.title, description: params.description})
        .end({eventId: eventId, title: params.title, description: params.description,
            organizationId: params.organizationId}).send().then(function () {
            return {eventId: eventId};
        });
};


module.exports = {
    deleteEvent: deleteEvent,
    editEvent: editEvent,
    createEvent: createEvent
};
