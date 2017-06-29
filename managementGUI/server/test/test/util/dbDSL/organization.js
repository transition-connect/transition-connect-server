'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createOrganization = function (organizationId, data) {
    data.name = data.name || `organization${organizationId}Name`;
    dbConnectionHandling.getCommands().push(db.cypher()
        .create(`(:Organization {organizationId: {organizationId}, name: {name}})`)
        .end({
            organizationId: organizationId, name: data.name
        }).getCommand());
};

module.exports = {
    createOrganization: createOrganization
};