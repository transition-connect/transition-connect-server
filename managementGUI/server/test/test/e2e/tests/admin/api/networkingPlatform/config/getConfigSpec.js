'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;

describe('Integration Tests for getting the configuration of an networking platform', function () {

    beforeEach(function () {
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminIds: ['1', '3'], name: 'Elyoos', description: 'description', link:'www.link.org'});
            dbDsl.createNetworkingPlatform('2', {adminIds: ['2'], name: 'Elyoos2', description: 'description2', link:'www.link2.org'})
            dbDsl.createNetworkingPlatformExportRules('1', {manuallyAcceptOrganization: true});
            dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting configuration of networking platform', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/config',
                {platformId: '1'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.np.config.name.should.equals('Elyoos');
            res.body.np.config.description.should.equals('description');
            res.body.np.config.link.should.equals('www.link.org');
            res.body.np.config.manuallyAcceptOrganization.should.equals(true);
            res.body.np.administrators.length.should.equals(2);
            res.body.np.administrators[0].should.equals('user3@irgendwo.ch');
            res.body.np.administrators[1].should.equals('user@irgendwo.ch');
        });
    });

    it('Not allow to get config of not administrated networking platform', function () {
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/config',
                {platformId: '2'});
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });
});