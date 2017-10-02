'use strict';

let db = require('server-lib').neo4j;

let getOrgCommand = function (adminId, platformId) {
    return db.cypher().match(`(:Admin {adminId: {adminId}})-[:IS_ADMIN]->
                        (:NetworkingPlatform {platformId: {platformId}})-[:CREATED]->(org:Organization)`)
        .return(`org.name AS name, org.organizationId AS organizationId, org.created AS created`)
        .orderBy(`created DESC`)
        .end({adminId: adminId, platformId: platformId});
};

module.exports = {
    getOrgCommand
};
