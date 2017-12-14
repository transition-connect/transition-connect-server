'use strict';

let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');
let should = require('chai').should();

describe('Saving export config for events of an organization created by a networking platform', function () {

    let startTime;

    beforeEach(async function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
        dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link: 'www.link.org'});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2'], name: 'Elyoos2', description: 'description2', link: 'www.link2.org'});
        dbDsl.createNetworkingPlatform('3', {adminIds: ['3'], name: 'Elyoos3', description: 'description3', link: 'www.link3.org'});

        dbDsl.createCategory(16);

        dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['1', '6', '7']});
        dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['10', '11']});
        dbDsl.mapNetworkingPlatformToCategory('3', {categoryIds: ['13', '14', '15']});

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
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '3', created: 600});

        dbDsl.createNpEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.createNpEvent('2', {organizationId: '1', startDate: 400, endDate: 405});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/export',
            {
                organizationId: '2', nps: [
                    {platformId: '2', org: {categories: ['10']}, events: {exportActive: false}},
                    {platformId: '3', org: {categories: ['14', '15']}, events: {exportActive: true}}]
            });
        res.status.should.equal(200);
        let configs = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform)`)
            .return(`exportedNP.platformId AS platformId`)
            .end().send();
        configs.length.should.equals(1);
        configs[0].platformId.should.equals('3');

        let nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:EXPORT]->(exportedNP:NetworkingPlatform)`)
            .return(`org, exportedNP.platformId AS platformId`)
            .end().send();
        nps.length.should.equals(1);
        nps[0].platformId.should.equals('3');
        nps[0].org.lastConfigUpdate.should.at.least(startTime);
    });

    it('Activate/Deactivate export of events', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '3', created: 600});

        dbDsl.createNpEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.createNpEvent('2', {organizationId: '1', startDate: 400, endDate: 405});
        dbDsl.createEventExportRule('2', {npId: '2'});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/export',
            {
                organizationId: '2', nps: [
                    {platformId: '2', org: {categories: ['10']}, events: {exportActive: false}},
                    {platformId: '3', org: {categories: ['14', '15']}, events: {exportActive: true}}]
            });
        res.status.should.equal(200);
        let configs = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform)`)
            .return(`exportedNP.platformId AS platformId`)
            .end().send();
        configs.length.should.equals(1);
        configs[0].platformId.should.equals('3');

        let nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:EXPORT]->(exportedNP:NetworkingPlatform)`)
            .return(`org, exportedNP.platformId AS platformId`)
            .end().send();
        nps.length.should.equals(1);
        nps[0].platformId.should.equals('3');
        nps[0].org.lastConfigUpdate.should.at.least(startTime);
    });

    it('Deactivate never exported events', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '3', created: 600});

        dbDsl.createNpEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.exportEventToNp({uid: '1', npId: '2'});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/export',
            {
                organizationId: '2', nps: [
                    {platformId: '2', org: {categories: ['10']}, events: {exportActive: false}}]
            });
        res.status.should.equal(200);
        let configs = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform)`)
            .return(`exportedNP.platformId AS platformId`)
            .end().send();
        configs.length.should.equals(0);

        let nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:EXPORT]->(exportedNP:NetworkingPlatform)`)
            .return(`org, exportedNP.platformId AS platformId`)
            .end().send();
        nps.length.should.equals(0);
    });

    it('Deactivate previously exported events', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '3', created: 600});

        dbDsl.createNpEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.exportEventToNp({uid: '1', npId: '2', lastExportTimestamp: 755});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/export',
            {
                organizationId: '2', nps: [
                    {platformId: '2', org: {categories: ['10']}, events: {exportActive: false}}]
            });
        res.status.should.equal(200);
        let configs = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform)`)
            .return(`exportedNP.platformId AS platformId`)
            .end().send();
        configs.length.should.equals(0);

        let nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:EXPORT]->(exportedNP:NetworkingPlatform)`)
            .return(`org, exportedNP.platformId AS platformId`)
            .end().send();
        nps.length.should.equals(0);

        nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:DELETE_REQUEST]->(exportedNP:NetworkingPlatform)`)
            .return(`org, exportedNP.platformId AS platformId`)
            .end().send();
        nps.length.should.equals(1);
    });

    it('Activate an event with DELETE_REQUEST relationship', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '2', created: 600});

        dbDsl.createNpEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.exportEventDeleteRequestToNp({uid: '1', npId: '2', lastExportTimestamp: 755});
        dbDsl.createEventExportRule('2', {npId: '2'});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/export',
            {
                organizationId: '2', nps: [
                    {platformId: '2', org: {categories: ['10']}, events: {exportActive: true}}]
            });
        res.status.should.equal(200);
        let configs = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform)`)
            .return(`exportedNP.platformId AS platformId`)
            .end().send();
        configs.length.should.equals(1);

        let nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:EXPORT]->(:NetworkingPlatform {platformId: '2'})`)
            .return(`export`)
            .end().send();
        nps.length.should.equals(1);
        nps[0].export.lastExportTimestamp.should.equals(755);

        nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:DELETE_REQUEST]->(exportedNP:NetworkingPlatform)`)
            .return(`export`)
            .end().send();
        nps.length.should.equals(0);
    });

    it('Activate an event with DELETE_REQUEST_SUCCESS relationship', async function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '2', created: 600});

        dbDsl.createNpEvent('1', {organizationId: '2', startDate: 400, endDate: 405});
        dbDsl.exportEventDeleteRequestSuccessToNp({uid: '1', npId: '2'});
        dbDsl.createEventExportRule('2', {npId: '2'});

        await dbDsl.sendToDb();
        await requestHandler.login(admin.validAdmin);
        let res = await requestHandler.put('/admin/api/organization/config/export',
            {
                organizationId: '2', nps: [
                    {platformId: '2', org: {categories: ['10']}, events: {exportActive: true}}]
            });
        res.status.should.equal(200);
        let configs = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform)`)
            .return(`exportedNP.platformId AS platformId`)
            .end().send();
        configs.length.should.equals(1);

        let nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:EXPORT]->(:NetworkingPlatform {platformId: '2'})`)
            .return(`export`)
            .end().send();
        nps.length.should.equals(1);
        should.not.exist(nps[0].export.lastExportTimestamp);

        nps = await db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT]->(event:Event)
                                      -[export:DELETE_REQUEST_SUCCESS]->(exportedNP:NetworkingPlatform)`)
            .return(`export`)
            .end().send();
        nps.length.should.equals(0);
    });
});