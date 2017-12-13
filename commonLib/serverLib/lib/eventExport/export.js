'use strict';

let db = require('./../neo4j');
let time = require('./../time');

let deleteDeactivatedNeverExportedEvents = function (organizationId) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})
                              -[:EVENT|WEBSITE_EVENT]->(:Event)-[export:EXPORT]->(np:NetworkingPlatform)`)
        .where(`((NOT (org)-[:EXPORT]->(np) AND NOT (np)-[:CREATED]->(org)) 
                 OR NOT (org)-[:EVENT_RULE]->(:EventRule)-[:EVENT_RULE_FOR]->(np)) AND
                 NOT EXISTS(export.lastExportTimestamp)`)
        .delete('export')
        .end({organizationId: organizationId}).getCommand();
};

let setDeleteRequestExportedEvents = function (organizationId) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})
                              -[:EVENT|WEBSITE_EVENT]->(event:Event)-[export:EXPORT]->(np:NetworkingPlatform)`)
        .where(`((NOT (org)-[:EXPORT]->(np) AND NOT (np)-[:CREATED]->(org)) 
                 OR NOT (org)-[:EVENT_RULE]->(:EventRule)-[:EVENT_RULE_FOR]->(np)) AND
                 EXISTS(export.lastExportTimestamp)`)
        .merge(`(event)-[:DELETE_REQUEST {lastExportTimestamp: export.lastExportTimestamp}]->(np)`)
        .delete('export')
        .end({organizationId: organizationId}).getCommand();
};

let setNewEventExports = function (organizationId) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})
                              -[:EVENT_RULE]->(rule:EventRule)-[:EVENT_RULE_FOR]->(np:NetworkingPlatform)`)
        .where(`(org)-[:EXPORT]->(np) AND NOT (np)-[:CREATED]->(org)`)
        .with('org, np')
        .match(`(org)-[:EVENT|WEBSITE_EVENT]->(event:Event)`)
        .optionalMatch(`(event)-[deleteRequest:DELETE_REQUEST]->(np)`)
        .optionalMatch(`(event)-[deleteRequestSuccess:DELETE_REQUEST_SUCCESS]->(np)`)
        .merge(`(event)-[export:EXPORT {created: {created}}]->(np)`)
        .addCommand(` SET export.lastExportTimestamp = deleteRequest.lastExportTimestamp`)
        .delete(`deleteRequest, deleteRequestSuccess`)
        .end({organizationId: organizationId, created: time.getNowUtcTimestamp()});
};

let setEventExportToOriginalPlatform = function (organizationId) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})
                              -[:EVENT_RULE]->(rule:EventRule)-[:EVENT_RULE_FOR]->(np:NetworkingPlatform)`)
        .where(`(np)-[:CREATED]->(org)`)
        .with('org, np')
        .match(`(org)-[:WEBSITE_EVENT]->(event:Event)`)
        .optionalMatch(`(event)-[deleteRequest:DELETE_REQUEST]->(np)`)
        .optionalMatch(`(event)-[deleteRequestSuccess:DELETE_REQUEST_SUCCESS]->(np)`)
        .merge(`(event)-[export:EXPORT {created: {created}}]->(np)`)
        .addCommand(` SET export.lastExportTimestamp = deleteRequest.lastExportTimestamp`)
        .delete(`deleteRequest, deleteRequestSuccess`)
        .end({organizationId: organizationId, created: time.getNowUtcTimestamp()}).getCommand();
};

let setEventExportRelationships = async function (organizationId) {
    await setNewEventExports(organizationId).send([
        deleteDeactivatedNeverExportedEvents(organizationId),
        setDeleteRequestExportedEvents(organizationId),
        setEventExportToOriginalPlatform(organizationId)
    ]);
};

module.exports = {
    setEventExportRelationships
};
