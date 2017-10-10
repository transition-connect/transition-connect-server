'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Getting notifications for an Administrator of an Organisation', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});
            dbDsl.createNetworkingPlatform('1', {adminIds: ['2'], name: 'Elyoos'});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Notification init organisation configuration', function () {

        dbDsl.createOrganization('1', {networkingPlatformId: '1', adminIds: ['2'], created: 500});
        dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1'], created: 501});
        dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1'], created: 502, lastConfigUpdate: 503});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api');
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.notification.length.should.equals(1);

            res.body.notification[0].action.should.equals('INIT_ORGANISATION');
            res.body.notification[0].actionData.organizationName.should.equals('organization2Name');
            res.body.notification[0].actionData.organizationId.should.equals('2');
            res.body.notification[0].actionData.nameNetworkingPlatform.should.equals('Elyoos');
        });
    });
});
