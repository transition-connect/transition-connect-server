'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;


let checkAllowedToGetDetail = function (adminId, platformId, req) {

    function userNotAdmin(resp) {
        return resp.length === 0;
    }

    return db.cypher()
        .match("(np:NetworkingPlatform {platformId: {platformId}})<-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})")
        .return("np")
        .end({adminId: adminId, platformId: platformId}).send()
        .then(function (resp) {
            if (userNotAdmin(resp)) {
                return exceptions.getInvalidOperation(`Not admin tries to get 
                config of networking platform ${platformId}`, logger, req);
            }
        });
};

let getDetails = function (adminId, platformId, language, req) {

    return checkAllowedToGetDetail(adminId, platformId, req).then(function () {

        return db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                                   <-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})`)
            .optionalMatch(`(np)-[:CATEGORY]->(:SimilarCategoryMapper)-[:USED_CATEGORY]->(:Category)
                             -[categoryLanguage]->(categoryTranslated:CategoryTranslated)`)
            .where(`TYPE(categoryLanguage) = {language}`)
            .with(`np, categoryTranslated`)
            .orderBy(`categoryTranslated.name`)
            .return(`np.name AS name, np.description AS description, np.link AS link,
                     COLLECT(categoryTranslated.name) AS categories`)
            .end({adminId: adminId, platformId: platformId, language: language})
            .send().then(function (resp) {
                return {np: resp[0]};
            });
    });
};

module.exports = {
    getDetails
};
