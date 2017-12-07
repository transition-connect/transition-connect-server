'use strict';

//let email = require('./../../eMailService/orgDeleted');
let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);

let deleteNotExportedRelationships = function (platformId) {
    return db.cypher().match(`(:NetworkingPlatform {platformId: {platformId}})-[:DELETED]->
                (org:Organization)`)
        .optionalMatch(`(org)-[orgDeleteRequest:DELETE_REQUEST]->(:NetworkingPlatform)`)
        .where(`NOT EXISTS(orgDeleteRequest.lastExportTimestamp)`)
        .delete(`orgDeleteRequest`)
        .with(`org`)
        .optionalMatch(`(org)-[:EVENT|WEBSITE_EVENT]->(:Event)-[eventDeleteRequest:DELETE_REQUEST]->(:NetworkingPlatform)`)
        .where(`NOT EXISTS(eventDeleteRequest.lastExportTimestamp)`)
        .delete(`eventDeleteRequest`)
        .end({platformId: platformId});
};

let markEventOfOrgToDelete = function (platformId) {
    return db.cypher().match(`(:NetworkingPlatform {platformId: {platformId}})-[:DELETED]->
         (:Organization)-[:EVENT|WEBSITE_EVENT]->(event:Event)-[exportRel:EXPORT]->(exportNp:NetworkingPlatform)`)
        .merge(`(event)-[deleteRel:DELETE_REQUEST]->(exportNp)`)
        .addCommand(` SET deleteRel.lastExportTimestamp = exportRel.lastExportTimestamp`)
        .delete(`exportRel`)
        .end({platformId: platformId}).getCommand();
};

let markOrgToDelete = function (existingOrganizations, platformId) {
    return db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})-[:CREATED]->
                (org:Organization)`)
        .where(`NOT org.organizationIdOnExternalNP IN {existingOrganizations}`)
        .merge(`(np)-[counter:DELETE_COUNTER]->(org)`)
        .onCreate(`SET counter.count = 1`)
        .onMatch(`SET counter.count = counter.count + 1`)
        .with(`np, org, counter`)
        .where(`counter.count > 3`)
        .delete(`counter`)
        .merge(`(np)-[:DELETED]->(org)`)
        //Delete all export relationships to networking platform
        .with(`org`)
        .match(`(org)-[exportRel:EXPORT]->(exportNp:NetworkingPlatform)`)
        .merge(`(org)-[deleteRel:DELETE_REQUEST]->(exportNp)`)
        .addCommand(` SET deleteRel.lastExportTimestamp = exportRel.lastExportTimestamp`)
        .delete(`exportRel`)
        .return(`DISTINCT org.organizationId AS organizationId, org.name AS name`)
        .end({existingOrganizations: existingOrganizations, platformId: platformId}).getCommand();

};

let handlingDeleteOrg = async function (existingOrganizations, platformId) {
    return await deleteNotExportedRelationships(platformId)
        .send([markOrgToDelete(existingOrganizations, platformId), markEventOfOrgToDelete(platformId)]);
};

let informAdministratorOrgDeleted = async function (orgsDeleted) {
    for (let org of orgsDeleted) {
        logger.info(`Organization ${org.name} (${org.organizationId}) will be deleted`);
        //await email.sendOrgDeleted(org.organizationId);
    }
};

let deleteOrg = async function (existingOrganizations, platformId) {
    let resp = await handlingDeleteOrg(existingOrganizations, platformId);
    await informAdministratorOrgDeleted(resp[0]);
};

module.exports = {
    deleteOrg
};
