'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createOrganization = function (organizationId, data) {
    data.name = data.name || `organization${organizationId}Name`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .create(`(:Organization {organizationId: {organizationId}, name: {name}})`)
        .end({
            organizationId: organizationId, name: data.name
        }).getCommand());
};

let setAdmin = function (organizationId, adminIds) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(admin:Admin), (org:Organization {organizationId: {organizationId}})`)
        .where(`admin.adminId IN {adminIds}`)
        .createUnique(`(admin)-[:IS_ADMIN]->(org)`)
        .end({
            organizationId: organizationId, adminIds: adminIds
        }).getCommand());
};

module.exports = {
    createOrganization: createOrganization,
    setAdmin: setAdmin
};