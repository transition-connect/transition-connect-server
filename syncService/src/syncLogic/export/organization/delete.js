'use strict';

let db = require('server-lib').neo4j;

let getOrganizationsToDelete = async function (platformId) {

    return await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[exportRel:DELETE_REQUEST]-(org:Organization)`)
        .return(`org.organizationId AS organizationId, exportRel.id AS id`)
        .end({platformId: platformId}).send();
};

let setOrganizationAsDeleted = async function (organizationId, platformId) {

    return await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[deleteRequest:DELETE_REQUEST]-(org:Organization {organizationId: {organizationId}})`)
        .merge(`(np)<-[deleteRequestSuccess:DELETE_REQUEST_SUCCESS {id: deleteRequest.id, created: deleteRequest.created}]-(org)`)
        .delete(`deleteRequest`)
        .end({organizationId: organizationId, platformId: platformId}).send();
};

module.exports = {
    getOrganizationsToDelete,
    setOrganizationAsDeleted
};
