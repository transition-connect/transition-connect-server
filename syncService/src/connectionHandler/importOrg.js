'use strict';

let difference = requireSyncLogic('import/organization/difference');
let importOrg = requireSyncLogic('import/organization/import');
let adapter = requireAdapter('networkingPlatform/index');
let logger = require('server-lib').logging.getLogger(__filename);

let importOrganization = async function(npConfig, id, timestamp) {
    let organization = await adapter.importOrganisation(npConfig.config.npApiUrl, id);
    await importOrg.importOrganization(id, timestamp, organization, npConfig.np.platformId);
};

let importOrganizations = async function (npConfig) {
    let organizations, skip = 0, numberOfLoop = 0;
    const MAX_NUMBER_OF_LOOP = 500;
    do {
        numberOfLoop++;
        organizations = await adapter.getListOrganisations(npConfig.config.npApiUrl, skip);
        if (organizations && organizations.organizations && organizations.organizations.length > 0) {
            let organizationsToImport = await difference.getOrgToImport(organizations.organizations, npConfig.np.platformId);
            for(let org of organizationsToImport) {
                await importOrganization(npConfig, org.id, org.timestamp);
            }
            skip = skip + organizations.organizations.length;
        }
        if (MAX_NUMBER_OF_LOOP <= numberOfLoop) {
            logger.error(`Max loop ${MAX_NUMBER_OF_LOOP} exceeded for np ${npConfig.np.platformId}`);
        }
    } while (organizations && organizations.organizations && organizations.organizations.length > 0 &&
    MAX_NUMBER_OF_LOOP > numberOfLoop);
};

module.exports = {
    importOrganizations
};
