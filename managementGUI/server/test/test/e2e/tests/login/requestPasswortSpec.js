'use strict';

let db = requireTestUtil().db;
let dbDsl = requireTestUtil().dbDSL;
let requestHandler = requireTestUtil().requestHandler;
let moment = require('moment');

describe('Integration Tests for sending an email with a login password', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init();
    });

    it('Request a password for a valid email address', function () {

        dbDsl.createOrganization('1', {});
        dbDsl.createOrganization('2', {});

        dbDsl.createAdmin('1', {email: 'user1@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.setOrganizationAdmin('1', ['1']);
        dbDsl.setOrganizationAdmin('2', ['2']);

        return dbDsl.sendToDb().then(function () {
            return requestHandler.post('/login/requestPassword', {email: 'user1@irgendwo.ch'});
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match(`(admin:Admin {adminId: '1'})`)
                .return('admin').end().send();
        }).then(function (admin) {
            admin.length.should.equal(1);
            admin[0].admin.password.length.should.equal(6);
            admin[0].admin.passwordCreated.should.be.at.least(startTime);
        });
    });
});
