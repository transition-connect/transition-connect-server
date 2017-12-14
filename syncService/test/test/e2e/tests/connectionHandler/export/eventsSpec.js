'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let moment = require('moment');
let nock = require('nock');

describe('Export events to an external networking platform', function () {

    let startTime;

    beforeEach(async function () {
        await dbDsl.init();
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1']});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2']});
        dbDsl.createNetworkingPlatformAdapterConfig('1', {adapterType: 'standardNp', npApiUrl: 'https://localhost.org', token: `1234`});

        dbDsl.createCategory(6);

        dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['0', '1', '2', '3']});
        dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['4', '5']});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});
        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/event').query({skip: 0})
            .reply(200, {events: []});
    });

    afterEach(function () {
        nock.cleanAll();
    });

    it('Export np event for the first time', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});
        dbDsl.createNpEvent('1@elyoos.org', {organizationId: '1', modified: 666});
        dbDsl.exportEventToNp({uid: '1@elyoos.org', npId: '1'});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).post('/api/v1/event', {
            orgId: '555', iCal: `BEGIN:VCALENDAR
1@elyoos.org
END:VCALENDAR`
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Event {uid: '1@elyoos.org'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });

    it('Do not export not modified event', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});
        dbDsl.createNpEvent('1@elyoos.org', {organizationId: '1', modified: 666});
        dbDsl.exportEventToNp({uid: '1@elyoos.org', npId: '1', lastExportTimestamp: 667});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).post('/api/v1/event', {
            orgId: '555', iCal: `BEGIN:VCALENDAR
1@elyoos.org
END:VCALENDAR`
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(false);
        let resp = await db.cypher().match(`(:Event {uid: '1@elyoos.org'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.equals(667);
    });

    it('Export modified np event', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});
        dbDsl.createNpEvent('1@elyoos.org', {organizationId: '1', modified: 666});
        dbDsl.exportEventToNp({uid: '1@elyoos.org', npId: '1', lastExportTimestamp: 665});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/api/v1/event/1@elyoos.org', {
            iCal: `BEGIN:VCALENDAR
1@elyoos.org
END:VCALENDAR`
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Event {uid: '1@elyoos.org'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });

    it('Export website event for the first time', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});
        dbDsl.createWebsiteEvent('1@elyoos.org', {organizationId: '1', modified: 666});
        dbDsl.exportEventToNp({uid: '1@elyoos.org', npId: '1'});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).post('/api/v1/event', {
            orgId: '555', iCal: `BEGIN:VCALENDAR
1@elyoos.org
END:VCALENDAR`
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Event {uid: '1@elyoos.org'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });

    it('Do not export not modified website event', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});
        dbDsl.createWebsiteEvent('1@elyoos.org', {organizationId: '1', modified: 666});
        dbDsl.exportEventToNp({uid: '1@elyoos.org', npId: '1', lastExportTimestamp: 667});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).post('/api/v1/event', {
            orgId: '555', iCal: `BEGIN:VCALENDAR
1@elyoos.org
END:VCALENDAR`
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(false);
        let resp = await db.cypher().match(`(:Event {uid: '1@elyoos.org'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.equals(667);
    });

    it('Export modified website event', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});
        dbDsl.createWebsiteEvent('1@elyoos.org', {organizationId: '1', modified: 666});
        dbDsl.exportEventToNp({uid: '1@elyoos.org', npId: '1', lastExportTimestamp: 665});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/api/v1/event/1@elyoos.org', {
            iCal: `BEGIN:VCALENDAR
1@elyoos.org
END:VCALENDAR`
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Event {uid: '1@elyoos.org'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });

    it('Export website event for the first time to original networking platform', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.createWebsiteEvent('1@elyoos.org', {organizationId: '1', modified: 666});
        dbDsl.exportEventToNp({uid: '1@elyoos.org', npId: '1'});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).post('/api/v1/event', {
            orgId: '111', iCal: `BEGIN:VCALENDAR
1@elyoos.org
END:VCALENDAR`
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Event {uid: '1@elyoos.org'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });

    it('Export modified website event to original networking platform', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.createWebsiteEvent('1@elyoos.org', {organizationId: '1', modified: 666});
        dbDsl.exportEventToNp({uid: '1@elyoos.org', npId: '1', lastExportTimestamp: 665});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/api/v1/event/1@elyoos.org', {
            iCal: `BEGIN:VCALENDAR
1@elyoos.org
END:VCALENDAR`
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Event {uid: '1@elyoos.org'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });
});
