'use strict';

let testee = requireLib('iCalEventParser/dateParser');
let expect = require('chai').expect;

describe('Unit Test lib/iCalEventParser/dateParser', function () {

    before(function () {
    });

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it('Parse google date', function () {

        let vEvent = `BEGIN:VEVENT
DTSTART;VALUE=DATE:20171203
END:VEVENT`;
        let result = testee.parseDate(vEvent, 'DTSTART', true);

        expect(result).to.equal(1512259200);
    });

    it('Parse normal utc date', function () {

        let vEvent = `BEGIN:VEVENT
DTSTART:20171203T132256Z
END:VEVENT`;
        let result = testee.parseDate(vEvent, 'DTSTART', true);

        expect(result).to.equal(1512307376);
    });

    it('Parse utc date with TZID property', function () {

        let vEvent = `BEGIN:VEVENT
DTSTART;TZID=UTC+0:20171203T132256
END:VEVENT`;
        let result = testee.parseDate(vEvent, 'DTSTART', true);

        expect(result).to.equal(1512307376);
    });

    it('Parse +1 date with TZID property', function () {

        let vEvent = `BEGIN:VEVENT
DTSTART;TZID=UTC+1:20171203T132256
END:VEVENT`;
        let result = testee.parseDate(vEvent, 'DTSTART', true);

        expect(result).to.equal(1512271376);
    });
});
