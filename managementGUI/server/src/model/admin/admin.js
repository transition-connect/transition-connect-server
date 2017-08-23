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
    return db.cypher().match(`(np:NetworkingPlatform)-[:CREATED]->(org:Organization)<-[isAdmin:IS_ADMIN]
                              -(:Admin {adminId: {adminId}})`)
        .where(`NOT EXISTS(isAdmin.lastConfigUpdate)`)
        .return(`np, org, 'INIT_ORGANISATION' AS action`)
        .end({adminId: adminId}).getCommand();
};

let getDashboard = function (adminId) {
    let commands = [];
    commands.push(getTodo(adminId));
    return db.cypher().match(`(np:NetworkingPlatform)-[created:CREATED]->(org:Organization)
                               <-[:IS_ADMIN]-(:Admin {adminId: {adminId}})`)
        .return(`org.name AS name, created.created AS created, org.organizationId AS organizationId, 
                 np.name AS nameNetworkingPlatform`)
        .orderBy(`created.created DESC`)
        .end({adminId: adminId})
        .send(commands).then(function (resp) {
            return {todo: getTodoResponse(resp[0]), organization: resp[1]};
        });
};

module.exports = {
    getDashboard: getDashboard
};
