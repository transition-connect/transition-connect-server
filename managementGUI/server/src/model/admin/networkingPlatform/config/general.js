'use strict';

let db = require('server-lib').neo4j;
let security = require('./../secuity');

let changeConfig = function (adminId, params, req) {
    return security.checkAllowedToGetNpInfo(adminId, params.platformId, req).then(function () {
        return db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})-[:EXPORT_RULES]->(rules:ExportRules)`)
            .set(`np`, {description: params.description, link: params.link})
            .set(`rules`, {manuallyAcceptOrganization: params.manuallyAcceptOrganization})
            .end({platformId: params.platformId}).send();
    });
};

module.exports = {
    changeConfig
};
