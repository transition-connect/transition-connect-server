'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createProject = function (projectId, data) {
    data.name = data.name || `project${projectId}Name`;
    data.adminId = data.adminId || `1`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(organisation:Organization {organizationId: {organizationId}}), (admin:Admin {adminId: {adminId}})`)
        .createUnique(`(organisation)-[:HAS]->(:Project {projectId: {projectId}, name: {name}, created: {created}})<-[:IS_ADMIN]-(admin)`)
        .end({
            projectId: projectId, organizationId: data.organizationId, adminId: data.adminId, name: data.name,
            created: data.created
        }).getCommand());
};

module.exports = {
    createProject: createProject
};