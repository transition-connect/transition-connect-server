'use strict';

let db = require('server-lib').neo4j;
let notification = require('./notification');

let getOrganizations = function (adminId) {
    return db.cypher().match(`(np:NetworkingPlatform)-[:CREATED]->(org:Organization)
                               <-[:IS_ADMIN]-(:Admin {adminId: {adminId}})`)
        .return(`org.name AS name, org.created AS created, org.organizationId AS organizationId, 
                 np.name AS nameNetworkingPlatform`)
        .orderBy(`created DESC`)
        .end({adminId: adminId}).getCommand();
};

let getDashboard = function (adminId) {
    let commands = [
        notification.getInitOrganisationNotification(adminId),
        notification.getAcceptOrgNotification(adminId),
        notification.getDeletedOrganisationNotification(adminId),
        getOrganizations(adminId)];
    return db.cypher().match(`(np:NetworkingPlatform)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}})`)
        .return(`np.name AS name, np.platformId AS platformId`)
        .orderBy(`name`)
        .end({adminId: adminId})
        .send(commands).then(function (resp) {
            return {
                notification: notification.getNotificationResponse(resp[0],
                    resp[1], resp[2]), organization: resp[3], nps: resp[4]
            };
        });
};

module.exports = {
    getDashboard
};
