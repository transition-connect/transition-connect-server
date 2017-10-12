'use strict';

let db = require('server-lib').neo4j;
let exportOrg = require(`./exportOrg`);
let importOrg = require(`./importOrg`);
let logger = require('server-lib').logging.getLogger(__filename);

let getNpWithExportConfig = async function () {
    return await db.cypher().match(`(np:NetworkingPlatform)-[:EXPORT_CONFIG]-(config:ExportConfig)`)
        .return(`np, config`).end().send();
};

let startSync = async function () {
    logger.info(`Synchronisation started`);
    let npConfigs = await getNpWithExportConfig();
    for (let npConfig of npConfigs) {
        await importOrg.importOrganizations(npConfig);
    }
    for (let npConfig of npConfigs) {
        await exportOrg.exportNewOrganizations(npConfig);
        await exportOrg.exportModifiedOrganizations(npConfig);
    }
    logger.info(`Synchronisation finished`);
};

module.exports = {
    startSync
};
