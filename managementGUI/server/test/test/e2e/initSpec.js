'use strict';

let app = require('../../../server');
let dbConfig = requireLib().databaseConfig;

global.requireTestUtil = function () {
    return require(`../util`);
};

requireTestUtil().init(requireLib(), app);

requireTestUtil().stubLimitRate();

let chai = require('chai');
let chaiSubset = require('chai-subset');
chai.use(chaiSubset);
require('chai').should();

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
