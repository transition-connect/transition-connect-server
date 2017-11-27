'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let requestHandler = require('server-test-util').requestHandler;
let nock = require('nock');

describe('Integration Tests for importing events from a website in iCal format', function () {

    beforeEach(async function () {
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link: 'www.link.org'});

        dbDsl.createOrganization('1', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500,
            eventsImportConfiguration: 'http://www.test.ch/import/organization'
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Import valid iCal events (all properties)', async function () {

        nock(`http://www.test.ch`).get('/import/organization')
            .reply(200,
                `BEGIN:VCALENDAR
                PRODID:-//Google Inc//Google Calendar 70.9054//EN
                VERSION:2.0
                CALSCALE:GREGORIAN
                METHOD:PUBLISH
                X-WR-CALNAME:test@gmail.com
                X-WR-TIMEZONE:Europe/Zurich
                BEGIN:VEVENT
                DTSTART:20171027T073000Z
                DTEND:20171027T083000Z
                DTSTAMP:20171026T125619Z
                UID:0c6ckli6gauhsp76ju1vl065dd@google.com
                CREATED:20171025T150112Z
                DESCRIPTION:Hat was mit TC zu tun
                LAST-MODIFIED:20171025T150112Z
                LOCATION:Irgendwo in Zürich
                SEQUENCE:0
                STATUS:CONFIRMED
                SUMMARY:Event1 Test
                TRANSP:OPAQUE
                END:VEVENT
                BEGIN:VEVENT
                DTSTART;VALUE=DATE:20171116
                DTEND;VALUE=DATE:20171117
                DTSTAMP:20171026T125610Z
                UID:1c6ckli6gauhsp76ju1vl065dd@google.com
                CREATED:20171025T1501121Z
                DESCRIPTION:Hat auch was mit TC zu tun
                LAST-MODIFIED:20171025T150112Z
                LOCATION:Irgendwo in Urdorf
                SEQUENCE:0
                STATUS:CONFIRMED
                SUMMARY:Event2 Test
                TRANSP:OPAQUE
                END:VEVENT
                END:VCALENDAR`
            );

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match("(org:Organization {organizationId: '1'})-[:WEBSITE_EVENT]->(event:Event)")
            .return(`event`).orderBy(`event.uid`).end().send();

        resp.length.should.equals(2);
        resp[0].event.uid.should.equals('0c6ckli6gauhsp76ju1vl065dd@google.com');
        resp[0].event.description.should.equals('Hat was mit TC zu tun');
        resp[0].event.summary.should.equals('Event1 Test');
        resp[0].event.location.should.equals('Irgendwo in Zürich');
        resp[0].event.startDate.should.equals(1509089400);
        resp[0].event.endDate.should.equals(1509093000);
        resp[0].event.iCal.should.equals(`BEGIN:VEVENT
                DTSTART:20171027T073000Z
                DTEND:20171027T083000Z
                DTSTAMP:20171026T125619Z
                UID:0c6ckli6gauhsp76ju1vl065dd@google.com
                CREATED:20171025T150112Z
                DESCRIPTION:Hat was mit TC zu tun
                LAST-MODIFIED:20171025T150112Z
                LOCATION:Irgendwo in Zürich
                SEQUENCE:0
                STATUS:CONFIRMED
                SUMMARY:Event1 Test
                TRANSP:OPAQUE
                END:VEVENT`);
        resp[1].event.uid.should.equals('1c6ckli6gauhsp76ju1vl065dd@google.com');
        resp[1].event.description.should.equals('Hat auch was mit TC zu tun');
        resp[1].event.summary.should.equals('Event2 Test');
        resp[1].event.location.should.equals('Irgendwo in Urdorf');
        resp[1].event.startDate.should.equals(1510790400);
        resp[1].event.endDate.should.equals(1510876800);
        resp[1].event.iCal.should.equals(`BEGIN:VEVENT
                DTSTART;VALUE=DATE:20171116
                DTEND;VALUE=DATE:20171117
                DTSTAMP:20171026T125610Z
                UID:1c6ckli6gauhsp76ju1vl065dd@google.com
                CREATED:20171025T1501121Z
                DESCRIPTION:Hat auch was mit TC zu tun
                LAST-MODIFIED:20171025T150112Z
                LOCATION:Irgendwo in Urdorf
                SEQUENCE:0
                STATUS:CONFIRMED
                SUMMARY:Event2 Test
                TRANSP:OPAQUE
                END:VEVENT`);

    });
});