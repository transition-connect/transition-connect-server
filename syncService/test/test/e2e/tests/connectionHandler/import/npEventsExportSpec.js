'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let requestHandler = require('server-test-util').requestHandler;
let nock = require('nock');

describe('Importing events from a networking platform and setting the EXPORT relationships', function () {

    beforeEach(async function () {
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link: 'www.link.org'});
        dbDsl.createNetworkingPlatformAdapterConfig('1', {adapterType: 'standardNp', npApiUrl: 'https://localhost.org', token: `1234`});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2'], name: 'Elyoos2', description: 'description2', link: 'www.link2.org'});
        dbDsl.createNetworkingPlatform('3', {adminIds: ['2'], name: 'Elyoos3', description: 'description3', link: 'www.link3.org'});

        dbDsl.createOrganization('1', {
            networkingPlatformId: '1', organizationIdOnExternalNP: '555', adminIds: ['2'], created: 500
        });

        dbDsl.exportOrgToNp({organizationId: '1', npId: '2'});
        dbDsl.createEventExportRule('1', {npId: '2'});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organisations: []});
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Import event and export to networking platform', async function () {

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/event').query({skip: 0})
            .reply(200, {
                events: [{uid: '1@example.org', timestamp: 500}]
            });

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/event').query({skip: 1})
            .reply(200, {events: []});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/event/1@example.org')
            .reply(200, {
                idOrg: '555', timestamp: 500,
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

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(`(org:Organization {organizationId: '1'})-[:EVENT]->(event:Event)
                                            -[:EXPORT]->(:NetworkingPlatform {platformId: '2'})`)
            .return(`event`).end().send();

        resp.length.should.equals(1);
    });
});