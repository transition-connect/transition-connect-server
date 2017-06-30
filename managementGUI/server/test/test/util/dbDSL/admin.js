'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createAdmin = function (adminId, data) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .create(`(:Admin {adminId: {adminId}, email: {email}})`)
        .end({adminId: adminId, email: data.email}).getCommand());
};

module.exports = {
    createAdmin: createAdmin
};