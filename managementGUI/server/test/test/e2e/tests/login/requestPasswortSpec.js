'use strict';

let db = require('server-test-util').db;
let dbDsl = require('server-test-util').dbDSL;
let requestHandler = require('server-test-util').requestHandler;
let sinon = require('sinon');
let moment = require('moment');
let emailQueue = require('server-lib').eMailQueue;
let expect = require('chai').expect;

describe('Integration Tests for sending an email with a login password', function () {

    let startTime, sandbox;

    before(function () {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Request a password for a valid email address', function () {

        let createJob = sandbox.stub(emailQueue, 'createImmediatelyJob');

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

            expect(createJob.callCount).to.equals(1);
            expect(createJob.withArgs('sendLoginPasswordJob', {password: sinon.match.any, email: 'user1@irgendwo.ch'}).calledOnce).to.be.true;

            return db.cypher().match(`(admin:Admin {adminId: '1'})`)
                .return('admin').end().send();
        }).then(function (admin) {
            admin.length.should.equal(1);
            admin[0].admin.password.length.should.equal(6);
            admin[0].admin.passwordCreated.should.be.at.least(startTime);
        });
    });

    it('Request a password for a valid email address (case insensitive)', function () {

        let createJob = sandbox.stub(emailQueue, 'createImmediatelyJob');

        dbDsl.createOrganization('1', {});
        dbDsl.createOrganization('2', {});

        dbDsl.createAdmin('1', {email: 'user1@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.setOrganizationAdmin('1', ['1']);
        dbDsl.setOrganizationAdmin('2', ['2']);

        return dbDsl.sendToDb().then(function () {
            return requestHandler.post('/login/requestPassword', {email: 'useR1@irgendwo.Ch'});
        }).then(function (res) {
            res.status.should.equal(200);

            expect(createJob.callCount).to.equals(1);
            expect(createJob.withArgs('sendLoginPasswordJob', {password: sinon.match.any, email: 'user1@irgendwo.ch'}).calledOnce).to.be.true;

            return db.cypher().match(`(admin:Admin {adminId: '1'})`)
                .return('admin').end().send();
        }).then(function (admin) {
            admin.length.should.equal(1);
            admin[0].admin.password.length.should.equal(6);
            admin[0].admin.passwordCreated.should.be.at.least(startTime);
        });
    });

    it('Request a password for a non existing email address', function () {

        let createJob = sandbox.stub(emailQueue, 'createImmediatelyJob');

        dbDsl.createOrganization('1', {});
        dbDsl.createOrganization('2', {});

        dbDsl.createAdmin('1', {email: 'user1@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.setOrganizationAdmin('1', ['1']);
        dbDsl.setOrganizationAdmin('2', ['2']);

        return dbDsl.sendToDb().then(function () {
            return requestHandler.post('/login/requestPassword', {email: 'user3@irgendwo.ch'});
        }).then(function (res) {
            res.status.should.equal(400);
            expect(createJob.callCount).to.equals(0);
        });
    });
});
