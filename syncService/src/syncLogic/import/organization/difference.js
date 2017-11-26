'use strict';

let db = require('server-lib').neo4j;
let _ = require('lodash');

let getUnchangedOrganizations = function (organizations, platformId) {
    return db.cypher().unwind(`{organizations} AS organization`)
        .match(`(orgDatabase:Organization {organizationIdOnExternalNP: organization.id})<-[:CREATED]-
                (np:NetworkingPlatform {platformId: {platformId}})`)
        .where(`organization.timestamp = orgDatabase.modifiedOnNp`)
        .return(`orgDatabase.organizationIdOnExternalNP AS id, orgDatabase.modifiedOnNp AS timestamp`)
        .end({organizations: organizations, platformId: platformId});
};

let getOrgToImport = async function (organizations, platformId) {
    let unchangedOrgs = await getUnchangedOrganizations(organizations, platformId).send();
    return _.differenceBy(organizations, unchangedOrgs, 'id');
};

module.exports = {
    getOrgToImport
};
