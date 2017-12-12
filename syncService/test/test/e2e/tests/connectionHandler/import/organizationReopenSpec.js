'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let sinon = require('sinon');
let nock = require('nock');
let should = require('chai').should();

describe('Import of previously deleted organisations', function () {

    let sandbox;

    before(function () {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(async function () {
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1']});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2']});
        dbDsl.createNetworkingPlatform('3', {adminIds: ['2']});
        dbDsl.createNetworkingPlatformAdapterConfig('1', {adapterType: 'standardNp', npApiUrl: 'https://localhost.org', token: `1234`});

        dbDsl.createCategory(6);

        dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['0', '1', '2', '3']});
        dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['4', '5']});

        dbDsl.createOrganization('1', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500, modifiedOnNp: 700,
            organizationIdOnExternalNP: '11', name: 'organization1', description: 'description1', slogan: 'slogan1',
            website: 'www.link.org1'
        });
        dbDsl.createOrganization('2', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500, modifiedOnNp: 700,
            organizationIdOnExternalNP: '22', name: 'organization1', description: 'description1', slogan: 'slogan1',
            website: 'www.link.org1'
        });

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation/11')
            .reply(200, {
                name: 'organization1', description: 'description', slogan: 'slogan', website: 'www.link.org',
                categories: ['idOnPlatform1', 'idOnPlatform2'], admins: ['usER2@irgendwo.ch', 'user3@irgendwo.ch'],
                locations: [{
                    address: 'address', description: 'descriptionLocation',
                    geo: {latitude: 32.422422, longitude: -122.08585}
                }]
            });

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/event').query({skip: 0})
            .reply(200, {events: []});
    });

    afterEach(function () {
        nock.cleanAll();
        sandbox.restore();
    });


    it('Remove DELETED relationship when organization is listed', async function () {

        dbDsl.markDeleteOrganization(`1`);

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organisations: [{id: '11', timestamp: 500}]});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 1})
            .reply(200, {organisations: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match("(:NetworkingPlatform)-[:DELETED]->(org:Organization {organizationId: '1'})")
            .return(`org`).end().send();

        resp.length.should.equals(0);
    });

    it('Change DELETE_REQUEST relationship to EXPORT when organization is listed', async function () {

        dbDsl.markDeleteOrganization(`1`);
        dbDsl.exportDeleteRequestToNp({organizationId: '1', npId: '2', lastExportTimestamp: 501, idOnExportedNp: '555', created: 400});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organisations: [{id: '11', timestamp: 500}]});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 1})
            .reply(200, {organisations: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match("(:Organization {organizationId: '1'})-[export:EXPORT]->(np:NetworkingPlatform)")
            .return(`export, np`).orderBy(`export.created`).end().send();

        resp.length.should.equals(1);
        resp[0].np.platformId.should.equals('2');
        resp[0].export.lastExportTimestamp.should.equals(501);
        resp[0].export.id.should.equals('555');
        resp[0].export.created.should.equals(400);

        resp = await db.cypher().match("(:Organization {organizationId: '1'})-[:DELETE_REQUEST]->(np:NetworkingPlatform)")
            .return(`np`).end().send();
        resp.length.should.equals(0);
    });

    it('Change DELETE_REQUEST_SUCCESS relationship to EXPORT when organization is listed', async function () {

        dbDsl.markDeleteOrganization(`1`);
        dbDsl.exportDeleteSuccessToNp({organizationId: '1', npId: '2', created: 400});
        dbDsl.exportDeleteSuccessToNp({organizationId: '1', npId: '3', created: 401});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organisations: [{id: '11', timestamp: 500}]});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 1})
            .reply(200, {organisations: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match("(:Organization {organizationId: '1'})-[export:EXPORT]->(np:NetworkingPlatform)")
            .return(`export, np`).orderBy(`export.created`).end().send();

        resp.length.should.equals(2);
        resp[0].np.platformId.should.equals('2');
        should.not.exist(resp[0].export.lastExportTimestamp);
        should.not.exist(resp[0].export.id);
        resp[0].export.created.should.equals(400);

        resp[1].np.platformId.should.equals('3');
        should.not.exist(resp[1].export.lastExportTimestamp);
        should.not.exist(resp[1].export.id);
        resp[1].export.created.should.equals(401);

        resp = await db.cypher().match("(:Organization {organizationId: '1'})-[:DELETE_REQUEST_SUCCESS]->(np:NetworkingPlatform)")
            .return(`np`).end().send();
        resp.length.should.equals(0);
    });

    it('Remove DELETE_COUNTER relationship when organization is listed', async function () {

        dbDsl.deleteCounterOrganization(`1`, {count: 2});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organisations: [{id: '11', timestamp: 500}]});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 1})
            .reply(200, {organisations: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match("(:NetworkingPlatform)-[:DELETE_COUNTER]->(org:Organization {organizationId: '1'})")
            .return(`org`).end().send();

        resp.length.should.equals(0);
    });
});
