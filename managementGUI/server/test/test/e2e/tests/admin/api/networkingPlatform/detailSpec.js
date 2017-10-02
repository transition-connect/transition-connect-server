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

            dbDsl.createCategory(10);

            dbDsl.mapNetworkingPlatformToCategory('1', {npId: '1', usedCategoryId: '1', similarCategoryIds: ['3', '4', '5']});
            dbDsl.mapNetworkingPlatformToCategory('2', {npId: '1', usedCategoryId: '6', similarCategoryIds: ['8']});
            dbDsl.mapNetworkingPlatformToCategory('3', {npId: '1', usedCategoryId: '7', similarCategoryIds: ['9']});

            dbDsl.createOrganization('1', {networkingPlatformId: '2', adminIds: ['2'], created: 500});
            dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['3'], created: 502});
            dbDsl.createOrganization('3', {networkingPlatformId: '1', adminIds: ['1'], created: 504});
            dbDsl.createOrganization('4', {networkingPlatformId: '1', adminIds: ['2'], created: 506});
            dbDsl.createOrganization('5', {networkingPlatformId: '3', adminIds: ['3'], created: 508});
            dbDsl.createOrganization('6', {networkingPlatformId: '3', adminIds: ['3'], created: 510});
            dbDsl.createOrganization('7', {networkingPlatformId: '3', adminIds: ['3'], created: 510});
            dbDsl.createOrganization('8', {networkingPlatformId: '3', adminIds: ['3'], created: 510});
            dbDsl.createOrganization('9', {networkingPlatformId: '3', adminIds: ['3'], created: 510});
            dbDsl.createOrganization('10', {networkingPlatformId: '3', adminIds: ['3'], created: 510});
            dbDsl.createOrganization('11', {networkingPlatformId: '3', adminIds: ['3'], created: 510});
            dbDsl.createOrganization('12', {networkingPlatformId: '3', adminIds: ['3'], created: 510});

            dbDsl.exportOrgToNp({organizationId: '2', npId: '2', exportTimestamp: 504});
            dbDsl.exportOrgToNp({organizationId: '2', npId: '3'});
            dbDsl.exportOrgToNp({organizationId: '5', npId: '1', exportTimestamp: 505});
            dbDsl.exportOrgToNp({organizationId: '6', npId: '1'});
            dbDsl.exportRequestOrgToNp({organizationId: '9', npId: '1', requestTimestamp: 500});
            dbDsl.exportRequestOrgToNp({organizationId: '10', npId: '1', requestTimestamp: 501});
            dbDsl.exportDenyOrgToNp({organizationId: '11', npId: '1', timestamp: 500});
            dbDsl.exportDenyOrgToNp({organizationId: '12', npId: '1', timestamp: 501});
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

            res.body.orgCreatedByNp.length.should.equals(3);
            res.body.orgCreatedByNp[0].name.should.equals('organization4Name');
            res.body.orgCreatedByNp[0].organizationId.should.equals('4');
            res.body.orgCreatedByNp[0].created.should.equals(506);
            res.body.orgCreatedByNp[1].name.should.equals('organization3Name');
            res.body.orgCreatedByNp[1].organizationId.should.equals('3');
            res.body.orgCreatedByNp[1].created.should.equals(504);
            res.body.orgCreatedByNp[2].name.should.equals('organization2Name');
            res.body.orgCreatedByNp[2].organizationId.should.equals('2');
            res.body.orgCreatedByNp[2].created.should.equals(502);

            res.body.orgExportedToNp.length.should.equals(2);
            res.body.orgExportedToNp[0].name.should.equals('organization6Name');
            res.body.orgExportedToNp[0].organizationId.should.equals('6');
            res.body.orgExportedToNp[1].name.should.equals('organization5Name');
            res.body.orgExportedToNp[1].organizationId.should.equals('5');
            res.body.orgExportedToNp[1].exportTimestamp.should.equals(505);

            res.body.orgRequestedExportToNp.length.should.equals(2);
            res.body.orgRequestedExportToNp[0].name.should.equals('organization10Name');
            res.body.orgRequestedExportToNp[0].organizationId.should.equals('10');
            res.body.orgRequestedExportToNp[1].name.should.equals('organization9Name');
            res.body.orgRequestedExportToNp[1].organizationId.should.equals('9');

            res.body.orgDeniedExportToNp.length.should.equals(2);
            res.body.orgDeniedExportToNp[0].name.should.equals('organization12Name');
            res.body.orgDeniedExportToNp[0].organizationId.should.equals('12');
            res.body.orgDeniedExportToNp[1].name.should.equals('organization11Name');
            res.body.orgDeniedExportToNp[1].organizationId.should.equals('11');
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