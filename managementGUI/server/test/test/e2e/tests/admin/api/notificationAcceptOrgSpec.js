'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Getting notifications for an networking platform to accepting an new organization', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos'});
            dbDsl.createNetworkingPlatform('2', {adminIds: ['1'], name: 'Elyoos2'});
            dbDsl.createOrganization('1', {networkingPlatformId: '1', adminIds: ['1'], created: 500, lastConfigUpdate: 600});
            dbDsl.exportRequestOrgToNp({organizationId: '1', npId: '2'});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Notification request export', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api');
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.notification.length.should.equals(1);

            res.body.notification[0].action.should.equals('EXPORT_REQUEST');
            res.body.notification[0].actionData.organizationName.should.equals('organization1Name');
            res.body.notification[0].actionData.organizationId.should.equals('1');
            res.body.notification[0].actionData.nameNetworkingPlatform.should.equals('Elyoos2');
            res.body.notification[0].actionData.platformId.should.equals('2');
        });
    });
});
