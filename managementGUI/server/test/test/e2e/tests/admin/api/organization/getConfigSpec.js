'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Integration Tests for getting configuration of an organization', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminId: '1', name: 'Elyoos', description: 'description', link:'www.link.org'});
            dbDsl.createNetworkingPlatform('2', {adminId: '2', name: 'Elyoos2', description: 'description2', link:'www.link2.org'});
            dbDsl.createNetworkingPlatform('3', {adminId: '3', name: 'Elyoos3', description: 'description3', link:'www.link3.org'});

            dbDsl.createCategory(14);

            dbDsl.mapNetworkingPlatformToCategory('1', {npId: '1', usedCategoryId: '1', similarCategoryIds: ['3', '4', '5']});
            dbDsl.mapNetworkingPlatformToCategory('2', {npId: '1', usedCategoryId: '6', similarCategoryIds: ['8']});
            dbDsl.mapNetworkingPlatformToCategory('3', {npId: '1', usedCategoryId: '7', similarCategoryIds: ['9']});
            dbDsl.mapNetworkingPlatformToCategory('4', {npId: '2', usedCategoryId: '10', similarCategoryIds: ['8']});
            dbDsl.mapNetworkingPlatformToCategory('5', {npId: '2', usedCategoryId: '11', similarCategoryIds: ['12']});
            dbDsl.mapNetworkingPlatformToCategory('6', {npId: '3', usedCategoryId: '13', similarCategoryIds: []});

            dbDsl.createOrganization('1', {networkingPlatformId: '2', adminIds: ['2'], created: 500});
            dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1', '3'], created: 502});

            dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '1', categories: ['1', '6']});
            dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', categories: ['10']});

            dbDsl.exportOrgToNp({organizationId: '2', npId: '3'});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting configuration of organization', function () {

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/config',
                {organizationId: '2', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.name.should.equals('organization2Name');
            res.body.organization.administrators.length.should.equals(2);
            res.body.organization.administrators[0].should.equals('user3@irgendwo.ch');
            res.body.organization.administrators[1].should.equals('user@irgendwo.ch');

            res.body.networkingPlatforms.length.should.equals(2);

            res.body.networkingPlatforms[0].name.should.equals('Elyoos3');
            res.body.networkingPlatforms[0].description.should.equals('description3');
            res.body.networkingPlatforms[0].link.should.equals('www.link3.org');
            res.body.networkingPlatforms[0].platformId.should.equals('3');
            res.body.networkingPlatforms[0].isExported.should.equals(true);
            res.body.networkingPlatforms[0].categories.length.should.equals(1);
            res.body.networkingPlatforms[0].categories[0].name.should.equals('Deutsch13');
            res.body.networkingPlatforms[0].categories[0].categoryId.should.equals('13');
            res.body.networkingPlatforms[0].categories[0].isSelected.should.equals(false);

            res.body.networkingPlatforms[1].name.should.equals('Elyoos2');
            res.body.networkingPlatforms[1].description.should.equals('description2');
            res.body.networkingPlatforms[1].link.should.equals('www.link2.org');
            res.body.networkingPlatforms[1].platformId.should.equals('2');
            res.body.networkingPlatforms[1].isExported.should.equals(false);
            res.body.networkingPlatforms[1].categories.length.should.equals(2);
            res.body.networkingPlatforms[1].categories[0].name.should.equals('Deutsch10');
            res.body.networkingPlatforms[1].categories[0].categoryId.should.equals('10');
            res.body.networkingPlatforms[1].categories[0].isSelected.should.equals(true);
            res.body.networkingPlatforms[1].categories[1].name.should.equals('Deutsch11');
            res.body.networkingPlatforms[1].categories[1].categoryId.should.equals('11');
            res.body.networkingPlatforms[1].categories[1].isSelected.should.equals(false);
        });
    });

    it('Only allow to get config of administrated organizations', function () {
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/config',
                {organizationId: '1', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });
});