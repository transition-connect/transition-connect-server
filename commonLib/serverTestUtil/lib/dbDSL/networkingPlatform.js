'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createNetworkingPlatform = function (networkingPlatformId, data) {
    data.name = data.name || `nP${networkingPlatformId}Name`;
    data.description = data.description || `description${networkingPlatformId}`;
    data.link = data.link || `www.nplink${networkingPlatformId}.org`;
    data.adminId = data.adminId || `1`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(admin:Admin {adminId: {adminId}})`)
        .createUnique(`(:NetworkingPlatform {platformId: {platformId}, name: {name}, description: {description}, 
                        link: {link}})
                        <-[:IS_ADMIN]-(admin)`)
        .end({
            platformId: networkingPlatformId, adminId: data.adminId, name: data.name, description: data.description,
            link: data.link
        }).getCommand());
};

let createNetworkingPlatformExportRules = function (networkingPlatformId, data) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .create(`(np)-[:EXPORT_RULES]->(:ExportRules {manuallyAcceptOrganization: {manuallyAcceptOrganization}})`)
        .end({
            platformId: networkingPlatformId, manuallyAcceptOrganization: data.manuallyAcceptOrganization
        }).getCommand());
};

let mapNetworkingPlatformToCategory = function (mappingId, data) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .createUnique(`(np)-[:CATEGORY]->(mapper:SimilarCategoryMapper {mapperId: {mappingId}})`)
        .with(`mapper`)
        .match(`(usedCategory:Category {categoryId: {usedCategoryId}})`)
        .createUnique(`(mapper)-[:USED_CATEGORY]->(usedCategory)`)
        .with(`mapper`)
        .match(`(similarCategory:Category)`)
        .where(`similarCategory.categoryId IN {similarCategoryIds}`)
        .createUnique(`(mapper)-[:SIMILAR_CATEGORY]->(similarCategory)`)
        .end({
            mappingId: mappingId, platformId: data.npId, usedCategoryId: data.usedCategoryId,
            similarCategoryIds: data.similarCategoryIds
        }).getCommand());
};

module.exports = {
    createNetworkingPlatform,
    createNetworkingPlatformExportRules,
    mapNetworkingPlatformToCategory
};