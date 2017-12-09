'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;

describe('Integration Tests for getting details of an organization', function () {

    beforeEach(function () {
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link:'www.npLink.org'});
            dbDsl.createNetworkingPlatform('2', {adminIds: ['2'], name: 'Elyoos2', description: 'description2', link:'www.npLink2.org'});
            dbDsl.createNetworkingPlatform('3', {adminIds: ['3'], name: 'Elyoos3', description: 'description3', link:'www.npLink3.org'});

            dbDsl.createCategory(15);

            dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['1', '6', '7']});
            dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['10', '11']});
            dbDsl.mapNetworkingPlatformToCategory('3', {categoryIds: ['13', '14']});

            dbDsl.createOrganization('1', {networkingPlatformId: '2', adminIds: ['2'], created: 500});
            dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1', '3'], created: 502});

            dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '1', categories: ['1', '6']});
            dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '3', categories: ['13', '14']});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting details of organization with Website Events (Export status NOT_EXPORTED and EXPORTED)', function () {

        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', categories: ['10']});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '2', created: 500, lastExportTimestamp: 504});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '3', created: 501});

        dbDsl.createWebsiteEvent('1', {organizationId: '2', startDate: 500, endDate: 600});
        dbDsl.createWebsiteEvent('2', {organizationId: '2', startDate: 502, endDate: 602});
        dbDsl.createWebsiteEvent('3', {organizationId: '1', startDate: 501, endDate: 601});
        dbDsl.createNpEvent('4', {organizationId: '2', startDate: 400, endDate: 405});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '2', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.name.should.equals('organization2Name');
            res.body.organization.isAdmin.should.equals(true);
            res.body.organization.created.should.equals(502);
            res.body.organization.slogan.should.equals('best2Org');
            res.body.organization.description.should.equals('org2description');
            res.body.organization.website.should.equals('www.link2.org');
            res.body.organization.createdNetworkingPlatformName.should.equals('Elyoos');
            res.body.organization.categories.length.should.equals(2);
            res.body.organization.categories[0].should.equals('Deutsch1');
            res.body.organization.categories[1].should.equals('Deutsch6');
            res.body.organization.administrators.length.should.equals(2);
            res.body.organization.administrators[0].should.equals('user3@irgendwo.ch');
            res.body.organization.administrators[1].should.equals('user@irgendwo.ch');

            res.body.events.length.should.equals(3);
            res.body.events[0].uid.should.equals('2');
            res.body.events[0].summary.should.equals('event2Summary');
            res.body.events[0].description.should.equals('event2Description');
            res.body.events[0].location.should.equals('event2Location');
            res.body.events[0].startDate.should.equals(502);
            res.body.events[0].endDate.should.equals(602);

            res.body.events[1].uid.should.equals('1');
            res.body.events[1].summary.should.equals('event1Summary');
            res.body.events[1].description.should.equals('event1Description');
            res.body.events[1].location.should.equals('event1Location');
            res.body.events[1].startDate.should.equals(500);
            res.body.events[1].endDate.should.equals(600);

            res.body.events[2].uid.should.equals('4');
            res.body.events[2].summary.should.equals('event4Summary');
            res.body.events[2].description.should.equals('event4Description');
            res.body.events[2].location.should.equals('event4Location');
            res.body.events[2].startDate.should.equals(400);
            res.body.events[2].endDate.should.equals(405);

            res.body.exportedNetworkingPlatforms.length.should.equals(2);
            res.body.exportedNetworkingPlatforms[0].name.should.equals('Elyoos3');
            res.body.exportedNetworkingPlatforms[0].platformId.should.equals('3');
            res.body.exportedNetworkingPlatforms[0].description.should.equals('description3');
            res.body.exportedNetworkingPlatforms[0].link.should.equals('www.npLink3.org');
            res.body.exportedNetworkingPlatforms[0].status.should.equals('NOT_EXPORTED');
            res.body.exportedNetworkingPlatforms[0].categories.length.should.equals(2);
            res.body.exportedNetworkingPlatforms[0].categories[0].should.equals('Deutsch13');
            res.body.exportedNetworkingPlatforms[0].categories[1].should.equals('Deutsch14');

            res.body.exportedNetworkingPlatforms[1].name.should.equals('Elyoos2');
            res.body.exportedNetworkingPlatforms[1].platformId.should.equals('2');
            res.body.exportedNetworkingPlatforms[1].description.should.equals('description2');
            res.body.exportedNetworkingPlatforms[1].link.should.equals('www.npLink2.org');
            res.body.exportedNetworkingPlatforms[1].status.should.equals('EXPORTED');
            res.body.exportedNetworkingPlatforms[1].categories.length.should.equals(1);
            res.body.exportedNetworkingPlatforms[1].categories[0].should.equals('Deutsch10');
        });
    });

    it('Getting details of organization (Status EXPORT_UPDATE_NEEDED because config of org has been changed)', function () {

        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', categories: ['10'], lastConfigUpdate: 506});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '2', lastExportTimestamp: 505});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '2', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.name.should.equals('organization2Name');
            res.body.organization.isAdmin.should.equals(true);
            res.body.organization.created.should.equals(502);
            res.body.organization.slogan.should.equals('best2Org');
            res.body.organization.description.should.equals('org2description');
            res.body.organization.website.should.equals('www.link2.org');
            res.body.organization.createdNetworkingPlatformName.should.equals('Elyoos');
            res.body.organization.categories.length.should.equals(2);
            res.body.organization.categories[0].should.equals('Deutsch1');
            res.body.organization.categories[1].should.equals('Deutsch6');
            res.body.organization.administrators.length.should.equals(2);
            res.body.organization.administrators[0].should.equals('user3@irgendwo.ch');
            res.body.organization.administrators[1].should.equals('user@irgendwo.ch');

            res.body.exportedNetworkingPlatforms.length.should.equals(1);

            res.body.exportedNetworkingPlatforms[0].name.should.equals('Elyoos2');
            res.body.exportedNetworkingPlatforms[0].platformId.should.equals('2');
            res.body.exportedNetworkingPlatforms[0].description.should.equals('description2');
            res.body.exportedNetworkingPlatforms[0].link.should.equals('www.npLink2.org');
            res.body.exportedNetworkingPlatforms[0].status.should.equals('EXPORT_UPDATE_NEEDED');
            res.body.exportedNetworkingPlatforms[0].categories.length.should.equals(1);
            res.body.exportedNetworkingPlatforms[0].categories[0].should.equals('Deutsch10');
        });
    });

    it('Getting details of organization (Status EXPORT_UPDATE_NEEDED because org data has changed )', function () {

        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', categories: ['10'], lastConfigUpdate: 501});
        dbDsl.exportOrgToNp({organizationId: '2', npId: '2', lastExportTimestamp: 501});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '2', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.name.should.equals('organization2Name');
            res.body.organization.isAdmin.should.equals(true);
            res.body.organization.created.should.equals(502);
            res.body.organization.slogan.should.equals('best2Org');
            res.body.organization.description.should.equals('org2description');
            res.body.organization.website.should.equals('www.link2.org');
            res.body.organization.createdNetworkingPlatformName.should.equals('Elyoos');
            res.body.organization.categories.length.should.equals(2);
            res.body.organization.categories[0].should.equals('Deutsch1');
            res.body.organization.categories[1].should.equals('Deutsch6');
            res.body.organization.administrators.length.should.equals(2);
            res.body.organization.administrators[0].should.equals('user3@irgendwo.ch');
            res.body.organization.administrators[1].should.equals('user@irgendwo.ch');

            res.body.exportedNetworkingPlatforms.length.should.equals(1);

            res.body.exportedNetworkingPlatforms[0].name.should.equals('Elyoos2');
            res.body.exportedNetworkingPlatforms[0].platformId.should.equals('2');
            res.body.exportedNetworkingPlatforms[0].description.should.equals('description2');
            res.body.exportedNetworkingPlatforms[0].link.should.equals('www.npLink2.org');
            res.body.exportedNetworkingPlatforms[0].status.should.equals('EXPORT_UPDATE_NEEDED');
            res.body.exportedNetworkingPlatforms[0].categories.length.should.equals(1);
            res.body.exportedNetworkingPlatforms[0].categories[0].should.equals('Deutsch10');
        });
    });

    it('Getting details of organization (Export status EXPORT_REQUESTED)', function () {

        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', categories: ['10']});
        dbDsl.exportRequestOrgToNp({organizationId: '2', npId: '2'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '2', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.name.should.equals('organization2Name');
            res.body.organization.isAdmin.should.equals(true);
            res.body.organization.created.should.equals(502);
            res.body.organization.slogan.should.equals('best2Org');
            res.body.organization.description.should.equals('org2description');
            res.body.organization.website.should.equals('www.link2.org');
            res.body.organization.createdNetworkingPlatformName.should.equals('Elyoos');
            res.body.organization.categories.length.should.equals(2);
            res.body.organization.categories[0].should.equals('Deutsch1');
            res.body.organization.categories[1].should.equals('Deutsch6');
            res.body.organization.administrators.length.should.equals(2);
            res.body.organization.administrators[0].should.equals('user3@irgendwo.ch');
            res.body.organization.administrators[1].should.equals('user@irgendwo.ch');

            res.body.exportedNetworkingPlatforms.length.should.equals(1);

            res.body.exportedNetworkingPlatforms[0].name.should.equals('Elyoos2');
            res.body.exportedNetworkingPlatforms[0].platformId.should.equals('2');
            res.body.exportedNetworkingPlatforms[0].description.should.equals('description2');
            res.body.exportedNetworkingPlatforms[0].link.should.equals('www.npLink2.org');
            res.body.exportedNetworkingPlatforms[0].status.should.equals('EXPORT_REQUESTED');
            res.body.exportedNetworkingPlatforms[0].isAdminOfExportRequestedNp.should.equals(false);
            res.body.exportedNetworkingPlatforms[0].categories.length.should.equals(1);
            res.body.exportedNetworkingPlatforms[0].categories[0].should.equals('Deutsch10');
        });
    });

    it('Getting details of organization (Export status EXPORT_DENIED)', function () {

        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', categories: ['10']});
        dbDsl.exportDenyOrgToNp({organizationId: '2', npId: '2'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '2', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.name.should.equals('organization2Name');
            res.body.organization.isAdmin.should.equals(true);
            res.body.organization.created.should.equals(502);
            res.body.organization.slogan.should.equals('best2Org');
            res.body.organization.description.should.equals('org2description');
            res.body.organization.website.should.equals('www.link2.org');
            res.body.organization.createdNetworkingPlatformName.should.equals('Elyoos');
            res.body.organization.categories.length.should.equals(2);
            res.body.organization.categories[0].should.equals('Deutsch1');
            res.body.organization.categories[1].should.equals('Deutsch6');
            res.body.organization.administrators.length.should.equals(2);
            res.body.organization.administrators[0].should.equals('user3@irgendwo.ch');
            res.body.organization.administrators[1].should.equals('user@irgendwo.ch');

            res.body.exportedNetworkingPlatforms.length.should.equals(1);

            res.body.exportedNetworkingPlatforms[0].name.should.equals('Elyoos2');
            res.body.exportedNetworkingPlatforms[0].platformId.should.equals('2');
            res.body.exportedNetworkingPlatforms[0].description.should.equals('description2');
            res.body.exportedNetworkingPlatforms[0].link.should.equals('www.npLink2.org');
            res.body.exportedNetworkingPlatforms[0].status.should.equals('EXPORT_DENIED');
            res.body.exportedNetworkingPlatforms[0].isAdminOfExportRequestedNp.should.equals(false);
            res.body.exportedNetworkingPlatforms[0].categories.length.should.equals(1);
            res.body.exportedNetworkingPlatforms[0].categories[0].should.equals('Deutsch10');
        });
    });

    it('Organization details can be accessed by administrators of the original network platform', function () {

        dbDsl.createOrganization('3', {networkingPlatformId: '1', adminIds: ['2'], created: 500});
        dbDsl.assignOrganizationToCategory({organizationId: '3', npId: '1', categories: ['10']});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '3', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);
            res.body.organization.name.should.equals('organization3Name');
            res.body.organization.isAdmin.should.equals(false);
            res.body.organization.createdNetworkingPlatformName.should.equals('Elyoos');
            res.body.exportedNetworkingPlatforms.length.should.equals(0);
        });
    });

    it('Organization details can be accessed by administrators of exported network platform', function () {

        dbDsl.createOrganization('3', {networkingPlatformId: '2', adminIds: ['2'], created: 500});
        dbDsl.assignOrganizationToCategory({organizationId: '3', npId: '2', categories: ['10']});
        dbDsl.assignOrganizationToCategory({organizationId: '3', npId: '1', categories: ['11']});
        dbDsl.exportOrgToNp({organizationId: '3', npId: '1'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '3', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);
            res.body.organization.name.should.equals('organization3Name');
            res.body.organization.isAdmin.should.equals(false);
            res.body.organization.createdNetworkingPlatformName.should.equals('Elyoos2');
            res.body.exportedNetworkingPlatforms.length.should.equals(1);
        });
    });

    it('Organization details can be accessed by administrators of network platform with export request from organization', function () {

        dbDsl.createOrganization('3', {networkingPlatformId: '2', adminIds: ['2'], created: 500});
        dbDsl.assignOrganizationToCategory({organizationId: '3', npId: '2', categories: ['10']});
        dbDsl.assignOrganizationToCategory({organizationId: '3', npId: '1', categories: ['11']});
        dbDsl.exportRequestOrgToNp({organizationId: '3', npId: '1'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '3', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(200);
            res.body.organization.name.should.equals('organization3Name');
            res.body.organization.isAdmin.should.equals(false);
            res.body.organization.createdNetworkingPlatformName.should.equals('Elyoos2');
            res.body.exportedNetworkingPlatforms.length.should.equals(1);
            res.body.exportedNetworkingPlatforms[0].isAdminOfExportRequestedNp.should.equals(true);
        });
    });

    it('Only allow to get detail of administrated organizations', function () {
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api/organization/detail',
                {organizationId: '1', language: 'DE'});
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });
});