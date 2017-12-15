'use strict';

let db = require('server-lib').neo4j;
let parser = requireLib('iCalEventParser');
let logger = require('server-lib').logging.getLogger(__filename);

let saveEventToDb = async function (event, idOrg, timestamp) {
    return await db.cypher().match(`(org:Organization {organizationIdOnExternalNP: {idOrg}})`)
        .merge(`(eventDb:Event {uid: {uid}})`)
        .set(`eventDb`, {
            iCal: event.iCal, description: event.description,
            summary: event.summary, location: event.location,
            startDate: event.startDate, endDate: event.endDate,
            modifiedOnNp: timestamp
        })
        .merge(`(org)-[:EVENT]->(eventDb)`)
        .end({uid: event.uid, idOrg: idOrg}).send();
};

let importEvent = async function (uid, timestamp, iCal, idOrg, platformId) {
    let events = parser.parseEvents(iCal);
    if (events.length === 1) {
        if (events[0].uid === uid) {
            await saveEventToDb(events[0], idOrg, timestamp);
            logger.info(`For org ${idOrg} event ${uid} imported from networking platform`);
        } else {
            logger.error(`Failed to import event ${uid}. Parsed uid ${events[0].uid} of event is not the same`);
        }
    } else {
        logger.error(`Failed to parse iCal from project ${idOrg} / platform ${platformId}`);
    }
};

module.exports = {
    importEvent
};
