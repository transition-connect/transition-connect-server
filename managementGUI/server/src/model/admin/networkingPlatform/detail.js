'use strict';

let db = require('server-lib').neo4j;
let security = require(`./secuity`);
let time = require('server-lib').time;
let orgCreatedByNp = require('./orgCreatedByNp');
let orgExportedToNp = require('./orgExportedToNp');
let orgExportRequestToNp = require('./orgExportRequestToNp');
let orgDeniedExportToNp = require('./orgDeniedExportToNp');


let getNetworkingPlatformInfo = function (platformId, language) {
    return db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .optionalMatch(`(np)-[:ORG_CATEGORY]->(:Category)
                        -[categoryLanguage]->(categoryTranslated:CategoryTranslated)`)
        .where(`TYPE(categoryLanguage) = {language}`)
        .with(`np, categoryTranslated`)
        .orderBy(`categoryTranslated.name`)
        .return(`np.name AS name, np.description AS description, np.link AS link,
                     COLLECT(categoryTranslated.name) AS categories`)
        .end({platformId: platformId, language: language}).getCommand();
};

let getDetails = function (adminId, platformId, language, req) {

    return security.checkAllowedToGetNpInfo(adminId, platformId, req).then(function () {

        let maxTime = time.getNowUtcTimestamp(), commands = [
            getNetworkingPlatformInfo(platformId, language),
            orgExportedToNp.getOrgCommand(platformId, 0, 10, maxTime).getCommand(),
            orgExportedToNp.getNumberOfOrgCommand(platformId, maxTime).getCommand(),
            orgExportRequestToNp.getOrgCommand(platformId, 0, 10, maxTime).getCommand(),
            orgExportRequestToNp.getNumberOfOrgCommand(platformId, maxTime).getCommand(),
            orgDeniedExportToNp.getOrgCommand(platformId, 0, 10, maxTime).getCommand(),
            orgDeniedExportToNp.getNumberOfOrgCommand(platformId, maxTime).getCommand(),
            orgCreatedByNp.getNumberOfOrgCommand(platformId, maxTime).getCommand()
        ];

        return orgCreatedByNp.getOrgCommand(platformId, 0, 10, maxTime)
            .send(commands).then(function (resp) {
                resp[0][0].requestTimestamp = maxTime;
                return {
                    np: resp[0][0], orgExportedToNp: resp[1],
                    numberOfOrgExportedToNp: resp[2][0].numberOfOrg,
                    orgRequestedExportToNp: resp[3],
                    numberOfOrgRequestedExportToNp: resp[4][0].numberOfOrg,
                    orgDeniedExportToNp: resp[5],
                    numberOfOrgDeniedExportToNp: resp[6][0].numberOfOrg,
                    numberOfOrgCreatedByNp: resp[7][0].numberOfOrg, orgCreatedByNp: resp[8]
                };
            });
    });
};

module.exports = {
    getDetails
};
