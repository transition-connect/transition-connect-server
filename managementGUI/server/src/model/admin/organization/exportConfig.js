'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;
let time = require('server-lib').time;
let _ = require('lodash');

let checkCategoryForNPExists = function (adminId, nps, databaseNpsConfig, req) {
    for (let npConfig of nps) {
        let databaseNpConfig = databaseNpsConfig
            .find(databaseNpConfig => databaseNpConfig.platformId === npConfig.platformId);
        if (_.difference(npConfig.categories, databaseNpConfig.categories).length > 0) {
            return exceptions.getInvalidOperation(`Admin ${adminId} adds invalid categories 
            ${npConfig.categories} to platform ${npConfig.platformId}`, logger, req);
        }
    }
};

let checkValidCategoryAssignment = function (adminId, nps, req) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(networkingPlatform:NetworkingPlatform {platformId: np.platformId})-[:CATEGORY]->
                (:SimilarCategoryMapper)-[:USED_CATEGORY]->(usedCategory:Category)`)
        .return(`networkingPlatform.platformId AS platformId, collect(usedCategory.categoryId) AS categories`)
        .end({nps: nps}).send()
        .then(function (resp) {
            return checkCategoryForNPExists(adminId, nps, resp, req);
        });
};

let checkAllowedToEditConfig = function (adminId, organizationId, nps, req) {

    function userNotAdmin(resp) {
        return resp.length === 0;
    }

    return db.cypher()
        .match("(org:Organization {organizationId: {organizationId}})<-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})")
        .return("org")
        .end({adminId: adminId, organizationId: organizationId}).send()
        .then(function (resp) {
            if (userNotAdmin(resp)) {
                return exceptions.getInvalidOperation(`Not admin tries to get 
                config of organization ${organizationId}`, logger, req);
            }
        }).then(function () {
            return checkValidCategoryAssignment(adminId, nps, req);
        });
};

/**
 * First Step: Delete all CategoryAssigner except the CategoryAssigner which belongs to the creator networking platform
 * of the organization. Second Step: Assign categories to CategoryAssigner.
 *
 * @param organizationId
 * @param nps
 * @returns {{statement, parameters, isWriteCommand}}
 */
let assignCategories = function (organizationId, nps) {
    return db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}})-[rel1:ASSIGNED]->(assigner:CategoryAssigner)
                 -[:ASSIGNED]->(networkingPlatform:NetworkingPlatform)`)
        .where(`NOT (org)<-[:CREATED]-(networkingPlatform)`)
        .match(`(assigner)-[rel2]->()`)
        .delete(`rel1, rel2, assigner`)
        .return(`NULL`).union()
        .unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}}), 
                (networkingPlatform:NetworkingPlatform {platformId: np.platformId})`)
        .where(`NOT (org)<-[:CREATED]-(networkingPlatform)`)
        .merge(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(networkingPlatform)`)
        .with(`np.categories AS categories, assigner`)
        .unwind(`categories AS categoryId`)
        .match(`(category:Category {categoryId: categoryId})`)
        .merge(`(assigner)-[:ASSIGNED]->(category)`)
        .return(`NULL`)
        .end({organizationId: organizationId, nps: nps}).getCommand();
};

let setExportRelationship = function (manuallyAcceptOrg, exportLabel, lastConfigUpdate, organizationId, nps) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}}), 
                (networkingPlatform:NetworkingPlatform {platformId: np.platformId})-[:EXPORT_RULES]->(rules:ExportRules)`)
        .where(`NOT (org)-[]->(networkingPlatform) AND rules.manuallyAcceptOrganization = ${manuallyAcceptOrg}`)
        .merge(`(org)-[${exportLabel}]->(networkingPlatform)`)
        .set(`org`, {lastConfigUpdate: lastConfigUpdate})
        .return(`NULL`).end({organizationId: organizationId, nps: nps}).getCommand();
};

let setExport = function (commands, organizationId, nps) {
    let lastConfigUpdate = time.getNowUtcTimestamp();
    commands.push(setExportRelationship('false', ':EXPORT', lastConfigUpdate, organizationId, nps));
    commands.push(setExportRelationship('true', ':EXPORT_REQUEST', lastConfigUpdate, organizationId, nps));
    return db.cypher().match(`(:Organization {organizationId: {organizationId}})
                              -[export:EXPORT|EXPORT_REQUEST]->(np:NetworkingPlatform)`)
        .where(`none(np2 IN {nps} WHERE np2.platformId = np.platformId)`)
        .delete(`export`)
        .end({organizationId: organizationId, nps: nps});
};


let changeConfig = function (adminId, params, req) {
    return checkAllowedToEditConfig(adminId, params.organizationId, params.nps, req).then(function () {
        let commands = [assignCategories(params.organizationId, params.nps)];
        return setExport(commands, params.organizationId, params.nps).send(commands);
    });
};

module.exports = {
    changeConfig
};
