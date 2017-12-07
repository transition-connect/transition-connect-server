'use strict';

let difference = requireSyncLogic('import/organization/difference');
let importOrg = requireSyncLogic('import/organization/import');
let deleteOrg = requireSyncLogic('import/organization/deleteOrg');
let adapter = requireAdapter('networkingPlatform/index');
let _ = require('lodash');
let logger = require('server-lib').logging.getLogger(__filename);

let importOrganization = async function (npConfig, id, timestamp) {
    try {
        let organization = await adapter.importOrganisation(npConfig.config.npApiUrl, id, npConfig.config.token);
        await importOrg.importOrganization(id, timestamp, organization, npConfig.np.platformId);
    } catch (error) {
        logger.error(`Import of organisation ${id} failed`);
    }
};

let importOrganizations = async function (npConfig) {
    let organizations, skip = 0, numberOfLoop = 0, existingOrg = [];
    const MAX_NUMBER_OF_LOOP = 500;
    logger.info(`Start organisation import from ${npConfig.config.npApiUrl}`);
    try {
        do {
            numberOfLoop++;
            organizations = await adapter.getListOrganisations(npConfig.config.npApiUrl, skip, npConfig.config.token);
            if (organizations && organizations.organisations && organizations.organisations.length > 0) {
                let organizationsToImport = await difference.getOrgToImport(organizations.organisations, npConfig.np.platformId);
                for (let org of organizationsToImport) {
                    await importOrganization(npConfig, org.id, org.timestamp);
                }
                skip = skip + organizations.organisations.length;
                existingOrg = [...existingOrg, ..._.map(organizations.organisations, 'id')];
            }
            if (MAX_NUMBER_OF_LOOP <= numberOfLoop) {
                logger.error(`Max loop ${MAX_NUMBER_OF_LOOP} exceeded for np ${npConfig.np.platformId}`);
            }
        } while (organizations && organizations.organisations && organizations.organisations.length > 0 &&
        MAX_NUMBER_OF_LOOP > numberOfLoop);
        if (MAX_NUMBER_OF_LOOP > numberOfLoop) {
            await deleteOrg.deleteOrg(existingOrg, npConfig.np.platformId);
        }
    } catch (error) {
        logger.error(`Error when connecting to ${npConfig.config.npApiUrl}`);
    }
};

module.exports = {
    importOrganizations
};
