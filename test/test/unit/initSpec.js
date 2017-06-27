'use strict';

if (!process.env.BASE_DIR) {
    process.env.BASE_DIR = __dirname + '/../../../';
}

global.requireDb = function () {
    return require(`${process.env.BASE_DIR}/src/lib`).neo4j;
};

global.requireLib = function () {
    return require(`${process.env.BASE_DIR}/src/lib`);
};

global.requireModel = function (name) {
    return require(`${process.env.BASE_DIR}/src/model/${name}`);
};

let dbConfig = requireLib().databaseConfig;
let chai = require('chai')
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