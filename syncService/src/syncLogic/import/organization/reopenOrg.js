'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);

let deleteCounters = function (orgIds, platformId) {
    return db.cypher().match(`(org:Organization)<-[counter:DELETE_COUNTER]-(:NetworkingPlatform {platformId: {platformId}})`)
        .where(`org.organizationIdOnExternalNP IN {orgIds}`)
        .delete(`counter`)
        .end({orgIds: orgIds, platformId: platformId});
};

let getOrganizationsToReopen = function (orgIds, platformId) {
    return db.cypher().match(`(org:Organization)<-[deleteRel:DELETED]-(:NetworkingPlatform {platformId: {platformId}})`)
        .where(`org.organizationIdOnExternalNP IN {orgIds}`)
        .return(`org.organizationId AS id, org.name AS name`)
        .end({orgIds: orgIds, platformId: platformId});
};

let reopenOrganization = function (orgIds, platformId) {
    return db.cypher().match(`(org:Organization)<-[deleteRel:DELETED]-(:NetworkingPlatform {platformId: {platformId}})`)
        .where(`org.organizationIdOnExternalNP IN {orgIds}`)
        .delete(`deleteRel`)
        .with(`org`)
        .match(`(org)-[deleteRel:DELETE_REQUEST|DELETE_REQUEST_SUCCESS]->(np:NetworkingPlatform)`)
        .merge(`(org)-[export:EXPORT]->(np)`)
        .addCommand(` SET export.created = deleteRel.created, export.lastExportTimestamp = deleteRel.lastExportTimestamp`)
        .delete(`deleteRel`)
        .end({orgIds: orgIds, platformId: platformId});
};

let logReopenOrganizations = function (organizations) {
    for (let org of organizations) {
        logger.info(`Organization ${org.name} (${org.id}) has been reopen`);
    }
};

let reopen = async function (orgIds, platformId) {
    await deleteCounters(orgIds, platformId).send();
    let resp = await getOrganizationsToReopen(orgIds, platformId).send();
    if (resp.length > 0) {
        await reopenOrganization(orgIds, platformId).send();
        logReopenOrganizations(resp);
    }
};

module.exports = {
    reopen
};
