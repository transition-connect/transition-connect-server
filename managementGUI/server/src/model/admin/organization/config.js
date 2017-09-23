'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;


let checkAllowedToAccessConfig = function (adminId, organizationId, req) {

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
        });
};

let getOrganizationCommand = function (organizationId) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})`)
        .optionalMatch(`(org)<-[:IS_ADMIN]-(admin:Admin)`)
        .with(`org, admin`)
        .orderBy(`admin.email`)
        .return(`org.name AS name, COLLECT(admin.email) AS administrators`)
        .end({organizationId: organizationId}).getCommand();
};

let getConfig = function (adminId, organizationId, language, req) {

    return checkAllowedToAccessConfig(adminId, organizationId, req).then(function () {
        let commands = [];
        commands.push(getOrganizationCommand(organizationId));

        return db.cypher().match(`(np:NetworkingPlatform)`)
            .where(`NOT (np)-[:CREATED]->(:Organization {organizationId: {organizationId}})`)
            .with(`np`)
            .match(`(np)-[:CATEGORY]->(:SimilarCategoryMapper)-[:USED_CATEGORY]->
                    (category:Category)-[categoryLanguage]->(categoryTranslated:CategoryTranslated)`)
            .where(`TYPE(categoryLanguage) = {language}`)
            .optionalMatch(`(:Organization {organizationId: {organizationId}})-[:ASSIGNED]->(assigner:CategoryAssigner)
                             -[:ASSIGNED]->(np:NetworkingPlatform)`)
            .with(`np, assigner, category, categoryTranslated`)
            .orderBy(`categoryTranslated.name`)
            .match(`(org:Organization {organizationId: {organizationId}})`)
            .return(`np.name AS name, np.description AS description, np.link AS link, np.platformId AS platformId, 
                     EXISTS((org)-[:EXPORT]->(np)) AS isExported,
                     COLLECT({name: categoryTranslated.name, categoryId: category.categoryId, 
                     isSelected: EXISTS((assigner)-[:ASSIGNED]->(category))}) AS categories`)
            .orderBy(`isExported DESC`)
            .end({adminId: adminId, organizationId: organizationId, language: language})
            .send(commands).then(function (resp) {
                return {organization: resp[0][0], networkingPlatforms: resp[1]};
            });
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
        .return(`NULL AS dummy`)
        .union()
        .unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}}), 
                (networkingPlatform:NetworkingPlatform {platformId: np.platformId})`)
        .where(`NOT (org)<-[:CREATED]-(networkingPlatform)`)
        .merge(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(networkingPlatform)`)
        .with(`np.categories AS categories, assigner`)
        .unwind(`categories AS categoryId`)
        .match(`(category:Category {categoryId: categoryId})`)
        .merge(`(assigner)-[:ASSIGNED]->(category)`)
        .return(`NULL AS dummy`)
        .end({organizationId: organizationId, nps: nps}).getCommand();
};

let setExport = function (organizationId, nps) {
    return db.cypher().unwind(`{nps} AS np`)
        .match(`(org:Organization {organizationId: {organizationId}}), 
                    (networkingPlatform:NetworkingPlatform {platformId: np.platformId})`)
        .where(`NOT (org)-[]->(networkingPlatform)`)
        .merge(`(org)-[:EXPORT]->(networkingPlatform)`)
        .end({organizationId: organizationId, nps: nps});
};


let changeConfig = function (adminId, params, req) {
    return checkAllowedToAccessConfig(adminId, params.organizationId, req).then(function () {
        let commands = [];
        commands.push(assignCategories(params.organizationId, params.nps));
        return setExport(params.organizationId, params.nps)
            .send(commands);
    });
};

module.exports = {
    getConfig,
    changeConfig
};
