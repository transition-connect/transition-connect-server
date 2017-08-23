'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Getting overview of all organization for an Administrator', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});
            dbDsl.createNetworkingPlatform('1', {adminId: '2', name: 'Elyoos'});
            dbDsl.createNetworkingPlatform('2', {adminId: '3', name: 'Transition ZH'});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Organisation overview for an administrator', function () {

        dbDsl.createOrganization('1', {networkingPlatformId: '1', adminIds: ['2'], created: 500});
        dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1'], created: 502});
        dbDsl.createOrganization('3', {networkingPlatformId: '2', adminIds: ['1'], created: 501});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api');
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.length.should.equals(2);

            res.body.organization[0].name.should.equals('organization2Name');
            res.body.organization[0].created.should.equals(502);
            res.body.organization[0].organizationId.should.equals('2');
            res.body.organization[0].nameNetworkingPlatform.should.equals('Elyoos');

            res.body.organization[1].name.should.equals('organization3Name');
            res.body.organization[1].created.should.equals(501);
            res.body.organization[1].organizationId.should.equals('3');
            res.body.organization[1].nameNetworkingPlatform.should.equals('Transition ZH');

        });
    });
});
