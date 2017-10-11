'use strict';

let db = require('server-lib').neo4j;
let adapter = requireAdapter();
let importSyncLogic = requireSyncLogic('import');

let startSync = async function () {
    let results = await db.cypher().match(`(np:NetworkingPlatform)-[:EXPORT_CONFIG]-(config:ExportConfig)`)
        .return(`np, config`).end().send();
    for (let result of results) {
        let organizations = await adapter.importOrganizations(result.config.adapterType,
            result.config.npApiUrl);
        await importSyncLogic.importOrganizations(organizations.organizations, result.np.platformId);
    }
};

module.exports = {
    startSync
};
