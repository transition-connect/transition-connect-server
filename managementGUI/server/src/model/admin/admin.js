'use strict';

let db = require('server-lib').neo4j;
let todo = require('./todo');

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
        todo.getInitOrganisationTodo(adminId),
        todo.getAcceptOrgTodo(adminId),
        getOrganizations(adminId)];
    return db.cypher().match(`(np:NetworkingPlatform)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}})`)
        .return(`np.name AS name, np.platformId AS platformId`)
        .orderBy(`name`)
        .end({adminId: adminId})
        .send(commands).then(function (resp) {
            return {todo: todo.getTodoResponse(resp[0], resp[1]), organization: resp[2], nps: resp[3]};
        });
};

module.exports = {
    getDashboard
};
