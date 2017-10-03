'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Integration Tests for getting organizations created by an networking platform', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminId: '1', name: 'Elyoos', description: 'description', link:'www.npLink.org'});
            dbDsl.createNetworkingPlatform('2', {adminId: '2', name: 'Elyoos2', description: 'description2', link:'www.npLink2.org'});

            dbDsl.createOrganization('1', {networkingPlatformId: '1', adminIds: ['2'], created: 500});
            dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['3'], created: 502});
            dbDsl.createOrganization('3', {networkingPlatformId: '1', adminIds: ['1'], created: 504});
            dbDsl.createOrganization('4', {networkingPlatformId: '2', adminIds: ['2'], created: 506});

            dbDsl.exportOrgToNp({organizationId: '2', npId: '2', lastExportTimestamp: 504});

        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting organization created by networking platform', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/orgCreatedByNp',
                {platformId: '1', skip: 0, limit: 10, maxTime: 504});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.org.length.should.equals(3);
            res.body.org[0].name.should.equals('organization3Name');
            res.body.org[0].organizationId.should.equals('3');
            res.body.org[0].created.should.equals(504);
            res.body.org[1].name.should.equals('organization2Name');
            res.body.org[1].organizationId.should.equals('2');
            res.body.org[1].created.should.equals(502);
            res.body.org[2].name.should.equals('organization1Name');
            res.body.org[2].organizationId.should.equals('1');
            res.body.org[2].created.should.equals(500);
        });
    });

    it('Getting organization created by networking platform (Only older then timestamp)', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/orgCreatedByNp',
                {platformId: '1', skip: 0, limit: 10, maxTime: 503});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.org.length.should.equals(2);
            res.body.org[0].name.should.equals('organization2Name');
            res.body.org[0].organizationId.should.equals('2');
            res.body.org[0].created.should.equals(502);
            res.body.org[1].name.should.equals('organization1Name');
            res.body.org[1].organizationId.should.equals('1');
            res.body.org[1].created.should.equals(500);
        });
    });

    it('Getting organization created by networking platform (Skip and limit)', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/orgCreatedByNp',
                {platformId: '1', skip: 1, limit: 1, maxTime: 510});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.org.length.should.equals(1);
            res.body.org[0].name.should.equals('organization2Name');
            res.body.org[0].organizationId.should.equals('2');
            res.body.org[0].created.should.equals(502);
        });
    });


    it('Only allow to get created organization when administrator of networking platforms', function () {
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/orgCreatedByNp',
                {platformId: '2', skip: 0, limit: 10, maxTime: 510});
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });
});