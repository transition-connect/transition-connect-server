'use strict';

let db = require('server-lib').neo4j;

let getStatus = function (status) {
    if (status === 'ACCEPTED') {
        return 'accepted';
    }
    return 'waiting';
};

let getProjects = function (organisation) {
    let projects = [];
    for (let project of organisation.projects) {
        let result = {};
        result.isProjectAdmin = project.isProjectAdmin;
        result.statusProjectAdmin = getStatus(project.statusAdmin);
        result.statusNetworkingPlatform = getStatus(project.statusNetworkingPlatform);
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
        organisation.statusOrganizationAdmin = getStatus(organisation.statusAdmin);
        organisation.statusNetworkingPlatform = getStatus(organisation.statusNetworkingPlatform);
    }
};

let getOverview = function (adminId) {
    return db.cypher().match(`(statusOrganization:Status)<-[:STATUS]-(org:Organization)
                               <-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})`)
        .with(`statusOrganization, org, admin`)
        .match(`(np:NetworkingPlatform)-[:CREATED]->(org)`)
        .optionalMatch(`(statusOrganization)<-[orgStatusAdmin]-(admin)`)
        .optionalMatch(`(statusOrganization)<-[orgStatusNetworkingPlatform]-(:Admin)-[:IS_ADMIN]->(np)`)
        .optionalMatch(`(org)-[:HAS]->(project:Project)-[:STATUS]->(statusProject:Status)`)
        .optionalMatch(`(statusProject)<-[projectStatusAdmin]-(:Admin)-[:IS_ADMIN]->(project)`)
        .optionalMatch(`(statusProject)<-[projectStatusNetworkingPlatform]-(:Admin)-[:IS_ADMIN]->(np)`)
        .with(`org, project, EXISTS((admin)-[:IS_ADMIN]->(project:Project)) AS isProjectAdmin, 
               statusProject, projectStatusAdmin, projectStatusNetworkingPlatform, np,
               statusOrganization, orgStatusAdmin, orgStatusNetworkingPlatform`)
        .orderBy(`isProjectAdmin DESC, project.created DESC`)
        .return(`org.name AS name, org.organizationId AS organizationId, np.name AS nameNetworkingPlatform,
                 TYPE(orgStatusAdmin) AS statusAdmin, 
                 TYPE(orgStatusNetworkingPlatform) AS statusNetworkingPlatform,
                 LABELS(statusOrganization) AS statusOrganization,
                 collect({project: project, isProjectAdmin: isProjectAdmin,
                 statusAdmin: TYPE(projectStatusAdmin), 
                 statusNetworkingPlatform: TYPE(projectStatusNetworkingPlatform)}) AS projects`)
        .end({adminId: adminId})
        .send().then(function (resp) {
            handlingResponse(resp);
            return {organization: resp};
        });
};

module.exports = {
    getOverview: getOverview
};
