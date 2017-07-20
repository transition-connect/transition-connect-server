'use strict';

let admin = require('./dbDSL/admin');
let category = require('./dbDSL/category');
let networkingPlatform = require('./dbDSL/networkingPlatform');
let organization = require('./dbDSL/organization');
let project = require('./dbDSL/project');
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
    createCategory: category.createCategory,
    createNetworkingPlatform: networkingPlatform.createNetworkingPlatform,
    mapNetworkingPlatformToCategory: networkingPlatform.mapNetworkingPlatformToCategory,
    createOrganization: organization.createOrganization,
    createProject: project.createProject,
    createEvent: organizationEvent.createEvent
};