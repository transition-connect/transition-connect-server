'use strict';

let app = require('../../../../../../../server');
let request = require('supertest');
let dbDsl = require('server-test-util').dbDSL;
let sinon = require('sinon');
let moment = require('moment');

describe('Integration Tests for sending an email with a login password', function () {

    let startTime, sandbox;

    before(function () {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user1@irgendwo.ch', password: '123', passwordCreated: startTime - 590});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch', password: '123', passwordCreated: startTime - 601});
            return dbDsl.sendToDb();
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Successful login', function (done) {
        request(app).post('/public/api/login').send({username: 'useR1@irgendwo.ch', password: '123'}).expect(200).end(done);
    });

    it('Login failed because of not existing admin', function (done) {
        request(app).post('/public/api/login').send({username: 'useR10@irgendwo.ch', password: '123'}).expect(400).end(done);
    });

    it('Login failed because of invalid password', function (done) {
        request(app).post('/public/api/login').send({username: 'useR1@irgendwo.ch', password: '124'}).expect(400).end(done);
    });

    it('Login failed because password has been expired', function (done) {
        request(app).post('/public/api/login').send({username: 'useR2@irgendwo.ch', password: '123'}).expect(400).end(done);
    });
});
