'use strict';

let adapter = requireAdapter('networkingPlatform/index');
let exportEvent = requireSyncLogic('export/event/export');
let deleteEvent = requireSyncLogic('export/event/delete');
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

let deleteEvents = async function (npConfig) {
    let eventsToDelete = await deleteEvent.getEventsToDelete(npConfig.np.platformId);
    for (let eventToDelete of eventsToDelete) {
        try {
            await adapter.deleteEvent(eventToDelete.uid, npConfig.config.npApiUrl, npConfig.config.token);
            await deleteEvent.setEventAsDeleted(eventToDelete.uid, npConfig.np.platformId);
            logger.info(`Event ${eventToDelete.uid} successfully deleted on ${npConfig.config.npApiUrl}`);
        } catch (error) {
            logger.error(`Event ${eventToDelete.uid} could not be deleted` +
                ` on ${npConfig.config.npApiUrl}`, null, error);
        }
    }
};

let exportEvents = async function (npConfig) {
    await exportModifiedAndNewEvents(npConfig);
    await deleteEvents(npConfig);
};

module.exports = {
    exportEvents
};
