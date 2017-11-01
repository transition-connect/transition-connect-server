'use strict';

let importSyncLogic = requireSyncLogic('import/iCalEvents');
let adapter = requireAdapter('websiteOrganization/index');

let importEvents = async function (importUrl, organizationId) {
    let ical = await adapter.importICalEvents(importUrl);
    await importSyncLogic.importICalEvents(ical, organizationId);
};

module.exports = {
    importEvents
};
