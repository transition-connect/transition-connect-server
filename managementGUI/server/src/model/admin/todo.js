'use strict';

let db = require('server-lib').neo4j;

let getTodoResponse = function (todoInitOrg, todoAcceptOrg) {
    let resultTodos = [];
    for (let todo of [...todoInitOrg, ...todoAcceptOrg]) {
        let resultTodo = {action: todo.action, actionData: {}};
        resultTodo.actionData.organizationName = todo.org.name;
        resultTodo.actionData.organizationId = todo.org.organizationId;
        resultTodo.actionData.nameNetworkingPlatform = todo.np.name;
        resultTodo.actionData.platformId = todo.np.platformId;
        resultTodos.push(resultTodo);
    }
    return resultTodos;
};

let getAcceptOrgTodo = function (adminId) {
    return db.cypher().match(`(:Admin {adminId: {adminId}})-[:IS_ADMIN]->(np:NetworkingPlatform)
                              <-[:EXPORT_REQUEST]-(org:Organization)`)
        .return(`np, org, 'EXPORT_REQUEST' AS action`)
        .end({adminId: adminId}).getCommand();
};

let getInitOrganisationTodo = function (adminId) {
    return db.cypher().match(`(np:NetworkingPlatform)-[:CREATED]->(org:Organization)<-[:IS_ADMIN]
                              -(:Admin {adminId: {adminId}})`)
        .where(`NOT EXISTS(org.lastConfigUpdate)`)
        .return(`np, org, 'INIT_ORGANISATION' AS action`)
        .end({adminId: adminId}).getCommand();
};

module.exports = {
    getInitOrganisationTodo,
    getAcceptOrgTodo,
    getTodoResponse
};
