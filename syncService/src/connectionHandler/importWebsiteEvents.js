'use strict';

let importSyncLogic = requireSyncLogic('import/event/websiteEvents');
let adapter = requireAdapter('websiteOrganization/index');
let logger = require('server-lib').logging.getLogger(__filename);

let importEvents = async function (importUrl, organizationId) {
    let ical;
    try {
        ical = await adapter.importICalEvents(importUrl);
    } catch (error) {
        logger.warn(`Event import from ${importUrl} failed`, error);
    }
    await importSyncLogic.importEvents(ical, organizationId);
};

module.exports = {
    importEvents
};
