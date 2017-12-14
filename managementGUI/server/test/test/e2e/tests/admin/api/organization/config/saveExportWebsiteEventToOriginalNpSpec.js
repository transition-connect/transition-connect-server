'use strict';

let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');
let should = require('chai').should();

describe('Saving export config for events imported from a project website and send to the original networking platform', function () {

    let startTime;

    beforeEach(async function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
        dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link: 'www.link.org'});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2'], name: 'Elyoos2', description: 'description2', link: 'www.link2.org'});

        dbDsl.createCategory(16);

        dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['1', '6', '7']});
        dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['10', '11']});

        dbDsl.createOrganization('1', {networkingPlatformId: '2', adminIds: ['2'], created: 500});
        dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1', '3'], created: 502});

        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '1', lastConfigUpdate: 600, categories: ['1', '6']});
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', lastConfigUpdate: 601, categories: ['11']});
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Activate export of events with non existing rules', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});

        dbDsl.createWebsiteEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.createWebsiteEvent('2', {organizationId: '1', startDate: 400, endDate: 405});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/exportWebsiteEvents',
            {organizationId: '2', exportActive: true});
        res.status.should.equal(200);
        let resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`exportedNP`)
            .end().send();
        resp.length.should.equals(1);

        resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:WEBSITE_EVENT]->(event:Event)
                                      -[export:EXPORT]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`export`)
            .end().send();
        resp.length.should.equals(1);
        should.not.exist(resp[0].export.lastExportTimestamp);
    });

    it('Deactivate export of events with existing rules', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});

        dbDsl.createWebsiteEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.createWebsiteEvent('2', {organizationId: '1', startDate: 400, endDate: 405});
        dbDsl.createEventExportRule('2', {npId: '1'});
        dbDsl.exportEventToNp({uid: '1', npId: '1'});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/exportWebsiteEvents',
            {organizationId: '2', exportActive: false});
        res.status.should.equal(200);
        let resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`exportedNP`)
            .end().send();
        resp.length.should.equals(0);

        resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:WEBSITE_EVENT]->(event:Event)
                                      -[export:EXPORT]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`export`)
            .end().send();
        resp.length.should.equals(0);
    });

    it('Deactivate export of events with existing rules and create DELETE_REQUEST', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});

        dbDsl.createWebsiteEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.createWebsiteEvent('2', {organizationId: '1', startDate: 400, endDate: 405});
        dbDsl.createEventExportRule('2', {npId: '1'});
        dbDsl.exportEventToNp({uid: '1', npId: '1', lastExportTimestamp: 755});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/exportWebsiteEvents',
            {organizationId: '2', exportActive: false});
        res.status.should.equal(200);
        let resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`exportedNP`).end().send();
        resp.length.should.equals(0);

        resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:WEBSITE_EVENT]->(event:Event)
                                      -[export:EXPORT]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`export`).end().send();
        resp.length.should.equals(0);

        resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:WEBSITE_EVENT]->(event:Event)
                                      -[export:DELETE_REQUEST]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`export`).end().send();
        resp.length.should.equals(1);
        resp[0].export.lastExportTimestamp.should.equals(755);
    });

    it('Activate export of events and DELETE_REQUEST event', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});

        dbDsl.createWebsiteEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.createWebsiteEvent('2', {organizationId: '1', startDate: 400, endDate: 405});
        dbDsl.exportEventDeleteRequestToNp({uid: '1', npId: '1', lastExportTimestamp: 755});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/exportWebsiteEvents',
            {organizationId: '2', exportActive: true});
        res.status.should.equal(200);
        let resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`exportedNP`).end().send();
        resp.length.should.equals(1);

        resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:WEBSITE_EVENT]->(event:Event)
                                      -[export:EXPORT]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`export`).end().send();
        resp.length.should.equals(1);
        resp[0].export.lastExportTimestamp.should.equals(755);

        resp = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:WEBSITE_EVENT]->(event:Event)
                                      -[export:DELETE_REQUEST]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
            .return(`export`).end().send();
        resp.length.should.equals(0);
    });
});