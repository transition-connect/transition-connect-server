"use strict";

let db = require('server-lib').neo4j;
let generatePassword = require('generate-password');
let time = require('server-lib').time;
let domain = require('server-lib').domain;
let eMailQueue = require('server-lib').eMailQueue;

let sendAdminCreated = async function (organizationId) {

    let tempPassword = generatePassword.generate({length: 30, numbers: true});
    let resp = await db.cypher().match(`(org:Organization {organizationId: {organizationId}})<-[IS_ADMIN]-(admin:Admin)`)
        .where(`admin.sendInvitation = true`)
        .set('admin', {linkCreated: time.getNowUtcTimestamp(), linkPassword: tempPassword})
        .return(`admin.email AS email, org.name AS orgName`)
        .end({organizationId: organizationId}).send();

    for (let emailToSend of resp) {
        eMailQueue.createImmediatelyJob('adminCreatedJob', {
            link: `${domain.getDomain()}firstLogin/${tempPassword}`,
            org: emailToSend.orgName, email: emailToSend.email
        });
    }
};

module.exports = {
    sendAdminCreated
};
