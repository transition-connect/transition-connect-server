'use strict';

let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Integration Tests for saving general config of an networking platform', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link: 'www.link.org'});
            dbDsl.createNetworkingPlatformExportRules('1', {manuallyAcceptOrganization: false});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Change general config of an networking platform', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/networkingPlatform/config/general',
                {
                    platformId: '1', description: 'description2', link: 'www.link.org2', manuallyAcceptOrganization: true,
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(np:NetworkingPlatform)-[:EXPORT_RULES]->(rules:ExportRules)")
                .return(`np, rules`)
                .end().send();
        }).then(function (resp) {
            resp.length.should.equals(1);
            resp[0].np.description.should.equals('description2');
            resp[0].np.link.should.equals('www.link.org2');
            resp[0].rules.manuallyAcceptOrganization.should.equals(true);
        });
    });

    it('Only allow to save export config of administrated organizations', function () {

        dbDsl.createNetworkingPlatform('2', {adminIds: ['2'], name: 'Elyoos', description: 'description', link: 'www.link.org'});
        dbDsl.createNetworkingPlatformExportRules('1', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/networkingPlatform/config/general',
                {
                    platformId: '2', description: 'description2', link: 'www.link.org2', manuallyAcceptOrganization: true,
                });
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });
});