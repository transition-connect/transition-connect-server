'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createOrganization = function (organizationId, data) {
    data.name = data.name || `organization${organizationId}Name`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .createUnique(`(np)-[:CREATED {created: {created}}]->(org:Organization {organizationId: {organizationId}, name: {name}})`)
        .with(`org`)
        .match(`(admin:Admin)`)
        .where(`admin.adminId IN {adminIds}`)
        .createUnique(`(admin)-[:IS_ADMIN]->(org)`)
        .end({
            organizationId: organizationId, platformId: data.networkingPlatformId,
            name: data.name, adminIds: data.adminIds, created: data.created
        }).getCommand());
};

module.exports = {
    createOrganization: createOrganization
};