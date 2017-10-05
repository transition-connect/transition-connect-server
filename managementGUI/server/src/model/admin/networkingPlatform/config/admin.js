'use strict';

let db = require('server-lib').neo4j;
let uuid = require('server-lib').uuid;
let security = require('./../secuity');

let changeConfig = function (adminId, params, req) {
    return security.checkAllowedToGetNpInfo(adminId, params.platformId, req).then(function () {
        return db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})`)
            .optionalMatch(`(np)<-[isAdmin:IS_ADMIN]-(:Admin)`)
            .with(`np, isAdmin`)
            .delete(`isAdmin`)
            .with(`DISTINCT np`)
            .unwind(`{admins} AS adminEmail`)
            .merge(`(admin:Admin {email: toLower(adminEmail)})`)
            .onCreate(`SET admin.adminId = {uuid}`)
            .merge(`(np)<-[:IS_ADMIN]-(admin)`)
            .end({
                platformId: params.platformId, admins: params.admins,
                uuid: uuid.generateUUID()
            }).send();
    });
};

module.exports = {
    changeConfig
};
