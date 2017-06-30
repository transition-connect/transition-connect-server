'use strict';

let db = require('server-lib').neo4j;
let sendLoginPassword = require('./../eMailService/sendLoginPassword');

let sendPassword = function (email) {
    let queryEmail = `(?i)${email}`;
    return db.cypher().match(`(admin:Admin)`)
        .where(`admin.email =~ {email}`)
        .return(`admin`).end({email: queryEmail})
        .send().then(function (resp) {
            if (resp.length === 1) {
                return sendLoginPassword.sendLoginPassword(resp[0].admin.adminId);
            } else if (resp.length > 1) {

            } else {

            }
        });
};

module.exports = {
    sendPassword: sendPassword
};
