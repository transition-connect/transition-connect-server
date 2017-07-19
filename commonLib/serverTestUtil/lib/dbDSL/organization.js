'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');


let setStatusOrganization = function (organizationId, status) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(admin:Admin {adminId: {adminId}})-[:IS_ADMIN]->
                (:Organization {organizationId: {organizationId}})-[:STATUS]->(status:Status)`)
        .createUnique(`(admin)-[:${status.statusOrg}]->(status)`)
        .end({
            organizationId: organizationId, adminId: status.adminOrg
        }).getCommand());

};


let createOrganization = function (organizationId, data) {
    data.name = data.name || `organization${organizationId}Name`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(np:NetworkingPlatform {networkingPlatformId: {networkingPlatformId}})`)
        .createUnique(`(np)-[:CREATED]->(org:Organization {organizationId: {organizationId}, name: {name}})
        -[:STATUS]->(:Status)`)
        .with(`org`)
        .match(`(admin:Admin)`)
        .where(`admin.adminId IN {adminIds}`)
        .createUnique(`(admin)-[:IS_ADMIN]->(org)`)
        .end({
            organizationId: organizationId, networkingPlatformId: data.networkingPlatformId,
            name: data.name, adminIds: data.adminIds
        }).getCommand());
    if (data.status) {
        if (data.status.statusOrg) {
            setStatusOrganization(organizationId, data.status);
        }
    }
};

module.exports = {
    createOrganization: createOrganization
};