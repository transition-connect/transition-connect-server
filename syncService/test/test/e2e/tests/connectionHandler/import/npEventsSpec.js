'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let nock = require('nock');

describe('Importing events from an external networking platform', function () {

    beforeEach(async function () {
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1']});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2']});
        dbDsl.createNetworkingPlatformAdapterConfig('1', {adapterType: 'standardNp', npApiUrl: 'https://localhost.org'});
        dbDsl.createNetworkingPlatformAdapterConfig('2', {
            adapterType: 'standardNp', npApiUrl: 'https://localhost2.org', lastSync: 700
        });

        dbDsl.createCategory(6);

        dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['0', '1', '2', '3']});
        dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['4', '5']});

        dbDsl.createOrganization('10', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500, modifiedOnNp: 700,
            organizationIdOnExternalNP: '1', name: 'organization1', description: 'description1', slogan: 'slogan1',
            website: 'www.link.org1'
        });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organisations: []});
        nock(`https://localhost2.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organisations: []});
    });

    afterEach(function () {
        nock.cleanAll();
    });

    it('Import new events', async function () {

        nock(`https://localhost.org`)
            .get('/api/v1/event').query({skip: 0})
            .reply(200, {
                events: [{uid: '1@example.org', timestamp: 500}, {uid: '2@example.org', timestamp: 501}]
            });

        nock(`https://localhost.org`)
            .get('/api/v1/event').query({skip: 2})
            .reply(200, {events: []});

        nock(`https://localhost.org`)
            .get('/api/v1/event/1@example.org')
            .reply(200, {
                idOrg: '1', timestamp: 500,
                iCal: `BEGIN:VEVENT
                       UID:1@example.org
                       ORGANIZER;CN="Alice Balder, Example Inc.":MAILTO:alice@example.com
                       LOCATION:Somewhere
                       SUMMARY:Eine Kurzinfo
                       CATEGORIES:social
                       DESCRIPTION:Beschreibung des Termins
                       DTSTART:20060910T220000Z
                       DTEND:20060919T215900Z
                       DTSTAMP:20060812T125900Z
                       END:VEVENT`
            });

        nock(`https://localhost.org`)
            .get('/api/v1/event/2@example.org')
            .reply(200, {
                idOrg: '1', timestamp: 501,
                iCal: `BEGIN:VEVENT
                       UID:2@example.org
                       ORGANIZER;CN="Alice Balder, Example Inc.":MAILTO:alice@example.com
                       LOCATION:Somewhere1
                       SUMMARY:Eine Kurzinfo1
                       CATEGORIES:environment
                       DESCRIPTION:Beschreibung des Termins1
                       DTSTART:20070910T220000Z
                       DTEND:20070919T215900Z
                       DTSTAMP:20070812T125900Z
                       END:VEVENT`
            });

        nock(`https://localhost2.org`)
            .get('/api/v1/event').query({skip: 0})
            .reply(200, {events: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(" (np:NetworkingPlatform)-[:CREATED]->(org:Organization)-[:ORGANIZE]->(event:Event)")
            .return(`np, org, event`)
            .orderBy(`event.uid`).end().send();

        resp.length.should.equals(2);
        resp[0].np.platformId.should.equals('1');
        resp[0].org.organizationIdOnExternalNP.should.equals('1');
        resp[0].event.modifiedOnNp.should.equals(500);
        resp[0].event.uid.should.equals('1@example.org');
        resp[0].event.description.should.equals('Beschreibung des Termins');
        resp[0].event.summary.should.equals('Eine Kurzinfo');
        resp[0].event.location.should.equals('Somewhere');
        resp[0].event.startDate.should.equals(1157925600);
        resp[0].event.endDate.should.equals(1158703140);
        resp[0].event.iCal.should.equals(`BEGIN:VEVENT
                       UID:1@example.org
                       ORGANIZER;CN="Alice Balder, Example Inc.":MAILTO:alice@example.com
                       LOCATION:Somewhere
                       SUMMARY:Eine Kurzinfo
                       CATEGORIES:social
                       DESCRIPTION:Beschreibung des Termins
                       DTSTART:20060910T220000Z
                       DTEND:20060919T215900Z
                       DTSTAMP:20060812T125900Z
                       END:VEVENT`);
        resp[1].np.platformId.should.equals('1');
        resp[1].org.organizationIdOnExternalNP.should.equals('1');
        resp[1].event.modifiedOnNp.should.equals(501);
        resp[1].event.uid.should.equals('2@example.org');
        resp[1].event.description.should.equals('Beschreibung des Termins1');
        resp[1].event.summary.should.equals('Eine Kurzinfo1');
        resp[1].event.location.should.equals('Somewhere1');
        resp[1].event.startDate.should.equals(1189461600);
        resp[1].event.endDate.should.equals(1190239140);
        resp[1].event.iCal.should.equals(`BEGIN:VEVENT
                       UID:2@example.org
                       ORGANIZER;CN="Alice Balder, Example Inc.":MAILTO:alice@example.com
                       LOCATION:Somewhere1
                       SUMMARY:Eine Kurzinfo1
                       CATEGORIES:environment
                       DESCRIPTION:Beschreibung des Termins1
                       DTSTART:20070910T220000Z
                       DTEND:20070919T215900Z
                       DTSTAMP:20070812T125900Z
                       END:VEVENT`);

    });

    it('Import modified event', async function () {

        dbDsl.createNpEvent('1@example.org', {organizationId: '10', modifiedOnNp: 499});

        nock(`https://localhost.org`)
            .get('/api/v1/event').query({skip: 0})
            .reply(200, {
                events: [{uid: '1@example.org', timestamp: 500}]
            });

        nock(`https://localhost.org`)
            .get('/api/v1/event').query({skip: 1})
            .reply(200, {events: []});

        nock(`https://localhost.org`)
            .get('/api/v1/event/1@example.org')
            .reply(200, {
                idOrg: '1', timestamp: 500,
                iCal: `BEGIN:VEVENT
                       UID:1@example.org
                       ORGANIZER;CN="Alice Balder, Example Inc.":MAILTO:alice@example.com
                       LOCATION:Somewhere
                       SUMMARY:Eine Kurzinfo
                       CATEGORIES:social
                       DESCRIPTION:Beschreibung des Termins
                       DTSTART:20060910T220000Z
                       DTEND:20060919T215900Z
                       DTSTAMP:20060812T125900Z
                       END:VEVENT`
            });

        nock(`https://localhost2.org`)
            .get('/api/v1/event').query({skip: 0})
            .reply(200, {events: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(" (np:NetworkingPlatform)-[:CREATED]->(org:Organization)-[:ORGANIZE]->(event:Event)")
            .return(`np, org, event`)
            .orderBy(`event.uid`).end().send();

        resp.length.should.equals(1);
        resp[0].np.platformId.should.equals('1');
        resp[0].org.organizationIdOnExternalNP.should.equals('1');
        resp[0].event.modifiedOnNp.should.equals(500);
        resp[0].event.uid.should.equals('1@example.org');
        resp[0].event.description.should.equals('Beschreibung des Termins');
        resp[0].event.summary.should.equals('Eine Kurzinfo');
        resp[0].event.location.should.equals('Somewhere');
        resp[0].event.startDate.should.equals(1157925600);
        resp[0].event.endDate.should.equals(1158703140);
        resp[0].event.iCal.should.equals(`BEGIN:VEVENT
                       UID:1@example.org
                       ORGANIZER;CN="Alice Balder, Example Inc.":MAILTO:alice@example.com
                       LOCATION:Somewhere
                       SUMMARY:Eine Kurzinfo
                       CATEGORIES:social
                       DESCRIPTION:Beschreibung des Termins
                       DTSTART:20060910T220000Z
                       DTEND:20060919T215900Z
                       DTSTAMP:20060812T125900Z
                       END:VEVENT`);
    });

    it('Do not import not modified event', async function () {

        dbDsl.createNpEvent('1@example.org', {organizationId: '10', modifiedOnNp: 500});

        nock(`https://localhost.org`)
            .get('/api/v1/event').query({skip: 0})
            .reply(200, {
                events: [{uid: '1@example.org', timestamp: 500}]
            });

        nock(`https://localhost.org`)
            .get('/api/v1/event').query({skip: 1})
            .reply(200, {events: []});

        nock(`https://localhost2.org`)
            .get('/api/v1/event').query({skip: 0})
            .reply(200, {events: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(" (np:NetworkingPlatform)-[:CREATED]->(org:Organization)-[:ORGANIZE]->(event:Event)")
            .return(`np, org, event`)
            .orderBy(`event.uid`).end().send();

        resp.length.should.equals(1);
        resp[0].event.modifiedOnNp.should.equals(500);
        resp[0].event.uid.should.equals('1@example.org');
        resp[0].event.description.should.equals('event1@example.orgDescription');
        resp[0].event.summary.should.equals('event1@example.orgSummary');
        resp[0].event.location.should.equals('event1@example.orgLocation');
        resp[0].event.startDate.should.equals(500);
        resp[0].event.endDate.should.equals(600);
    });
});
