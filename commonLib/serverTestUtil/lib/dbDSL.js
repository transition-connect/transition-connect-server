'use strict';

let admin = require('./dbDSL/admin');
let category = require('./dbDSL/category');
let networkingPlatform = require('./dbDSL/networkingPlatform');
let organization = require('./dbDSL/organization');
let organizationEvent = require('./dbDSL/event');
let organizationLocation = require('./dbDSL/location');
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
    markDeleteOrganization: organization.deleteOrganization,
    deleteCounterOrganization: organization.deleteCounterOrganization,
    assignOrganizationToCategory: organization.assignOrganizationToCategory,
    exportOrgToNp: organization.exportOrgToNp,
    exportRequestOrgToNp: organization.exportRequestOrgToNp,
    exportDenyOrgToNp: organization.exportDenyOrgToNp,
    exportDeleteRequestToNp: organization.exportDeleteRequestToNp,
    exportDeleteSuccessToNp: organization.exportDeleteSuccessToNp,
    createNpEvent: organizationEvent.createNpEvent,
    createWebsiteEvent: organizationEvent.createWebsiteEvent,
    exportEventToNp: organizationEvent.exportEventToNp,
    createLocation: organizationLocation.createLocation
};