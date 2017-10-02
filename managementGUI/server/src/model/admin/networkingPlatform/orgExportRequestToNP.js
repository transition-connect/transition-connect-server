'use strict';

let db = require('server-lib').neo4j;

let getNumberOfOrgCommand = function (platformId) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})<-[:EXPORT_REQUEST]-(:Organization)`)
        .return(`count (*) AS numberOfOrg`)
        .end({platformId: platformId});
};

let getOrgCommand = function (platformId) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})<-[request:EXPORT_REQUEST]-(org:Organization)`)
        .return(`org.name AS name, org.organizationId AS organizationId, request.requestTimestamp AS requestTimestamp`)
        .orderBy(`requestTimestamp DESC`)
        .end({platformId: platformId});
};

module.exports = {
    getNumberOfOrgCommand,
    getOrgCommand
};
