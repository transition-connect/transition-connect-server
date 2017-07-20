'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createNetworkingPlatform = function (networkingPlatformId, data) {
    data.name = data.name || `nP${networkingPlatformId}Name`;
    data.adminId = data.adminId || `1`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(admin:Admin {adminId: {adminId}})`)
        .createUnique(`(:NetworkingPlatform {platformId: {platformId}, name: {name}})
                        <-[:IS_ADMIN]-(admin)`)
        .end({
            platformId: networkingPlatformId, adminId: data.adminId, name: data.name
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
    mapNetworkingPlatformToCategory
};