"use strict";

let email = require('server-lib').eMail;

let processDefinition = function (data, done) {

    email.sendEMail("sendLoginPassword", {password: data.password}, data.email);
    return done();
};

module.exports = {
    processDefinition: processDefinition
};
