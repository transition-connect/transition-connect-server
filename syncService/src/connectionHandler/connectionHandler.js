'use strict';

let db = require('server-lib').neo4j;
let exportOrg = require(`./exportOrg`);
let exportEvents = require(`./exportEvents`);
let importOrg = require(`./importOrg`);
let importNpEvents = require(`./importNpEvents`);
let importWebsiteEvents = require(`./importWebsiteEvents`);
let logger = require('server-lib').logging.getLogger(__filename);

let getNpWithExportConfig = async function () {
    return await db.cypher().match(`(np:NetworkingPlatform)-[:EXPORT_CONFIG]-(config:ExportConfig)`)
        .return(`np, config`).end().send();
};

let getOrgWebsiteEvent = async function () {
    return await db.cypher().match(`(org:Organization)`)
        .where(`EXISTS(org.eventsImportConfiguration)`)
        .return(`org.eventsImportConfiguration AS eventsImportConfiguration, 
        org.organizationId AS organizationId`).end().send();
};

let startSync = async function () {
    logger.info(`Synchronisation started`);
    let npConfigs = await getNpWithExportConfig();
    for (let npConfig of npConfigs) {
        await importOrg.importOrganizations(npConfig);
        await importNpEvents.importEvents(npConfig);
    }
    let importOrgConfigs = await getOrgWebsiteEvent();
    for (let importOrgConfig of importOrgConfigs) {
        await importWebsiteEvents.importEvents(importOrgConfig.eventsImportConfiguration,
            importOrgConfig.organizationId);
    }
    for (let npConfig of npConfigs) {
        await exportOrg.exportOrganizations(npConfig);
        await exportEvents.exportEvents(npConfig);
    }
    logger.info(`Synchronisation finished`);
};

module.exports = {
    startSync
};
