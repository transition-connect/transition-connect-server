'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createLocation = function (data) {
    data.address = data.address || `address${data.organizationId}`;
    data.description = data.description || `description${data.organizationId}`;
    data.latitude = data.latitude || 5;
    data.longitude = data.longitude || 6;

    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(organization:Organization {organizationId: {organizationId}})`)
        .create(`(organization)-[:HAS]->(:Location {address: {address}, description: {description}, 
                  latitude: {latitude}, longitude: {longitude}})`)
        .end({
            organizationId: data.organizationId, address: data.address, description: data.description,
            latitude: data.latitude, longitude: data.longitude
        }).getCommand());
};

module.exports = {
    createLocation
};