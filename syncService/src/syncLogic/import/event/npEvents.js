'use strict';

let db = require('server-lib').neo4j;
let parser = requireLib('iCalEventParser');
let eventExport = require('server-lib').eventExport;
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
        .return(`org.organizationId AS organizationId`)
        .end({uid: event.uid, idOrg: idOrg}).send();
};

let importEvent = async function (uid, timestamp, iCal, idOrg, platformId) {
    let events = parser.parseEvents(iCal);
    if (events.length === 1) {
        if (events[0].uid === uid) {
            let resp = await saveEventToDb(events[0], idOrg, timestamp);
            if(resp.length === 1) {
                await eventExport.setEventExportRelationships(resp[0].organizationId);
            }
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
