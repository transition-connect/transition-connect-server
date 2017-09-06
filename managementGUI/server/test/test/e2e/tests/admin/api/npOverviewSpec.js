'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Getting all administrated networking platforms for an Administrator', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Organisation overview for an administrator', function () {

        dbDsl.createNetworkingPlatform('1', {adminId: '1', name: 'Elyoos'});
        dbDsl.createNetworkingPlatform('2', {adminId: '1', name: 'Transition ZH'});
        dbDsl.createNetworkingPlatform('3', {adminId: '2', name: 'Basel Wandel'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api');
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.nps.length.should.equals(2);

            res.body.nps[0].name.should.equals('Elyoos');
            res.body.nps[0].platformId.should.equals('1');

            res.body.nps[1].name.should.equals('Transition ZH');
            res.body.nps[1].platformId.should.equals('2');

        });
    });
});
