'use strict';

if (!process.env.BASE_DIR) {
    process.env.BASE_DIR = __dirname + '/../../../';
}

global.requireLib = function (name) {
    return require(`${process.env.BASE_DIR}/src/lib/${name}`);
};

let dbConfig = require('server-lib').databaseConfig;
let chai = require('chai');
let chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Initialize server unit test', function () {

    before(function () {
    });

    it('dummy test', function (done) {
        dbConfig.config({host: 'bolt://localhost:7688'}).then(function () {
            done();
        });
    });
});