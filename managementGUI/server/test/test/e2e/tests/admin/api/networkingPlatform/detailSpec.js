'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Integration Tests for getting details of a networking platform', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminId: '1', name: 'Elyoos', description: 'description', link:'www.npLink.org'});
            dbDsl.createNetworkingPlatform('2', {adminId: '2', name: 'Elyoos2', description: 'description2', link:'www.npLink2.org'});
            dbDsl.createNetworkingPlatform('3', {adminId: '3', name: 'Elyoos3', description: 'description3', link:'www.npLink3.org'});

            dbDsl.createCategory(15);

            dbDsl.mapNetworkingPlatformToCategory('1', {npId: '1', usedCategoryId: '1', similarCategoryIds: ['3', '4', '5']});
            dbDsl.mapNetworkingPlatformToCategory('2', {npId: '1', usedCategoryId: '6', similarCategoryIds: ['8']});
            dbDsl.mapNetworkingPlatformToCategory('3', {npId: '1', usedCategoryId: '7', similarCategoryIds: ['9']});
            dbDsl.mapNetworkingPlatformToCategory('4', {npId: '2', usedCategoryId: '10', similarCategoryIds: ['8']});
            dbDsl.mapNetworkingPlatformToCategory('5', {npId: '2', usedCategoryId: '11', similarCategoryIds: ['12']});
            dbDsl.mapNetworkingPlatformToCategory('6', {npId: '3', usedCategoryId: '13', similarCategoryIds: []});
            dbDsl.mapNetworkingPlatformToCategory('7', {npId: '3', usedCategoryId: '14', similarCategoryIds: []});

            dbDsl.createOrganization('1', {networkingPlatformId: '2', adminIds: ['2'], created: 500, lastUpdate: 500});
            dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['3'], created: 502, lastUpdate: 503});
            dbDsl.createOrganization('3', {networkingPlatformId: '1', adminIds: ['1'], created: 504, lastUpdate: 505});
            dbDsl.createOrganization('4', {networkingPlatformId: '1', adminIds: ['2'], created: 506, lastUpdate: 507});
            dbDsl.createOrganization('5', {networkingPlatformId: '3', adminIds: ['3'], created: 508, lastUpdate: 509});
            dbDsl.createOrganization('6', {networkingPlatformId: '3', adminIds: ['3'], created: 510, lastUpdate: 511});

            dbDsl.assignOrganizationToCategory('1', {organizationId: '2', npId: '1', categories: ['1', '6']});
            dbDsl.assignOrganizationToCategory('2', {organizationId: '2', npId: '2', categories: ['10']});
            dbDsl.assignOrganizationToCategory('3', {organizationId: '2', npId: '3', categories: ['13', '14']});
            dbDsl.assignOrganizationToCategory('4', {organizationId: '3', npId: '1', categories: ['7', '6']});
            dbDsl.assignOrganizationToCategory('5', {organizationId: '4', npId: '1', categories: ['7']});
            dbDsl.assignOrganizationToCategory('6', {organizationId: '5', npId: '1', categories: ['6']});
            dbDsl.assignOrganizationToCategory('7', {organizationId: '5', npId: '3', categories: ['13']});
            dbDsl.assignOrganizationToCategory('8', {organizationId: '6', npId: '1', categories: ['1']});
            dbDsl.assignOrganizationToCategory('9', {organizationId: '6', npId: '3', categories: ['14']});

            dbDsl.exportOrgToNp({organizationId: '2', npId: '2', exportTimestamp: 504});
            dbDsl.exportOrgToNp({organizationId: '2', npId: '3'});
            dbDsl.exportOrgToNp({organizationId: '5', npId: '1', exportTimestamp: 505});
            dbDsl.exportOrgToNp({organizationId: '6', npId: '1'});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting details of networking platform', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/detail',
                {platformId: '1', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.np.name.should.equals('Elyoos');
            res.body.np.description.should.equals('description');
            res.body.np.link.should.equals('www.npLink.org');
            res.body.np.categories.length.should.equals(3);
            res.body.np.categories[0].should.equals('Deutsch1');
            res.body.np.categories[1].should.equals('Deutsch6');
            res.body.np.categories[2].should.equals('Deutsch7');
        });
    });


    it('Only allow to get detail of administrated networking platforms', function () {
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/networkingPlatform/detail',
                {organizationId: '1', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });
});