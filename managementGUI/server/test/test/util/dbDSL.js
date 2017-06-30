'use strict';

let admin = require('./dbDSL/admin');
let organization = require('./dbDSL/organization');
let organizationEvent = require('./dbDSL/event');
let db = require('./db');
let dbConnectionHandling = require('./dbDSL/dbConnectionHandling');

let init = function () {
    dbConnectionHandling.init();
    return db.clearDatabase();
};

module.exports = {
    init: init,
    sendToDb: dbConnectionHandling.sendToDb,

    createAdmin: admin.createAdmin,
    createOrganization: organization.createOrganization,
    setOrganizationAdmin: organization.setAdmin,
    createEvent: organizationEvent.createEvent
};