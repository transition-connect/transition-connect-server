'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createOrganization = function (organizationId, data) {
    data.name = data.name || `organization${organizationId}Name`;
    data.description = data.description || `org${organizationId}description`;
    data.website = data.website || `www.link${organizationId}.org`;
    data.slogan = data.slogan || `best${organizationId}Org`;
    data.language = data.language || `de`;
    data.eventsImportConfiguration = data.eventsImportConfiguration || null;
    data.organizationIdOnExternalNP = data.organizationIdOnExternalNP || `externalId${organizationId}`;
    data.modifiedOnNp = data.modifiedOnNp || data.created;
    data.modified = data.modified || data.created;
    data.lastConfigUpdate = data.lastConfigUpdate || null;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .createUnique(`(np)-[:CREATED]->(org:Organization {organizationId: {organizationId}, name: {name}, 
                       description: {description}, slogan: {slogan}, website: {website}, language: {language},
                       created: {created}, modified: {modified}, modifiedOnNp: {modifiedOnNp}, lastConfigUpdate: {lastConfigUpdate},
                       organizationIdOnExternalNP: {organizationIdOnExternalNP}, 
                       eventsImportConfiguration: {eventsImportConfiguration}})`)
        .with(`org`)
        .match(`(admin:Admin)`)
        .where(`admin.adminId IN {adminIds}`)
        .createUnique(`(admin)-[:IS_ADMIN]->(org)`)
        .end({
            organizationId: organizationId, platformId: data.networkingPlatformId,
            name: data.name, adminIds: data.adminIds, created: data.created, modified: data.modified, modifiedOnNp: data.modifiedOnNp,
            lastConfigUpdate: data.lastConfigUpdate, organizationIdOnExternalNP: data.organizationIdOnExternalNP,
            description: data.description, website: data.website, slogan: data.slogan, language: data.language,
            eventsImportConfiguration: data.eventsImportConfiguration
        }).getCommand());
};

let assignOrganizationToCategory = function (data) {
    data.lastConfigUpdate = data.lastConfigUpdate || 500;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .merge(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner {lastConfigUpdate: {lastConfigUpdate}})-[:ASSIGNED]->(np)`)
        .with(`assigner`)
        .match(`(category:Category)`)
        .where(`category.categoryId IN {categories}`)
        .createUnique(`(assigner)-[:ASSIGNED]->(category)`)
        .end({
            organizationId: data.organizationId, lastConfigUpdate: data.lastConfigUpdate,
            categories: data.categories, npId: data.npId
        }).getCommand());
};

let exportOrgToNp = function (data) {
    data.created = data.created || 500;
    data.lastExportTimestamp = data.lastExportTimestamp || null;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(org)-[:EXPORT {lastExportTimestamp: {lastExportTimestamp}, created: {created}}]->(np)`)
        .end({
            organizationId: data.organizationId, npId: data.npId, lastExportTimestamp: data.lastExportTimestamp,
            created: data.created
        }).getCommand());
};

let exportRequestOrgToNp = function (data) {
    data.created = data.created || 500;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(org)-[:EXPORT_REQUEST {created: {created}}]->(np)`)
        .end({
            organizationId: data.organizationId, npId: data.npId, created: data.created
        }).getCommand());
};

let exportDenyOrgToNp = function (data) {
    data.created = data.created || 500;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}}), (np:NetworkingPlatform {platformId: {npId}})`)
        .createUnique(`(org)-[:EXPORT_DENIED {created: {created}}]->(np)`)
        .end({
            organizationId: data.organizationId, npId: data.npId, created: data.created
        }).getCommand());
};

module.exports = {
    createOrganization,
    assignOrganizationToCategory,
    exportOrgToNp,
    exportRequestOrgToNp,
    exportDenyOrgToNp
};