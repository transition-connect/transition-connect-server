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

let setLastConfigUpdateOnCategoryAssigner = function (organizationId, nps) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}})-[:ASSIGNED]->(assigner:CategoryAssigner)
                 -[:ASSIGNED]->(networkingPlatform:NetworkingPlatform {platformId: np.platformId})`)
        .with(`np, assigner`)
        .match(`(assigner)-[:ASSIGNED]->(category:Category)`)
        .with(`np, assigner, category`)
        .orderBy(`category.categoryId`)
        .with(`np, assigner, collect(category.categoryId) AS categories`)
        .unwind(`np.org.categories AS category`)
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
        .with(`np.org.categories AS categories, assigner`)
        .unwind(`categories AS categoryId`)
        .match(`(category:Category {categoryId: categoryId})`)
        .merge(`(assigner)-[:ASSIGNED]->(category)`)
        .return(`NULL`)
        .end({organizationId: organizationId, nps: nps, now: time.getNowUtcTimestamp()}).getCommand();
};

let setExportRelationshipNotExportedOrg = function (manuallyAcceptOrg, exportLabel, lastConfigUpdate, organizationId, nps) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}}), 
                (networkingPlatform:NetworkingPlatform {platformId: np.platformId})-[:EXPORT_RULES]->(rules:ExportRules)`)
        .where(`NOT (org)-[]->(networkingPlatform) AND rules.manuallyAcceptOrganization = ${manuallyAcceptOrg}`)
        .merge(`(org)-[${exportLabel} {created: {created}}]->(networkingPlatform)`)
        .set(`org`, {lastConfigUpdate: lastConfigUpdate, created: time.getNowUtcTimestamp()})
        .return(`NULL`).end({organizationId: organizationId, nps: nps}).getCommand();
};

let setExportRelationshipPreviouslyExportedOrg = function (lastConfigUpdate, organizationId, nps) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}})-[deleteRequest:DELETE_REQUEST]->
                (npDb:NetworkingPlatform {platformId: np.platformId})`)
        .set(`org`, {lastConfigUpdate: lastConfigUpdate})
        .merge(`(org)-[:EXPORT {created: {created}, id: deleteRequest.id,
                       lastExportTimestamp: deleteRequest.lastExportTimestamp}]->(npDb)`)
        .delete(`deleteRequest`)
        .return(`NULL`).end({organizationId: organizationId, nps: nps, created: time.getNowUtcTimestamp()}).getCommand();
};

let setExportRelationshipPreviouslyDeletedOrg = function (lastConfigUpdate, organizationId, nps) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}})-[deleteRequest:DELETE_REQUEST_SUCCESS]->
                (npDb:NetworkingPlatform {platformId: np.platformId})`)
        .set(`org`, {lastConfigUpdate: lastConfigUpdate})
        .merge(`(org)-[:EXPORT {created: {created}}]->(npDb)`)
        .delete(`deleteRequest`)
        .return(`NULL`).end({organizationId: organizationId, nps: nps, created: time.getNowUtcTimestamp()}).getCommand();
};

let deleteExportedOrganizations = function (organizationId, nps) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})
                              -[export:EXPORT|EXPORT_REQUEST]->(np:NetworkingPlatform)`)
        .where(`none(np2 IN {nps} WHERE np2.platformId = np.platformId) AND EXISTS(export.lastExportTimestamp)`)
        .merge(`(org)-[:DELETE_REQUEST {id: export.id, lastExportTimestamp: export.lastExportTimestamp, 
                 created: export.created}]->(np)`)
        .delete(`export`)
        .end({organizationId: organizationId, nps: nps}).getCommand();
};

let deleteNotExportedOrganizations = function (organizationId, nps) {
    return db.cypher().match(`(:Organization {organizationId: {organizationId}})
                              -[export:EXPORT|EXPORT_REQUEST]->(np:NetworkingPlatform)`)
        .where(`none(np2 IN {nps} WHERE np2.platformId = np.platformId) AND NOT EXISTS(export.lastExportTimestamp)`)
        .delete(`export`)
        .end({organizationId: organizationId, nps: nps});
};

let setExport = function (commands, organizationId, nps) {
    let lastConfigUpdate = time.getNowUtcTimestamp();
    commands.push(setExportRelationshipNotExportedOrg('false', ':EXPORT', lastConfigUpdate, organizationId, nps));
    commands.push(setExportRelationshipNotExportedOrg('true', ':EXPORT_REQUEST', lastConfigUpdate, organizationId, nps));
    commands.push(setExportRelationshipPreviouslyExportedOrg(lastConfigUpdate, organizationId, nps));
    commands.push(setExportRelationshipPreviouslyDeletedOrg(lastConfigUpdate, organizationId, nps));
    commands.push(deleteExportedOrganizations(organizationId, nps));
    return deleteNotExportedOrganizations(organizationId, nps);
};


let changeConfig = async function (adminId, params, req) {
    await checkAllowedToEditConfig(adminId, params.organizationId, params.nps, req);
    let commands = [
        setLastConfigUpdateOnCategoryAssigner(params.organizationId, params.nps),
        assignCategories(params.organizationId, params.nps)];
    return await setExport(commands, params.organizationId, params.nps).send(commands);
};

module.exports = {
    changeConfig
};
