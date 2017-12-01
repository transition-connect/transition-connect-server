'use strict';

let difference = requireSyncLogic('import/event/difference');
let importEventToDb = requireSyncLogic('import/event/npEvents');
let adapter = requireAdapter('networkingPlatform/index');
let logger = require('server-lib').logging.getLogger(__filename);

let importEvent = async function (npConfig, uid, timestamp) {
    try {
        let event = await adapter.importEvent(npConfig.config.npApiUrl, uid, npConfig.config.token);
        await importEventToDb.importEvent(uid, timestamp, event.iCal, event.idOrg, npConfig.np.platformId);
    } catch (error) {
        logger.error(`Import of event ${uid} failed`);
    }
};

let importEvents = async function (npConfig) {
    let events, skip = 0, numberOfLoop = 0;
    const MAX_NUMBER_OF_LOOP = 500;
    logger.info(`Start event import from ${npConfig.config.npApiUrl}`);
    try {
        do {
            numberOfLoop++;
            events = await adapter.getListEvents(npConfig.config.npApiUrl, skip, npConfig.config.token);
            if (events && events.events && events.events.length > 0) {
                let eventsToImport = await difference.getEventsToImport(events.events, npConfig.np.platformId);
                for (let event of eventsToImport) {
                    await importEvent(npConfig, event.uid, event.timestamp);
                }
                skip = skip + events.events.length;
            }
            if (MAX_NUMBER_OF_LOOP <= numberOfLoop) {
                logger.error(`Max loop ${MAX_NUMBER_OF_LOOP} exceeded for np ${npConfig.np.platformId}`);
            }
        } while (events && events.events && events.events.length > 0 &&
        MAX_NUMBER_OF_LOOP > numberOfLoop);
    } catch (error) {
        logger.error(`Error when connecting to ${npConfig.config.npApiUrl}`);
    }
};

module.exports = {
    importEvents
};
