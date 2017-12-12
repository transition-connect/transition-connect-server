'use strict';

let adapter = requireAdapter('networkingPlatform/index');
let exportOrg = requireSyncLogic('export/organization/export');
let logger = require('server-lib').logging.getLogger(__filename);


let exportOrganizations = async function (npConfig) {
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

module.exports = {
    exportOrganizations
};
