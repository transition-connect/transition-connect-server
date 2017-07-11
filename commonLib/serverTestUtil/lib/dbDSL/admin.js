'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createAdmin = function (adminId, data) {
    data.password = data.password || '1';
    data.passwordCreated = data.passwordCreated || 500;
    dbConnectionHandling.getCommands().push(db.cypher()
        .create(`(:Admin {adminId: {adminId}, email: {email}, password: {password}, 
                  passwordCreated: {passwordCreated}})`)
        .end({
            adminId: adminId, email: data.email, password: data.password,
            passwordCreated: data.passwordCreated
        }).getCommand());
};

module.exports = {
    createAdmin: createAdmin
};