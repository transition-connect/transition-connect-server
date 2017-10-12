'use strict';

let db = require('server-lib').neo4j;
let adapter = requireAdapter();
let importSyncLogic = requireSyncLogic('import');
let logger = require('server-lib').logging.getLogger(__filename);

let startSync = async function () {
    let results = await db.cypher().match(`(np:NetworkingPlatform)-[:EXPORT_CONFIG]-(config:ExportConfig)`)
        .return(`np, config`).end().send();
    logger.info(`Synchronisation started`);
    for (let result of results) {
        let organizations = await adapter.importOrganizations(result.config.adapterType,
            result.config.npApiUrl);
        if (organizations && organizations.organizations && organizations.organizations.length > 0) {
            await importSyncLogic.importOrganizations(organizations.organizations, result.np.platformId);
        } else {
            logger.info(`No Organization changes from ${result.config.npApiUrl}`);
        }
    }
};

module.exports = {
    startSync
};
