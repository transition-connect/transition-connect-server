'use strict';

let db = require('server-lib').neo4j;
let parser = require('./iCalEventParser');
let logger = require('server-lib').logging.getLogger(__filename);

let saveEventsToDb = async function (events, organizationId) {
    return await db.cypher().unwind(`{events} AS event`)
        .match(`(org:Organization {organizationId: {organizationId}})`)
        .merge(`(eventDb:Event {uid: event.uid})`)
        .addCommand(` SET eventDb.iCal = event.iCal, eventDb.description = event.description,
                      eventDb.summary = event.summary, eventDb.location = event.location,
                      eventDb.startDate = event.startDate, eventDb.endDate = event.endDate`)
        .merge(`(org)-[:WEBSITE_EVENT]->(eventDb)`)
        .end({events: events, organizationId: organizationId}).send();
};

let importEvents = async function (iCal, organizationId) {
    let events = parser.parseEvents(iCal);
    logger.info(`For org ${organizationId} -> ${events.length} events imported from website`);
    await saveEventsToDb(events, organizationId);
};

module.exports = {
    importEvents
};
