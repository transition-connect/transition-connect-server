"use strict";

let db = require('server-lib').neo4j;
let generatePassword = require('generate-password');
let time = require('server-lib').time;
let eMailQueue = require('server-lib').eMailQueue;

let sendLoginPassword = function (adminId) {
    let tempPassword = generatePassword.generate({length: 6, numbers: true});
    return db.cypher().match(`(admin:Admin {adminId: {adminId}})`)
        .set('admin', {passwordCreated: time.getNowUtcTimestamp(), password: tempPassword})
        .return(`admin.email AS email`)
        .end({adminId: adminId}).send().then(function (resp) {
            if (resp.length === 1) {
                eMailQueue.createImmediatelyJob('sendLoginPasswordJob', {password: tempPassword, email: resp[0].email});
            }
        });
};

module.exports = {
    sendLoginPassword: sendLoginPassword
};
