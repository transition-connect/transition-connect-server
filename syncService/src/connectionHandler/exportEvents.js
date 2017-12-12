'use strict';

let adapter = requireAdapter('networkingPlatform/index');
let exportEvent = requireSyncLogic('export/event/export');
//let deleteOrg = requireSyncLogic('export/organization/delete');
let logger = require('server-lib').logging.getLogger(__filename);

let exportModifiedAndNewEvents = async function (npConfig) {
    let events = await exportEvent.getEventsToExport(npConfig.np.platformId);
    for (let event of events) {
        try {
            await adapter.exportEvent(event.orgId, event.uid, event.firstExport, event.iCal,
                npConfig.config.npApiUrl, npConfig.config.token);
            await exportEvent.setEventAsExported(event.uid, event.orgId, npConfig.np.platformId);
            logger.info(`Event ${event.uid} successfully exported (firstExport ${event.firstExport})`);
        } catch (error) {
            logger.error(`Event ${event.uid} could not be exported` +
                ` to ${npConfig.config.npApiUrl}`, null, error);
        }
    }
};

/*let deleteOrganizations = async function (npConfig) {
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
};*/

let exportEvents = async function (npConfig) {
    await exportModifiedAndNewEvents(npConfig);
    //await deleteOrganizations(npConfig);
};

module.exports = {
    exportEvents
};
