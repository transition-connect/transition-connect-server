'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let moment = require('moment');
let nock = require('nock');

describe('Testing the export of organizations to an external networking platform', function () {

    let startTime;

    beforeEach(async function () {
        await dbDsl.init();
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1']});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2']});
        dbDsl.createNetworkingPlatformAdapterConfig('1', {adapterType: 'standardNp', npApiUrl: 'https://localhost.org', token: `1234`});
        dbDsl.createNetworkingPlatformAdapterConfig('2', {
            adapterType: 'standardNp', npApiUrl: 'https://localhost2.org', lastSync: 700, token: `1234`
        });

        dbDsl.createCategory(6);

        dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['0', '1', '2', '3']});
        dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['4', '5']});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/event').query({skip: 0})
            .reply(200, {events: []});
        nock(`https://localhost2.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/event').query({skip: 0})
            .reply(200, {events: []});
    });

    afterEach(function () {
        nock.cleanAll();
    });
    // (Delete organization because sync has been disabled by organization administrator)
    // (Delete organization because sync has been disabled by networking platform administrator)

    it('Export organization for first time', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1'});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});
        nock(`https://localhost2.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/organization', {
            organizations: [{
                uuid: '1', name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
                language: 'de', categories: ['idOnPlatform1', 'idOnPlatform2']
            }]
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Organization {organizationId: '1'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });

    it('Update already exported organization because organization data has changed', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500, modified: 701,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});
        nock(`https://localhost2.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/organization', {
            organizations: [{
                uuid: '1', name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
                language: 'de', categories: ['idOnPlatform1', 'idOnPlatform2']
            }]
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Organization {organizationId: '1'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });

    it('Update already exported organization because export categories has changed', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500, modified: 699,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 701});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});
        nock(`https://localhost2.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/organization', {
            organizations: [{
                uuid: '1', name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
                language: 'de', categories: ['idOnPlatform1', 'idOnPlatform2']
            }]
        }).reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Organization {organizationId: '1'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
    });
});
