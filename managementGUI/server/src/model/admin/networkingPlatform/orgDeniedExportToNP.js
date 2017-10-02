'use strict';

let db = require('server-lib').neo4j;

let getNumberOfOrgCommand = function (platformId) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})<-[:EXPORT_DENIED]-(:Organization)`)
        .return(`count (*) AS numberOfOrg`)
        .end({platformId: platformId});
};

let getOrgCommand = function (platformId) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})<-[denied:EXPORT_DENIED]-(org:Organization)`)
        .return(`org.name AS name, org.organizationId AS organizationId, denied.timestamp AS timestamp`)
        .orderBy(`timestamp DESC`)
        .end({platformId: platformId});
};

module.exports = {
    getNumberOfOrgCommand,
    getOrgCommand
};
