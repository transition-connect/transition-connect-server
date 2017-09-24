'use strict';

let db = require('server-lib').neo4j;

let getTodoResponse = function (todos) {
    let resultTodos = [];
    for (let todo of todos) {
        let resultTodo = {action: todo.action, actionData: {}};
        resultTodo.actionData.organizationName = todo.org.name;
        resultTodo.actionData.organizationId = todo.org.organizationId;
        resultTodo.actionData.nameNetworkingPlatform = todo.np.name;
        resultTodos.push(resultTodo);
    }
    return resultTodos;
};

let getTodo = function (adminId) {
    return db.cypher().match(`(np:NetworkingPlatform)-[:CREATED]->(org:Organization)<-[:IS_ADMIN]
                              -(:Admin {adminId: {adminId}})`)
        .where(`NOT EXISTS(org.lastConfigUpdate)`)
        .return(`np, org, 'INIT_ORGANISATION' AS action`)
        .end({adminId: adminId}).getCommand();
};

let getOrganizations = function (adminId) {
    return db.cypher().match(`(np:NetworkingPlatform)-[:CREATED]->(org:Organization)
                               <-[:IS_ADMIN]-(:Admin {adminId: {adminId}})`)
        .return(`org.name AS name, org.created AS created, org.organizationId AS organizationId, 
                 np.name AS nameNetworkingPlatform`)
        .orderBy(`created DESC`)
        .end({adminId: adminId}).getCommand();
};

let getDashboard = function (adminId) {
    let commands = [];
    commands.push(getTodo(adminId));
    commands.push(getOrganizations(adminId));
    return db.cypher().match(`(np:NetworkingPlatform)<-[:IS_ADMIN]-(:Admin {adminId: {adminId}})`)
        .return(`np.name AS name, np.platformId AS platformId`)
        .orderBy(`name`)
        .end({adminId: adminId})
        .send(commands).then(function (resp) {
            return {todo: getTodoResponse(resp[0]), organization: resp[1], nps: resp[2]};
        });
};

module.exports = {
    getDashboard: getDashboard
};
