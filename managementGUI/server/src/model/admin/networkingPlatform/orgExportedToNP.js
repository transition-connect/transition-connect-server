'use strict';

let db = require('server-lib').neo4j;

let getOrgCommand = function (adminId, platformId) {
    return db.cypher().match(`(:Admin {adminId: {adminId}})-[:IS_ADMIN]->
                        (:NetworkingPlatform {platformId: {platformId}})<-[export:EXPORT]-(org:Organization)`)
        .return(`org.name AS name, org.organizationId AS organizationId, export.exportTimestamp AS exportTimestamp`)
        .orderBy(`exportTimestamp DESC`)
        .end({adminId: adminId, platformId: platformId});
};

module.exports = {
    getOrgCommand
};
