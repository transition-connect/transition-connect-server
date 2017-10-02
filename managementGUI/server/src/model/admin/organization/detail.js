'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;


let checkAllowedToGetDetail = function (adminId, organizationId, req) {

    function userNotAdmin(resp) {
        return resp.length === 0;
    }

    return db.cypher()
        .match(`(org:Organization {organizationId: {organizationId}})`)
        .where(`(org)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}}) OR 
                (org)<-[:CREATED]-(:NetworkingPlatform)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}}) OR
                (org)-[:EXPORT|EXPORT_REQUEST]->(:NetworkingPlatform)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}})`)
        .return("org")
        .end({adminId: adminId, organizationId: organizationId}).send()
        .then(function (resp) {
            if (userNotAdmin(resp)) {
                return exceptions.getInvalidOperation(`Not admin tries to get 
                config of organization ${organizationId}`, logger, req);
            }
        });
};

let setStatus = function (nps, orgModifiedTimestamp) {
    for (let np of nps) {
        if (np.exportType === 'EXPORT_REQUEST') {
            np.status = 'EXPORT_REQUESTED';
        } else if (!np.hasOwnProperty('exportTimestamp')) {
            np.status = 'NOT_EXPORTED';
        } else if (np.exportTimestamp < orgModifiedTimestamp ||
            np.exportTimestamp < np.lastConfigUpdate) {
            np.status = 'EXPORT_UPDATE_NEEDED';
        } else {
            np.status = 'EXPORTED';
        }
        delete np.exportType;
    }
};

let getOrganizationCommand = function (adminId, organizationId, language) {
    return db.cypher().match(`(np:NetworkingPlatform)-[:CREATED]->(org:Organization {organizationId: {organizationId}})`)
        .optionalMatch(`(np)<-[:ASSIGNED]-(assigner:CategoryAssigner)<-[:ASSIGNED]-(org)`)
        .with(`np, org, assigner`)
        .optionalMatch(`(assigner)-[:ASSIGNED]->(:Category)
                         -[categoryLanguage]->(categoryTranslated:CategoryTranslated)`)
        .where(`TYPE(categoryLanguage) = {language}`)
        .with(`np, org, categoryTranslated`)
        .orderBy(`categoryTranslated.name`)
        .with(`np, org, COLLECT(categoryTranslated.name) AS categories`)
        .optionalMatch(`(org)<-[:IS_ADMIN]-(admin:Admin)`)
        .with(`np, org, categories, admin`)
        .orderBy(`admin.email`)
        .return(`org.name AS name, org.slogan AS slogan, org.description AS description, org.website AS website,
                 org.created AS created, org.modified AS modified, np.name AS createdNetworkingPlatformName,
                 categories, COLLECT(admin.email) AS administrators,
                 EXISTS((org)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}})) AS isAdmin`)
        .end({adminId: adminId, organizationId: organizationId, language: language}).getCommand();
};

let getDetails = function (adminId, organizationId, language, req) {

    return checkAllowedToGetDetail(adminId, organizationId, req).then(function () {
        let commands = [];
        commands.push(getOrganizationCommand(adminId, organizationId, language));

        return db.cypher().match(`(np:NetworkingPlatform)<-[export:EXPORT|EXPORT_REQUEST]
                                   -(org:Organization {organizationId: {organizationId}})`)
            .with(`np, export, org`)
            .match(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(:Category)
                    -[categoryLanguage]->(categoryTranslated:CategoryTranslated)`)
            .where(`TYPE(categoryLanguage) = {language} AND (assigner)-[:ASSIGNED]->(np)`)
            .with(`np, export, org, categoryTranslated, assigner`)
            .orderBy(`categoryTranslated.name`)
            .return(`np.name AS name, np.description AS description, np.link AS link, TYPE(export) AS exportType,
                     export.exportTimestamp AS exportTimestamp, assigner.lastConfigUpdate AS lastConfigUpdate,
                     (EXISTS((np)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}})) AND TYPE(export) = 'EXPORT_REQUEST')
                     AS isAdminOfExportRequestedNp, COLLECT(categoryTranslated.name) AS categories,
                     np.platformId AS platformId`)
            .orderBy(`export.exportTimestamp DESC, np.name`)
            .end({adminId: adminId, organizationId: organizationId, language: language})
            .send(commands).then(function (resp) {
                setStatus(resp[1], resp[0][0].modified);
                return {organization: resp[0][0], exportedNetworkingPlatforms: resp[1]};
            });
    });
};

module.exports = {
    getDetails
};
