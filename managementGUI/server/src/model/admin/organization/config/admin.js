'use strict';

let db = require('server-lib').neo4j;
let uuid = require('server-lib').uuid;
let security = require('./secuity');

let changeConfig = function (adminId, params, req) {
    return security.checkAllowedToAccessConfig(adminId, params.organizationId, req).then(function () {
        return db.cypher().match(`(org:Organization {organizationId: {organizationId}})`)
            .optionalMatch(`(org)<-[isAdmin:IS_ADMIN]-(:Admin)`)
            .with(`org, isAdmin`)
            .delete(`isAdmin`)
            .with(`DISTINCT org`)
            .unwind(`{admins} AS adminEmail`)
            .merge(`(admin:Admin {email: toLower(adminEmail)})`)
            .onCreate(`SET admin.adminId = {uuid}`)
            .merge(`(org)<-[:IS_ADMIN]-(admin)`)
            .end({
                organizationId: params.organizationId, admins: params.admins,
                uuid: uuid.generateUUID()
            }).send();
    });
};

module.exports = {
    changeConfig
};
