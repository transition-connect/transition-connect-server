"use strict";

let db = require('./db');
let dbDSL = require('./dbDSL');
let request = require('./request');
let stubLimitRate = require('./stubLimitRate');
let serverLib;

module.exports.db = db;
module.exports.dbDSL = dbDSL;
module.exports.requestHandler = request;
module.exports.stubLimitRate = stubLimitRate;

module.exports.init = function (newServerLib, app) {
    if (!serverLib) {
        serverLib = newServerLib;
        db.init(serverLib.neo4j);
        stubLimitRate().init(serverLib.limiteRate);
    }
    if (app) {
        request.setApplication(app);
    }
};
