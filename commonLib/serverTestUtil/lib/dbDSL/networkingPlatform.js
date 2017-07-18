'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createNetworkingPlatform = function (networkingPlatformId, data) {
    data.name = data.name || `nP${networkingPlatformId}Name`;
    data.adminId = data.adminId || `1`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(admin:Admin {adminId: {adminId}})`)
        .createUnique(`(:NetworkingPlatform {networkingPlatformId: {networkingPlatformId}, name: {name}})
                        <-[:IS_ADMIN]-(admin)`)
        .end({
            networkingPlatformId: networkingPlatformId, adminId: data.adminId, name: data.name
        }).getCommand());
};

module.exports = {
    createNetworkingPlatform: createNetworkingPlatform
};