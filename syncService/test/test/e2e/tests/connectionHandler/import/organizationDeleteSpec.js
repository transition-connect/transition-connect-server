'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let sinon = require('sinon');
let emailQueue = require('server-lib').eMailQueue;
let nock = require('nock');
let expect = require('chai').expect;

describe('Delete an organisation because missing in import', function () {

    let sandbox;

    before(function () {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(async function () {
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
        dbDsl.createAdmin('3', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1']});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['1']});
        dbDsl.createNetworkingPlatformAdapterConfig('1', {adapterType: 'standardNp', npApiUrl: 'https://localhost.org', token: `1234`});

        dbDsl.createCategory(6);

        dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['0', '1']});
        dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['2', '3']});

        dbDsl.createOrganization('1', {
            networkingPlatformId: '1', adminIds: ['2', '3'], created: 500,
            organizationIdOnExternalNP: '111', name: 'organization', description: 'description', slogan: 'slogan',
            website: 'www.link.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '1', npId: '1', categories: ['0'], lastConfigUpdate: 501});

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/event').query({skip: 0})
            .reply(200, {events: []});
    });

    afterEach(function () {
        nock.cleanAll();
        sandbox.restore();
    });

    let counterOverflow = async function (createJob) {
        for (let cycle = 1; cycle < 4; cycle++) {
            await connectionHandler.startSync();
            let resp = await db.cypher().match("(:NetworkingPlatform)-[counter:DELETE_COUNTER]->(org:Organization {organizationId: '2'})")
                .return(`org, counter`).end().send();

            resp.length.should.equals(1);
            resp[0].counter.count.should.equals(cycle);
            expect(createJob.callCount).to.equals(0);
        }
    };

    it('Delete an organisation without events', async function () {

        dbDsl.createNetworkingPlatform('3', {adminIds: ['1']});
        dbDsl.mapNetworkingPlatformToCategory('3', {categoryIds: ['4', '5']});

        dbDsl.createOrganization('2', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '222', name: 'organization2', description: 'description2', slogan: 'slogan2',
            website: 'www.link2.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '1', categories: ['1'], lastConfigUpdate: 502});
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', categories: ['3'], lastConfigUpdate: 502});
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '3', categories: ['5'], lastConfigUpdate: 502});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '2', lastExportTimestamp: 900});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '3'});

        let createJob = sandbox.stub(emailQueue, 'createImmediatelyJob');
        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0}).times(5)
            .reply(200, {
                organisations: [{id: '111', timestamp: 500}]
            });

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 1}).times(5)
            .reply(200, {organisations: []});

        await dbDsl.sendToDb();
        await counterOverflow(createJob);

        await connectionHandler.startSync();
        let resp = await db.cypher().match("(:NetworkingPlatform)-[:DELETED]->(org:Organization {organizationId: '2'})")
            .optionalMatch(`(org)-[:EXPORT]->(exportedNp:NetworkingPlatform)`)
            .optionalMatch(`(org)-[:DELETE_REQUEST]->(exportedDeleteNp:NetworkingPlatform)`)
            .return(`org, count(DISTINCT exportedNp) AS numberOfExport,
                     count(DISTINCT exportedDeleteNp) AS numberOfDeleteRequest`).end().send();

        resp.length.should.equals(1);
        resp[0].numberOfExport.should.equals(0);
        resp[0].numberOfDeleteRequest.should.equals(1);
    });

    it('Delete an organisation with events', async function () {

        dbDsl.createOrganization('2', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500,
            organizationIdOnExternalNP: '222', name: 'organization2', description: 'description2', slogan: 'slogan2',
            website: 'www.link2.org'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '1', categories: ['1'], lastConfigUpdate: 502});
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', categories: ['3'], lastConfigUpdate: 502});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '2', lastExportTimestamp: 900});

        dbDsl.createNpEvent('1@example.org', {organizationId: '2', modifiedOnNp: 600});
        dbDsl.createNpEvent('2@example.org', {organizationId: '2', modifiedOnNp: 601});
        dbDsl.createWebsiteEvent('3@example.org', {organizationId: '2'});
        dbDsl.createWebsiteEvent('4@example.org', {organizationId: '2'});
        dbDsl.exportEventToNp({uid: '1@example.org', npId: '2', lastExportTimestamp: 700});
        dbDsl.exportEventToNp({uid: '2@example.org', npId: '2'});
        dbDsl.exportEventToNp({uid: '3@example.org', npId: '2', lastExportTimestamp: 701});
        dbDsl.exportEventToNp({uid: '4@example.org', npId: '2'});

        let createJob = sandbox.stub(emailQueue, 'createImmediatelyJob');
        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 0}).times(5)
            .reply(200, {
                organisations: [{id: '111', timestamp: 500}]
            });

        nock(`https://localhost.org`, {
            reqheaders: {'authorization': '1234'}
        }).get('/api/v1/organisation').query({skip: 1}).times(5)
            .reply(200, {organisations: []});

        await dbDsl.sendToDb();
        await counterOverflow(createJob);

        await connectionHandler.startSync();
        let resp = await db.cypher().match("(:NetworkingPlatform)-[:DELETED]->(org:Organization {organizationId: '2'})")
            .optionalMatch(`(org)-[:EXPORT]->(exportedNp:NetworkingPlatform)`)
            .optionalMatch(`(org)-[:DELETE_REQUEST]->(exportedDeleteNp:NetworkingPlatform)`)
            .optionalMatch(`(org)-[:EVENT|WEBSITE_EVENT]->(event:Event)-[:EXPORT]->(:NetworkingPlatform)`)
            .optionalMatch(`(org)-[:EVENT|WEBSITE_EVENT]->(eventDeleteRequest:Event)-[:DELETE_REQUEST]->(:NetworkingPlatform)`)
            .return(`org, count(DISTINCT exportedNp) AS numberOfExport,
                     count(DISTINCT exportedDeleteNp) AS numberOfDeleteRequest,
                     count(DISTINCT event) AS numberOfExportedEvents,
                     count(DISTINCT eventDeleteRequest) AS numberOfDeleteRequestEvents`).end().send();

        resp.length.should.equals(1);
        resp[0].numberOfExport.should.equals(0);
        resp[0].numberOfDeleteRequest.should.equals(1);
        resp[0].numberOfExportedEvents.should.equals(0);
        resp[0].numberOfDeleteRequestEvents.should.equals(2);
    });
});
