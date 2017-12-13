'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;
let _ = require('lodash');
let exportOrg = require('./exportOrg');
let exportEvent = require('./exportEvents');

let checkCategoryForNPExists = function (adminId, nps, databaseNpsConfig, req) {
    for (let npConfig of nps) {
        let databaseNpConfig = databaseNpsConfig
            .find(databaseNpConfig => databaseNpConfig.platformId === npConfig.platformId);
        if (_.difference(npConfig.org.categories, databaseNpConfig.categories).length > 0) {
            return exceptions.getInvalidOperation(`Admin ${adminId} adds invalid categories 
            ${npConfig.org.categories} to platform ${npConfig.platformId}`, logger, req);
        }
    }
};

let checkValidCategoryAssignment = function (adminId, nps, req) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(networkingPlatform:NetworkingPlatform {platformId: np.platformId})
                 -[:ORG_CATEGORY]->(usedCategory:Category)`)
        .return(`networkingPlatform.platformId AS platformId, collect(usedCategory.categoryId) AS categories`)
        .end({nps: nps}).send()
        .then(function (resp) {
            return checkCategoryForNPExists(adminId, nps, resp, req);
        });
};

let checkNotOriginalPlatformForExport = function (organizationId, nps, req) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(networkingPlatform:NetworkingPlatform {platformId: np.platformId})-[:CREATED]->
                (:Organization {organizationId: {organizationId}})`)
        .return(`networkingPlatform.platformId AS platformId`)
        .end({nps: nps, organizationId: organizationId}).send()
        .then(function (resp) {
            if (resp.length > 0) {
                return exceptions.getInvalidOperation(`Organization ${organizationId} can 
                not be exported to original platform`, logger, req);
            }
        });
};

let checkAllowedToEditConfig = async function (adminId, organizationId, nps, req) {

    function userNotAdmin(resp) {
        return resp.length === 0;
    }

    let resp = await db.cypher()
        .match("(org:Organization {organizationId: {organizationId}})<-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})")
        .return("org")
        .end({adminId: adminId, organizationId: organizationId}).send();

    if (userNotAdmin(resp)) {
        return exceptions.getInvalidOperation(`Not admin tries to get 
                config of organization ${organizationId}`, logger, req);
    }
    await checkValidCategoryAssignment(adminId, nps, req);
    await checkNotOriginalPlatformForExport(organizationId, nps, req);
};

let changeConfig = async function (adminId, params, req) {
    await checkAllowedToEditConfig(adminId, params.organizationId, params.nps, req);
    await exportOrg.changeConfig(params.organizationId, params.nps);
    await exportEvent.changeConfig(params.organizationId, params.nps);
};

module.exports = {
    changeConfig
};
