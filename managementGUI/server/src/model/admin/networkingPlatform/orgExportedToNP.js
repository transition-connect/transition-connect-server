'use strict';

let db = require('server-lib').neo4j;

let getNumberOfOrgCommand = function (platformId) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})<-[:EXPORT]-(:Organization)`)
        .return(`count (*) AS numberOfOrg`)
        .end({platformId: platformId});
};

let getOrgCommand = function (platformId) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})<-[export:EXPORT]-(org:Organization)`)
        .return(`org.name AS name, org.organizationId AS organizationId, export.created AS created`)
        .orderBy(`created DESC`)
        .end({platformId: platformId});
};

module.exports = {
    getNumberOfOrgCommand,
    getOrgCommand
};
