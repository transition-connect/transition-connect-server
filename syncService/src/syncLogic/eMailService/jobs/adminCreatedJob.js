"use strict";

let email = require('server-lib').eMail;

let processDefinition = function (data, done) {

    email.sendEMail("adminCreated", {
        link: data.link, linkText: data.linkText,
        password: data.password, org: data.org
    }, data.email);
    return done();
};

module.exports = {
    processDefinition: processDefinition
};
