'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;


let checkAllowedToGetNpInfo= function (adminId, platformId, req) {

    function userNotAdmin(resp) {
        return resp.length === 0;
    }

    return db.cypher()
        .match("(np:NetworkingPlatform {platformId: {platformId}})<-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})")
        .return("np")
        .end({adminId: adminId, platformId: platformId}).send()
        .then(function (resp) {
            if (userNotAdmin(resp)) {
                return exceptions.getInvalidOperation(`User ${adminId} with no admin rights tries to access 
                info of networking platform ${platformId}`, logger, req);
            }
        });
};

module.exports = {
    checkAllowedToGetNpInfo
};
