'use strict';

let dbDsl = require('server-test-util').dbDSL;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');

describe('Integration Tests for getting an admin overview of platforms, organisations and projects', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting an overview', function () {

        dbDsl.createOrganization('1', {});
        dbDsl.createOrganization('2', {});
        dbDsl.setOrganizationAdmin('1', ['2']);
        dbDsl.setOrganizationAdmin('2', ['1']);

        dbDsl.createProject('1', {adminId: '1', organizationId: '2', created: 500});
        dbDsl.createProject('2', {adminId: '1', organizationId: '2', created: 501});
        dbDsl.createProject('3', {adminId: '2', organizationId: '2', created: 502});
        dbDsl.createProject('4', {adminId: '2', organizationId: '1', created: 503});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.get('/admin/api');
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.overview.length.should.equals(1);

            res.body.overview[0].name.should.equals('organization2Name');
            res.body.overview[0].projects.length.should.equals(3);
            res.body.overview[0].projects[0].name.should.equals('project2Name');
            res.body.overview[0].projects[0].created.should.equals(501);
            res.body.overview[0].projects[1].name.should.equals('project1Name');
            res.body.overview[0].projects[1].created.should.equals(500);
            res.body.overview[0].projects[2].name.should.equals('project3Name');
            res.body.overview[0].projects[2].created.should.equals(502);
        });
    });
});
