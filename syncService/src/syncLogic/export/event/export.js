'use strict';

let db = require('server-lib').neo4j;
let time = require('server-lib').time;
let logger = require('server-lib').logging.getLogger(__filename);


let getEventsToExport = async function (platformId) {
    return await db.cypher().match(`(:NetworkingPlatform {platformId: {platformId}})
                        <-[exportOrgRel:EXPORT]-(org:Organization)-[:EVENT|WEBSITE_EVENT]->(event:Event)
                        -[exportRel:EXPORT]->(:NetworkingPlatform {platformId: {platformId}})`)
        .where(`(exportRel.lastExportTimestamp < event.modified) OR
                 NOT EXISTS(exportRel.lastExportTimestamp)`)
        .return(`exportOrgRel.id AS orgId, event.iCal AS iCal, event.uid AS uid,
                 NOT EXISTS(exportRel.lastExportTimestamp) AS firstExport`)
        .end({platformId: platformId}).send();
};

let setEventAsExported = async function (uid, organizationId, platformId) {
    await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[exportRel:EXPORT|DELETE_REQUEST]-(event:Event {uid: {uid}})`)
        .set(`exportRel`, {lastExportTimestamp: time.getNowUtcTimestamp()})
        .end({uid: uid, platformId: platformId, organizationId: organizationId}).send();
};

module.exports = {
    getEventsToExport,
    setEventAsExported
};
