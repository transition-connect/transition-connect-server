'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;
let uuid = require('server-lib').uuid;

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


let changeConfig = function (adminId, params, req) {
    return checkAllowedToAccessConfig(adminId, params.organizationId, req).then(function () {
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
