'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');
let nock = require('nock');

describe('Importing events from a website in iCal format and setting the EXPORT relationships', function () {

    beforeEach(async function () {
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link: 'www.link.org'});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2'], name: 'Elyoos2', description: 'description2', link: 'www.link2.org'});
        dbDsl.createNetworkingPlatform('3', {adminIds: ['2'], name: 'Elyoos3', description: 'description3', link: 'www.link3.org'});

        dbDsl.createOrganization('1', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500,
            eventsImportConfiguration: 'http://www.test.ch/import/organization'
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Import iCal event and export to networking platform', async function () {

        let normalStartUtcTimestamp = Math.floor(moment.utc().valueOf() / 1000) - 500,
            normalEndUtcTimestamp = normalStartUtcTimestamp + 1000;

        nock(`http://www.test.ch`).get('/import/organization')
            .reply(200,
                `BEGIN:VCALENDAR
                VERSION:2.0
                CALSCALE:GREGORIAN
                METHOD:PUBLISH
                X-WR-CALNAME:test@gmail.com
                X-WR-TIMEZONE:Europe/Zurich
                BEGIN:VEVENT
                DTSTART:${moment.utc(normalStartUtcTimestamp * 1000).format('YYYYMMDDTHHmmss')}Z
                DTEND:${moment.utc(normalEndUtcTimestamp * 1000).format('YYYYMMDDTHHmmss')}Z
                UID:0c6ckli6gauhsp76ju1vl065dd@google.com
                CREATED:20171025T150112Z
                DESCRIPTION:Hat was mit TC zu tun\nGanz viel
                LAST-MODIFIED:20171025T150112Z
                LOCATION:Irgendwo in Zürich
                SEQUENCE:0
                STATUS:CONFIRMED
                SUMMARY:Event1 Test
                TRANSP:OPAQUE
                END:VEVENT
                END:VCALENDAR`
            );

        dbDsl.exportOrgToNp({organizationId: '1', npId: '2'});
        dbDsl.createEventExportRule('1', {npId: '2'});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(`(org:Organization {organizationId: '1'})-[:WEBSITE_EVENT]->(event:Event)
                                            -[:EXPORT]->(:NetworkingPlatform {platformId: '2'})`)
            .return(`event`).end().send();

        resp.length.should.equals(1);
    });
});