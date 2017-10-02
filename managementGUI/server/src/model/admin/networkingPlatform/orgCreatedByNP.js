'use strict';

let db = require('server-lib').neo4j;

let getNumberOfOrgCommand = function (platformId) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})-[:CREATED]->(org:Organization)`)
        .return(`count (*) AS numberOfOrg`)
        .end({platformId: platformId});
};

let getOrgCommand = function (platformId) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})-[:CREATED]->(org:Organization)`)
        .return(`org.name AS name, org.organizationId AS organizationId, org.created AS created`)
        .orderBy(`created DESC`)
        .end({platformId: platformId});
};

module.exports = {
    getNumberOfOrgCommand,
    getOrgCommand
};
