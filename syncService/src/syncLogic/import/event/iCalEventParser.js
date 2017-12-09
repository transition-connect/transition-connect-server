'use strict';

let moment = require('moment');
let iCalDateParser = require('ical-date-parser');
let logger = require('server-lib').logging.getLogger(__filename);

const BEGIN_EVENT = 'BEGIN:VEVENT';
const END_EVENT = 'END:VEVENT';

const UID = 'UID:';
const SUMMARY = 'SUMMARY:';
const DESCRIPTION = 'DESCRIPTION:';
const LOCATION = 'LOCATION:';
const START_DATE_EVENT = 'DTSTART';
const END_DATE_EVENT = 'DTEND';
const START_DATE_VALUE_EVENT = 'DTSTART;VALUE=DATE';
const END_DATE_VALUE_EVENT = 'DTEND;VALUE=DATE';

let parseString = function (vEvent, property, isMandatory) {
    let index = vEvent.indexOf(property), result = null;
    if (index !== -1) {
        let indexSeparator = vEvent.indexOf(':', index) + 1;
        result = vEvent.substring(indexSeparator, vEvent.indexOf('\n', index));
        result = result.replace('\r', '');
        result = result.replace('\n', '');
    } else if (isMandatory) {
        logger.error(`${property} in ${vEvent} not found`);
    }
    return result;
};

let parseDate = function (vEvent, property, valueProperty, isMandatory) {
    let result = parseString(vEvent, valueProperty, false);
    if (result === null) {
        result = parseString(vEvent, property, isMandatory);
    } else {
        result = result + 'T000000Z';
    }
    result = result.replace('\r', '');
    return moment.utc(iCalDateParser(result)).valueOf() / 1000;
};

let setEventProperties = function (event, vEvent) {
    event.uid = parseString(vEvent, UID, true);
    event.summary = parseString(vEvent, SUMMARY, true);
    event.description = parseString(vEvent, DESCRIPTION, false);
    event.location = parseString(vEvent, LOCATION, true);
    event.startDate = parseDate(vEvent, START_DATE_EVENT, START_DATE_VALUE_EVENT, true);
    event.endDate = parseDate(vEvent, END_DATE_EVENT, END_DATE_VALUE_EVENT, true);
};

let parseEvents = function (iCal) {
    let events = [], startIndex = 0, endIndex = 0;
    do {
        startIndex = iCal.indexOf(BEGIN_EVENT, startIndex);
        endIndex = iCal.indexOf(END_EVENT, endIndex);
        if (startIndex !== -1 && endIndex !== -1) {
            endIndex = endIndex + END_EVENT.length;
            let event = {iCal: iCal.substring(startIndex, endIndex)};
            setEventProperties(event, event.iCal);
            events.push(event);
            startIndex = endIndex;
        }
    }
    while (startIndex !== -1 && endIndex !== -1);
    return events;
};

module.exports = {
    parseEvents
};
