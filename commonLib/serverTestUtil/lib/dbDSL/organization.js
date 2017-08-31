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

let assignOrganizationToCategory = function (categoryAssignerId, data) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner {assignerId: {categoryAssignerId}})-[:ASSIGNED]->(np)`)
        .with(`assigner`)
        .match(`(category:Category)`)
        .where(`category.categoryId IN {categories}`)
        .createUnique(`(assigner)-[:ASSIGNED]->(category)`)
        .end({
            categoryAssignerId: categoryAssignerId, organizationId: data.organizationId,
            categories: data.categories, npId: data.npId
        }).getCommand());
};

let exportOrgToNp = function (data) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(org)-[:EXPORT]->(np)`)
        .end({
            organizationId: data.organizationId, npId: data.npId
        }).getCommand());
};

module.exports = {
    createOrganization: createOrganization,
    assignOrganizationToCategory: assignOrganizationToCategory,
    exportOrgToNp: exportOrgToNp
};