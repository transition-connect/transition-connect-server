'use strict';

let db = require('server-lib').neo4j;
let security = require('./../secuity');

let getConfig = function (adminId, platformId, req) {

    return security.checkAllowedToGetNpInfo(adminId, platformId, req).then(function () {

        return db.cypher().match(`(rules:ExportRules)<-[:EXPORT_RULES]-
             (np:NetworkingPlatform {platformId: {platformId}})<-[:IS_ADMIN]-(admin:Admin)`)
            .with(`rules, np, admin`)
            .orderBy(`admin.email`)
            .return(`{name: np.name, description: np.description, link: np.link,
                     manuallyAcceptOrganization: rules.manuallyAcceptOrganization} AS config, 
                     COLLECT(admin.email) AS administrators`)
            .end({platformId: platformId})
            .send().then(function (resp) {
                return {np: resp[0]};
            });
    });
};

module.exports = {
    getConfig
};
