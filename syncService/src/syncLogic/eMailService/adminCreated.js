"use strict";

let db = require('server-lib').neo4j;
let generatePassword = require('generate-password');
let time = require('server-lib').time;
let domain = require('server-lib').domain;
let eMailQueue = require('server-lib').eMailQueue;

let sendAdminCreated = async function (organizationId) {

    let tempPassword = generatePassword.generate({length: 10, numbers: true});
    let resp = await db.cypher().match(`(org:Organization {organizationId: {organizationId}})<-[IS_ADMIN]-(admin:Admin)`)
        .where(`admin.sendInvitation = true`)
        .set('admin', {passwordCreated: time.getNowUtcTimestamp(), password: tempPassword})
        .remove(`admin.sendInvitation`)
        .return(`admin.email AS email, org.name AS orgName`)
        .end({organizationId: organizationId}).send();

    for (let emailToSend of resp) {
        eMailQueue.createImmediatelyJob('adminCreatedJob', {
            link: `${domain.getDomain()}?email=${encodeURIComponent(emailToSend.email)}&password=${tempPassword}`,
            linkText: domain.getDomain(), org: emailToSend.orgName, email: emailToSend.email, password: tempPassword
        });
    }
};

module.exports = {
    sendAdminCreated
};
