'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Integration Tests for getting selected categories by a networking platform', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminId: '1', name: 'Elyoos'});
            dbDsl.createNetworkingPlatform('2', {adminId: '2', name: 'Elyoos2'});

            dbDsl.createCategory(10);

            dbDsl.mapNetworkingPlatformToCategory('1', {npId: '1', usedCategoryId: '1', similarCategoryIds: ['3', '4', '5']});
            dbDsl.mapNetworkingPlatformToCategory('2', {npId: '1', usedCategoryId: '6', similarCategoryIds: ['8']});
            dbDsl.mapNetworkingPlatformToCategory('3', {npId: '2', usedCategoryId: '7', similarCategoryIds: ['8']});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting all selected categories', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/category/selected',
                {platformId: '1', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.category.length.should.equals(2);

            res.body.category[1].categoryId.should.equals('1');
            res.body.category[1].name.should.equals('Deutsch1');
            res.body.category[1].similar.length.should.equals(3);
            res.body.category[1].similar[0].name.should.equals('Deutsch3');
            res.body.category[1].similar[0].categoryId.should.equals('3');
            res.body.category[1].similar[1].name.should.equals('Deutsch4');
            res.body.category[1].similar[1].categoryId.should.equals('4');
            res.body.category[1].similar[2].name.should.equals('Deutsch5');
            res.body.category[1].similar[2].categoryId.should.equals('5');

            res.body.category[0].categoryId.should.equals('6');
            res.body.category[0].name.should.equals('Deutsch6');
            res.body.category[0].similar.length.should.equals(1);
            res.body.category[0].similar[0].name.should.equals('Deutsch8');
            res.body.category[0].similar[0].categoryId.should.equals('8');
        });
    });
});
