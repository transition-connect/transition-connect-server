'use strict';

let admin = require('./dbDSL/admin');
let category = require('./dbDSL/category');
let networkingPlatform = require('./dbDSL/networkingPlatform');
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
    createCategory: category.createCategory,
    createNetworkingPlatform: networkingPlatform.createNetworkingPlatform,
    createNetworkingPlatformAdapterConfig: networkingPlatform.createNetworkingPlatformAdapterConfig,
    createNetworkingPlatformExportRules: networkingPlatform.createNetworkingPlatformExportRules,
    mapNetworkingPlatformToCategory: networkingPlatform.mapNetworkingPlatformToCategory,
    createOrganization: organization.createOrganization,
    assignOrganizationToCategory: organization.assignOrganizationToCategory,
    exportOrgToNp: organization.exportOrgToNp,
    exportRequestOrgToNp: organization.exportRequestOrgToNp,
    exportDenyOrgToNp: organization.exportDenyOrgToNp,
    createNpEvent: organizationEvent.createNpEvent,
    createWebsiteEvent: organizationEvent.createWebsiteEvent
};