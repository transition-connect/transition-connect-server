'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;

let checkAllowedToSetExportRequest = function (adminId, organizationId, platformId, req) {

    function userNotAdmin(resp) {
        return resp.length === 0;
    }

    return db.cypher()
        .match("(np:NetworkingPlatform {platformId: {platformId}})<-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})")
        .return("np")
        .end({adminId: adminId, platformId: platformId}).send()
        .then(function (resp) {
            if (userNotAdmin(resp)) {
                return exceptions.getInvalidOperation(`User ${adminId} with no admin permissions for np ${platformId} 
                tries to set export request for organization ${organizationId}`, logger, req);
            }
        });
};


let setExport = function (organizationId, platformId, accept) {
    let exportLabel = () => accept ? ':EXPORT' : ':EXPORT_DENIED';
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})
                              -[export:EXPORT_REQUEST|EXPORT_DENIED|EXPORT]->
                              (np:NetworkingPlatform {platformId: {platformId}})`)
        .delete(`export`)
        .with(`org, np`)
        .merge(`(org)-[${exportLabel()}]->(np)`)
        .end({organizationId: organizationId, platformId: platformId, accept: accept});
};


let setExportRequest = function (adminId, params, req) {
    return checkAllowedToSetExportRequest(adminId, params.organizationId, params.platformId, req).then(function () {
        return setExport(params.organizationId, params.platformId, params.accept).send();
    });
};

module.exports = {
    setExportRequest
};
