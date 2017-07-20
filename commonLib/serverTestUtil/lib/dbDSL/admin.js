'use strict';

let moment = require('moment');
let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createAdmin = function (adminId, data) {
    data.password = data.password || '1';
    data.passwordCreated = data.passwordCreated || Math.floor(moment.utc().valueOf() / 1000);
    dbConnectionHandling.getCommands().push(db.cypher()
        .create(`(:Admin {adminId: {adminId}, email: {email}, password: {password}, 
                  passwordCreated: {passwordCreated}, language: {language}})`)
        .end({
            adminId: adminId, email: data.email, password: data.password,
            passwordCreated: data.passwordCreated, language: data.language
        }).getCommand());
};

module.exports = {
    createAdmin: createAdmin
};