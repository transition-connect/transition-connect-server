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
        }).then(function () {
            return checkNotOriginalPlatformForExport(organizationId, nps, req);
        });
};

let setLastConfigUpdateOnCategoryAssigner = function (organizationId, nps) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}})-[:ASSIGNED]->(assigner:CategoryAssigner)
                 -[:ASSIGNED]->(networkingPlatform:NetworkingPlatform {platformId: np.platformId})`)
        .with(`np, assigner`)
        .match(`(assigner)-[:ASSIGNED]->(category:Category)`)
        .with(`np, assigner, category`)
        .orderBy(`category.categoryId`)
        .with(`np, assigner, collect(category.categoryId) AS categories`)
        .unwind(`np.categories AS category`)
        .with(`np, assigner, category, categories`)
        .orderBy(`category`)
        .with(`np, assigner, categories, collect(category) AS npCategories`)
        .where(`categories <> npCategories`)
        .set(`assigner`, {lastConfigUpdate: time.getNowUtcTimestamp()})
        .end({organizationId: organizationId, nps: nps}).getCommand();
};

/**
 * First Step: Delete all categories of CategoryAssigner except the categories of the CategoryAssigner
 * which belongs to the creator networking platform of the organization.
 * Second Step: Assign categories to CategoryAssigner.
 *
 * @param organizationId
 * @param nps
 * @returns Promise
 */
let assignCategories = function (organizationId, nps) {
    return db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}})-[:ASSIGNED]->(assigner:CategoryAssigner)
                 -[:ASSIGNED]->(networkingPlatform:NetworkingPlatform)`)
        .where(`NOT (org)<-[:CREATED]-(networkingPlatform)`)
        .match(`(assigner)-[rel]->(:Category)`)
        .delete(`rel`)
        .return(`NULL`).union()
        .unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}}), 
                (networkingPlatform:NetworkingPlatform {platformId: np.platformId})`)
        .where(`NOT (org)<-[:CREATED]-(networkingPlatform)`)
        .merge(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(networkingPlatform)`)
        .onCreate(`SET assigner.lastConfigUpdate = {now}`)
        .with(`np.categories AS categories, assigner`)
        .unwind(`categories AS categoryId`)
        .match(`(category:Category {categoryId: categoryId})`)
        .merge(`(assigner)-[:ASSIGNED]->(category)`)
        .return(`NULL`)
        .end({organizationId: organizationId, nps: nps, now: time.getNowUtcTimestamp()}).getCommand();
};

let setExportRelationship = function (manuallyAcceptOrg, exportLabel, lastConfigUpdate, organizationId, nps) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}}), 
                (networkingPlatform:NetworkingPlatform {platformId: np.platformId})-[:EXPORT_RULES]->(rules:ExportRules)`)
        .where(`NOT (org)-[]->(networkingPlatform) AND rules.manuallyAcceptOrganization = ${manuallyAcceptOrg}`)
        .merge(`(org)-[${exportLabel} {created: {created}}]->(networkingPlatform)`)
        .set(`org`, {lastConfigUpdate: lastConfigUpdate, created: time.getNowUtcTimestamp()})
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
        let commands = [
            setLastConfigUpdateOnCategoryAssigner(params.organizationId, params.nps),
            assignCategories(params.organizationId, params.nps)];
        return setExport(commands, params.organizationId, params.nps).send(commands);
    });
};

module.exports = {
    changeConfig
};
