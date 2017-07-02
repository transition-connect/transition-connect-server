'use strict';

let db = require('server-lib').neo4j;
let exceptions = require('server-lib').exceptions;
let sendLoginPassword = require('./../eMailService/sendLoginPassword');
let logger = require('server-lib').logging.getLogger(__filename);

let sendPassword = function (email, req) {
    let queryEmail = `(?i)${email}`;
    return db.cypher().match(`(admin:Admin)`)
        .where(`admin.email =~ {email}`)
        .return(`admin`).end({email: queryEmail})
        .send().then(function (resp) {
            if (resp.length === 1) {
                return sendLoginPassword.sendLoginPassword(resp[0].admin.adminId);
            }
            return exceptions.getInvalidOperation(`Admin with email ${email} does not exist`, logger, req);
        });
};

module.exports = {
    sendPassword: sendPassword
};
