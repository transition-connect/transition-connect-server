'use strict';

let db = require('server-lib').neo4j;
let _ = require(`lodash`);
let parser = require('./iCalEventParser');
let time = require('server-lib').time;
let eventExport = require('server-lib').eventExport;
let logger = require('server-lib').logging.getLogger(__filename);

let saveEventsToDb = async function (events, organizationId) {
    await db.cypher().unwind(`{events} AS event`)
        .match(`(org:Organization {organizationId: {organizationId}})`)
        .merge(`(eventDb:Event {uid: event.uid})`)
        .addCommand(` SET eventDb.iCal = event.iCal, eventDb.description = event.description,
                      eventDb.summary = event.summary, eventDb.location = event.location,
                      eventDb.startDate = event.startDate, eventDb.endDate = event.endDate,
                      eventDb.modified = {now}`)
        .merge(`(org)-[:WEBSITE_EVENT]->(eventDb)`)
        .end({events: events, organizationId: organizationId, now: time.getNowUtcTimestamp()}).send();
    for (let event of events) {
        logger.info(`For org ${organizationId} -> ${event.summary} (${event.uid} ) event imported from website`);
    }
};

let deleteEventFromDb = async function (events, organizationId) {
    await db.cypher().match(`(org:Organization)-[rel:WEBSITE_EVENT]->(event:Event)`)
        .where(`event.uid IN {events}`)
        .delete(`rel, event`)
        .end({events: _.map(events, 'uid')}).send();
    for (let event of events) {
        logger.info(`For org ${organizationId} -> event with uid ${event.uid} deleted`);
    }
};

let getChangedOrNewEvents = async function (events, organizationId) {
    let resp = await db.cypher().unwind(`{events} AS event`)
        .match(`(org:Organization {organizationId: {organizationId}})
                -[:WEBSITE_EVENT]->(orgEvent:Event {uid: event.uid})`)
        .where(`orgEvent.iCal = event.iCal`)
        .return(`orgEvent.uid AS uid`)
        .end({events: events, organizationId: organizationId}).send();
    return _.differenceBy(events, resp, 'uid');
};

let getEventsToDelete = async function (events, organizationId) {
    return await db.cypher().match(`(org:Organization {organizationId: {organizationId}})
                -[:WEBSITE_EVENT]->(orgEvent:Event)`)
        .where(`NOT orgEvent.uid IN {events}`)
        .return(`orgEvent.uid AS uid`)
        .end({events: _.map(events, 'uid'), organizationId: organizationId}).send();
};

let importEvents = async function (iCal, organizationId) {
    let events = parser.parseEvents(iCal);
    let changedEvents = await getChangedOrNewEvents(events, organizationId);
    await saveEventsToDb(changedEvents, organizationId);
    let eventToDelete = await getEventsToDelete(events, organizationId);
    await deleteEventFromDb(eventToDelete, organizationId);
    await eventExport.setEventExportRelationships(organizationId);
};

module.exports = {
    importEvents
};
