'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Integration Tests for getting an admin overview of networking platforms, organisations and projects', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});
            dbDsl.createNetworkingPlatform('1', {adminId: '2', name: 'Elyoos'});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting an overview, only admin of organisation and projects', function () {

        dbDsl.createOrganization('1', {networkingPlatformId: '1', adminIds: ['2']});
        dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1'],
            status: {adminNP: '2', statusNP: 'ACCEPTED', adminOrg: '1', statusOrg: 'ACCEPTED'}});

        dbDsl.createProject('1', {adminIds: ['1'], organizationId: '2', created: 500,
            status: {adminNP: '2', statusNP: 'ACCEPTED'}});
        dbDsl.createProject('2', {adminIds: ['1'], organizationId: '2', created: 501,
            status: {adminNP: '2', statusNP: 'ACCEPTED', adminProject: '1', statusProject: 'ACCEPTED'}});
        dbDsl.createProject('3', {adminIds: ['3'], organizationId: '2', created: 502,
            status: {adminProject: '3', statusProject: 'ACCEPTED'}});
        dbDsl.createProject('4', {adminIds: ['2'], organizationId: '1', created: 503});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api');
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.length.should.equals(1);

            res.body.organization[0].name.should.equals('organization2Name');
            res.body.organization[0].organizationId.should.equals('2');
            res.body.organization[0].nameNetworkingPlatform.should.equals('Elyoos');
            res.body.organization[0].statusNetworkingPlatform.should.equals('accepted');
            res.body.organization[0].statusOrganizationAdmin.should.equals('accepted');
            res.body.organization[0].projects.length.should.equals(3);

            res.body.organization[0].projects[0].name.should.equals('project2Name');
            res.body.organization[0].projects[0].created.should.equals(501);
            res.body.organization[0].projects[0].projectId.should.equals('2');
            res.body.organization[0].projects[0].statusNetworkingPlatform.should.equals('accepted');
            res.body.organization[0].projects[0].statusProjectAdmin.should.equals('accepted');

            res.body.organization[0].projects[1].name.should.equals('project1Name');
            res.body.organization[0].projects[1].created.should.equals(500);
            res.body.organization[0].projects[1].projectId.should.equals('1');
            res.body.organization[0].projects[1].statusNetworkingPlatform.should.equals('accepted');
            res.body.organization[0].projects[1].statusProjectAdmin.should.equals('waiting');

            res.body.organization[0].projects[2].name.should.equals('project3Name');
            res.body.organization[0].projects[2].created.should.equals(502);
            res.body.organization[0].projects[2].projectId.should.equals('3');
            res.body.organization[0].projects[2].statusNetworkingPlatform.should.equals('waiting');
            res.body.organization[0].projects[2].statusProjectAdmin.should.equals('accepted');
        });
    });
});
