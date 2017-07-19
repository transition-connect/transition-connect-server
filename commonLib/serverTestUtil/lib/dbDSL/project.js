'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let setStatusProject = function (projectId, status) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(admin:Admin {adminId: {adminId}})-[:IS_ADMIN]->
                (:Project {projectId: {projectId}})-[:STATUS]->(status:Status)`)
        .createUnique(`(admin)-[:${status.statusProject}]->(status)`)
        .end({
            projectId: projectId, adminId: status.adminProject
        }).getCommand());

};

let createProject = function (projectId, data) {
    data.name = data.name || `project${projectId}Name`;
    data.adminIds = data.adminIds || [`1`];
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(organisation:Organization {organizationId: {organizationId}})`)
        .createUnique(`(organisation)-[:HAS]->(project:Project {projectId: {projectId}, name: {name}, created: {created}})
        -[:STATUS]->(:Status)`)
        .with(`project`)
        .match(`(admin:Admin)`)
        .where(`admin.adminId IN {adminIds}`)
        .createUnique(`(admin)-[:IS_ADMIN]->(project)`)
        .end({
            projectId: projectId, organizationId: data.organizationId, adminIds: data.adminIds, name: data.name,
            created: data.created
        }).getCommand());
    if (data.status) {
        if (data.status.statusProject) {
            setStatusProject(projectId, data.status);
        }
    }
};

module.exports = {
    createProject: createProject
};