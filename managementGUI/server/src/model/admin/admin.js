'use strict';

let db = require('server-lib').neo4j;

let getOverview = function (adminId) {
    return db.cypher().match(`(org:Organization)<-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})`)
        .optionalMatch(`(org)-[:HAS]->(project:Project)`)
        .with(`org, project, EXISTS((admin)-[:IS_ADMIN]->(project:Project)) AS isProjectAdmin`)
        .orderBy(`isProjectAdmin DESC, project.created DESC`)
        .return(`org.name AS name, org.organizationId AS organizationId, collect(project) AS projects`)
        .end({adminId: adminId})
        .send().then(function (resp) {
            return {overview: resp};
        });
};

module.exports = {
    getOverview: getOverview
};
