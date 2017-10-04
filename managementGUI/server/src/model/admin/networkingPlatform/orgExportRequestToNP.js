'use strict';

let db = require('server-lib').neo4j;
let security = require(`./secuity`);

let getNumberOfOrgCommand = function (platformId, maxTime) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})<-[export:EXPORT_REQUEST]-(:Organization)`)
        .where(`export.created <= {maxTime}`)
        .return(`count (*) AS numberOfOrg`)
        .end({platformId: platformId, maxTime: maxTime});
};

let getOrgCommand = function (platformId, skip, limit, maxTime) {
    return db.cypher()
        .match(`(:NetworkingPlatform {platformId: {platformId}})<-[request:EXPORT_REQUEST]-(org:Organization)`)
        .where(`request.created <= {maxTime}`)
        .return(`org.name AS name, org.organizationId AS organizationId, request.created AS created`)
        .orderBy(`created DESC`)
        .skip("{skip}")
        .limit("{limit}")
        .end({platformId: platformId, skip: skip, limit: limit, maxTime: maxTime});
};

let getOrg = function (adminId, params, req) {
    return security.checkAllowedToGetNpInfo(adminId, params.platformId, req).then(function () {
        return getOrgCommand(params.platformId, params.skip, params.limit, params.maxTime).send()
            .then(function (resp) {
                return {org: resp};
            });
    });
};

module.exports = {
    getNumberOfOrgCommand,
    getOrgCommand,
    getOrg
};
