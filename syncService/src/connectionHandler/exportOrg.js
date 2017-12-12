'use strict';

let adapter = requireAdapter('networkingPlatform/index');
let exportOrg = requireSyncLogic('export/organization/export');
let deleteOrg = requireSyncLogic('export/organization/delete');
let logger = require('server-lib').logging.getLogger(__filename);

let exportModifiedAndNewOrganizations = async function (npConfig) {
    let organizations = await exportOrg.getOrganizationsToExport(npConfig.np.platformId);
    for (let organization of organizations) {
        try {
            let resp = await adapter.exportOrganization(organization.org, organization.firstExport, organization.idForExport,
                npConfig.config.npApiUrl, npConfig.config.token);
            await exportOrg.setOrganizationAsExported(resp.id, organization.organizationId, npConfig.np.platformId);
            logger.info(`Organization ${organization.org.name} successfully exported (firstExport ${organization.firstExport})`);
        } catch (error) {
            logger.error(`Organization ${organization.org.name} could not be exported` +
                ` to ${npConfig.config.npApiUrl}`, null, error);
        }
    }
};

let deleteOrganizations = async function (npConfig) {
    let organizationsToDelete = await deleteOrg.getOrganizationsToDelete(npConfig.np.platformId);
    for (let organizationToDelete of organizationsToDelete) {
        try {
            await adapter.deleteOrganization(organizationToDelete.id, npConfig.config.npApiUrl, npConfig.config.token);
            await deleteOrg.setOrganizationAsDeleted(organizationToDelete.organizationId, npConfig.np.platformId);
            logger.info(`Organization ${organizationToDelete.organizationId} successfully deleted on ${npConfig.config.npApiUrl}`);
        } catch (error) {
            logger.error(`Organization ${organizationToDelete.organizationId} could not be deleted` +
                ` on ${npConfig.config.npApiUrl}`, null, error);
        }
    }
};

let exportOrganizations = async function (npConfig) {
    await exportModifiedAndNewOrganizations(npConfig);
    await deleteOrganizations(npConfig);
};

module.exports = {
    exportOrganizations
};
