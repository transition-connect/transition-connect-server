'use strict';

let db = requireDb();
let time = requireLib().time;
let generatePassword = require('generate-password');

let saveNewPassword = function (adminId) {
    let tempPassword = generatePassword.generate({length: 6, numbers: true});
    return db.cypher().match(`(admin:Admin {adminId: {adminId}})`)
        .set('admin', {passwordCreated: time.getNowUtcTimestamp(), password: tempPassword})
        .end({adminId: adminId}).send().then(function () {
            return tempPassword;
        });
};

let sendPassword = function (email) {
    let queryEmail = `(?i)${email}`;
    return db.cypher().match(`(admin:Admin)`)
        .where(`admin.email =~ {email}`)
        .return(`admin`).end({email: queryEmail})
        .send().then(function (resp) {
            if (resp.length === 1) {
                return saveNewPassword(resp[0].admin.adminId).then(function (password) {
                    var test = 1;
                });
            } else if (resp.length > 1) {

            } else {

            }
        });
};


module.exports = {
    sendPassword: sendPassword
};
