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

module.exports = {
    checkAllowedToAccessConfig
};
