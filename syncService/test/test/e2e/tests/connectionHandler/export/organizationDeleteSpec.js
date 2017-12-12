'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let nock = require('nock');

describe('Sending delete command for organization to an external networking platform', function () {

    beforeEach(async function () {
        await dbDsl.init();
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

    it('Delete command for organization send to networking platform', async function () {

        dbDsl.createOrganization('1', {
            networkingPlatformId: '2', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['1', '2'], lastConfigUpdate: 501});
        dbDsl.exportDeleteRequestToNp({organizationId: '1', created: 501, npId: '1', lastExportTimestamp: 621, idOnExportedNp: '555'});

        let scope = nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).delete('/api/v1/organisation/555').reply(201);

        await dbDsl.sendToDb();
        await connectionHandler.startSync();

        scope.isDone().should.equals(true);
        let resp = await db.cypher().match(`(org:Organization {organizationId: '1'})-[export:DELETE_REQUEST_SUCCESS]->(np:NetworkingPlatform {platformId: '1'})`)
            .return(`export.id AS id, EXISTS((org)-[:DELETE_REQUEST]->(np)) AS deleteRequest, export.created AS created`)
            .end().send();

        resp.length.should.equals(1);
        resp[0].id.should.equals('555');
        resp[0].deleteRequest.should.equals(false);
        resp[0].created.should.equals(501);
    });
});
