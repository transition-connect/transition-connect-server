'use strict';

let db = require('server-lib').neo4j;

let getStatus = function (status) {
    if (status === 'ACCEPTED') {
        return 'accepted';
    }
    return 'pending';
};

let getProjects = function (organisation) {
    let projects = [];
    for (let project of organisation.projects) {
        let result = {};
        result.isProjectAdmin = project.isProjectAdmin;
        result.statusAdmin = getStatus(project.statusAdmin);
        result.name = project.project.properties.name;
        result.created = project.project.properties.created;
        result.projectId = project.project.properties.projectId;
        projects.push(result);
    }
    return projects;
};

let handlingResponse = function (resp) {
    for (let organisation of resp) {
        organisation.projects = getProjects(organisation);
        organisation.statusAdmin = getStatus(organisation.statusAdmin);
    }
};

let getOverview = function (adminId) {
    return db.cypher().match(`(statusOrganization:Status)<-[:STATUS]-(org:Organization)`)
        .where(`(org)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}}) OR
                (org)-[:HAS]->(:Project)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}})`)
        .with(`statusOrganization, org, 
               EXISTS((:Admin {adminId: {adminId}})-[:IS_ADMIN]->(org)) AS isOrganizationAdmin`)
        .match(`(np:NetworkingPlatform)-[:CREATED]->(org)`)
        .optionalMatch(`(statusOrganization)<-[orgStatusAdmin]-(:Admin)`)
        .optionalMatch(`(org)-[:HAS]->(project:Project)-[:STATUS]->(statusProject:Status)`)
        .optionalMatch(`(statusProject)<-[projectStatusAdmin]-(:Admin)-[:IS_ADMIN]->(project)`)
        .with(`org, project, EXISTS((:Admin {adminId: {adminId}})-[:IS_ADMIN]->(project:Project)) AS isProjectAdmin, 
               statusProject, projectStatusAdmin, np, isOrganizationAdmin,
               statusOrganization, orgStatusAdmin`)
        .orderBy(`isProjectAdmin DESC, project.created DESC`)
        .return(`org.name AS name, org.organizationId AS organizationId, np.name AS nameNetworkingPlatform,
                 TYPE(orgStatusAdmin) AS statusAdmin,  isOrganizationAdmin,
                 LABELS(statusOrganization) AS statusOrganization,
                 collect({project: project, isProjectAdmin: isProjectAdmin,
                 statusAdmin: TYPE(projectStatusAdmin)}) AS projects`)
        .end({adminId: adminId})
        .send().then(function (resp) {
            handlingResponse(resp);
            return {organization: resp};
        });
};

module.exports = {
    getOverview: getOverview
};
