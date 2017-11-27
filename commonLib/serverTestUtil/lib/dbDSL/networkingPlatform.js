'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createNetworkingPlatform = function (networkingPlatformId, data) {
    data.name = data.name || `nP${networkingPlatformId}Name`;
    data.description = data.description || `description${networkingPlatformId}`;
    data.link = data.link || `www.nplink${networkingPlatformId}.org`;
    data.adminIds = data.adminIds || [`1`];
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(admin:Admin)`)
        .where(`admin.adminId IN {adminIds}`)
        .merge(`(np:NetworkingPlatform {platformId: {platformId}, name: {name}, description: {description}, link: {link}})`)
        .merge(`(np)<-[:IS_ADMIN]-(admin)`)
        .end({
            platformId: networkingPlatformId, adminIds: data.adminIds, name: data.name, description: data.description,
            link: data.link
        }).getCommand());
};

let createNetworkingPlatformAdapterConfig = function (networkingPlatformId, data) {
    data.lastSync = data.lastSync || null;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .createUnique(`(np)-[:EXPORT_CONFIG]->(:ExportConfig {adapterType: {adapterType}, npApiUrl: {npApiUrl}, 
                lastSync: {lastSync}})`)
        .end({
            platformId: networkingPlatformId, adapterType: data.adapterType, npApiUrl: data.npApiUrl,
            lastSync: data.lastSync
        }).getCommand());
};

let createNetworkingPlatformExportRules = function (networkingPlatformId, data) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .merge(`(np)-[:EXPORT_RULES]->(:ExportRules {manuallyAcceptOrganization: {manuallyAcceptOrganization}})`)
        .end({
            platformId: networkingPlatformId, manuallyAcceptOrganization: data.manuallyAcceptOrganization
        }).getCommand());
};

let mapNetworkingPlatformToCategory = function (platformId, data) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .with(`np`)
        .match(`(category:Category)`)
        .where(`category.categoryId IN {categoryIds}`)
        .merge(`(np)-[:ORG_CATEGORY]->(category)`)
        .end({
            platformId: platformId, categoryIds: data.categoryIds
        }).getCommand());
};

module.exports = {
    createNetworkingPlatform,
    createNetworkingPlatformAdapterConfig,
    createNetworkingPlatformExportRules,
    mapNetworkingPlatformToCategory
};