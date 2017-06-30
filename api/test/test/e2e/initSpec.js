'use strict';

let app = require('../../../server');
let dbConfig = require('server-lib').databaseConfig;

let elyoosTestUtil = require('server-test-util');

elyoosTestUtil.init(require('server-lib'), app);

elyoosTestUtil.stubEmailQueue();
elyoosTestUtil.stubLimitRate();

let chai = require('chai');
let chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Initialize server for all integration tests', function () {

    before(function (done) {
        app.on('start', function () {
            dbConfig.connected.then(function () {
                done();
            });
        });
    });

    it('dummy test', function () {
    });
});
