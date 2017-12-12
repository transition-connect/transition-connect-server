'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let moment = require('moment');
let nock = require('nock');

describe('Export organizations to an external networking platform', function () {

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

    it('Export organization for first time without locations', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1'});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).post('/api/v1/organisation', {
            uuid: '1', name: 'organization', description: 'description', website: 'www.link.org', slogan: 'slogan',
            categories: ['idOnPlatform1', 'idOnPlatform2'], admins: ['user2@irgendwo.ch']
        }).reply(201, {id: '555'});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Organization {organizationId: '1'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp, export.id AS id`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
        resp[0].id.should.equals('555');
    });

    it('Export organization for first time with locations', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1'});
        dbDsl.createLocation({organizationId: '1', address: 'address1', description: 'description1', latitude: 1, longitude: 2});
        dbDsl.createLocation({organizationId: '1', address: 'address2', description: 'description2', latitude: 3, longitude: 4});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).post('/api/v1/organisation', {
            uuid: '1', name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
            categories: ['idOnPlatform1', 'idOnPlatform2'], admins: ['user2@irgendwo.ch'],
            locations: [{
                address: 'address1',
                description: 'description1',
                geo: {latitude: 1, longitude: 2}
            }, {
                address: 'address2',
                description: 'description2',
                geo: {latitude: 3, longitude: 4}
            }]
        }).reply(201, {id: '555'});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(:Organization {organizationId: '1'})-[export:EXPORT]->(:NetworkingPlatform {platformId: '1'})`)
            .return(`export.lastExportTimestamp AS lastExportTimestamp, export.id AS id`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].lastExportTimestamp.should.at.least(startTime);
        resp[0].id.should.equals('555');
    });

    it('Update already exported organization because organization data has changed. Without locations.', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500, modified: 701,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/api/v1/organisation/555', {
            name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
            categories: ['idOnPlatform1', 'idOnPlatform2']
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

    it('Update already exported organization because organization data has changed. With locations.', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500, modified: 701,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});
        dbDsl.createLocation({organizationId: '1', address: 'address1', description: 'description1', latitude: 1, longitude: 2});
        dbDsl.createLocation({organizationId: '1', address: 'address2', description: 'description2', latitude: 3, longitude: 4});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/api/v1/organisation/555', {
            name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
            categories: ['idOnPlatform1', 'idOnPlatform2'],
            locations: [{
                address: 'address1',
                description: 'description1',
                geo: {latitude: 1, longitude: 2}
            }, {
                address: 'address2',
                description: 'description2',
                geo: {latitude: 3, longitude: 4}
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

    it('Update already exported organization because export categories has changed. Without locations.', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500, modified: 699,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 701});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});


        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/api/v1/organisation/555', {
            name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
            categories: ['idOnPlatform1', 'idOnPlatform2']
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

    it('Update already exported organization because export categories has changed. With locations.', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500, modified: 699,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 701});
        dbDsl.exportOrgToNp({organizationId: '1', npId: '1', lastExportTimestamp: 700, idOnExportedNp: '555'});
        dbDsl.createLocation({organizationId: '1', address: 'address1', description: 'description1', latitude: 1, longitude: 2});
        dbDsl.createLocation({organizationId: '1', address: 'address2', description: 'description2', latitude: 3, longitude: 4});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).put('/api/v1/organisation/555', {
            name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
            categories: ['idOnPlatform1', 'idOnPlatform2'],
            locations: [{
                address: 'address1',
                description: 'description1',
                geo: {latitude: 1, longitude: 2}
            }, {
                address: 'address2',
                description: 'description2',
                geo: {latitude: 3, longitude: 4}
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
