'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;
let request = require('request-promise');

const ERROR_NO_ICAL_RESPONSE = 1;

let checkIsIcal = function (ical) {
    if (typeof(ical) === "string") {
        let indexStartCalendar = ical.indexOf('BEGIN:VCALENDAR');
        let indexEndCalendar = ical.indexOf('END:VCALENDAR');
        return indexStartCalendar != -1 && indexEndCalendar !== -1 &&
            indexStartCalendar < indexEndCalendar;
    }
    return false;
};

let saveUrl = function (organizationId, url) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})`)
        .set(`org`, {eventsImportConfiguration: url})
        .end({organizationId: organizationId}).send();
};

let saveImportEventUrl = async function (adminId, organizationId, url, req) {
    let options = {uri: url};
    try {
        let ical = await request(options);
        if (!checkIsIcal(ical)) {
            return exceptions.getInvalidOperation(`Url ${url} has no ical response`, logger, req, ERROR_NO_ICAL_RESPONSE);
        }
        await saveUrl(organizationId, url);
    } catch (error) {
        return exceptions.getInvalidOperation(`Url ${url} request error`, logger, req);
    }
};

module.exports = {
    saveImportEventUrl
};
