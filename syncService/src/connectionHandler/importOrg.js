'use strict';

let importSyncLogic = requireSyncLogic('import');
let adapter = requireAdapter();
let logger = require('server-lib').logging.getLogger(__filename);

let importOrganizations = async function (npConfig) {
    let organizations, skip = 0, numberOfLoop = 0;
    const MAX_NUMBER_OF_LOOP = 500;
    do {
        numberOfLoop++;
        organizations = await adapter.importOrganizations(npConfig.config.adapterType,
            npConfig.config.npApiUrl, npConfig.config.lastSync, skip);
        if (organizations && organizations.organizations && organizations.organizations.length > 0) {
            await importSyncLogic.importOrganizations(organizations.organizations, npConfig.np.platformId);
            skip = skip + organizations.organizations.length;
        }
        if (MAX_NUMBER_OF_LOOP <= numberOfLoop) {
            logger.error(`Max loop ${MAX_NUMBER_OF_LOOP} exceeded for np ${npConfig.np.platformId}`);
        }
    } while (organizations && organizations.organizations && organizations.organizations.length > 0 &&
    organizations.hasNext && MAX_NUMBER_OF_LOOP > numberOfLoop);
};

module.exports = {
    importOrganizations
};
