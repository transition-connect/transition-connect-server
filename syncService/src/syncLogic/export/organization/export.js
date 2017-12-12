'use strict';

let db = require('server-lib').neo4j;
let _ = require(`lodash`);
let time = require('server-lib').time;
let logger = require('server-lib').logging.getLogger(__filename);


let getLocation = function (locations) {
    let locationsToSend = [];
    for (let location of locations) {
        let locationToSend = {
            address: location.address,
            geo: {latitude: location.latitude, longitude: location.longitude}
        };
        if (location.description) {
            locationToSend.description = location.description;
        }
        locationsToSend.push(locationToSend);
    }
    return _.sortBy(locationsToSend, ['address']);
};

let getExportData = function (orgsToExport) {
    let exportData = [];
    for (let orgToExport of orgsToExport) {
        let org = {
            name: orgToExport.name, description: orgToExport.description,
            categories: orgToExport.categories.sort()
        };
        if (orgToExport.website) {
            org.website = orgToExport.website;
        }
        if (orgToExport.slogan) {
            org.slogan = orgToExport.slogan;
        }
        if (orgToExport.firstExport) {
            org.admins = orgToExport.admins.sort();
            org.uuid = orgToExport.uuid;
        }
        if (orgToExport.locations && orgToExport.locations.length > 0) {
            org.locations = getLocation(orgToExport.locations);
        }
        exportData.push({
            org: org, organizationId: orgToExport.uuid,
            firstExport: orgToExport.firstExport, idForExport: orgToExport.idForExport
        });
    }
    return exportData;
};

let getOrganizationsToExport = async function (platformId) {

    let orgsToExport = await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[exportRel:EXPORT]-(org:Organization)-[:ASSIGNED]->(assigner:CategoryAssigner)
                        -[:ASSIGNED]->(:NetworkingPlatform {platformId: {platformId}})`)
        .match(`(assigner)-[:ASSIGNED]->(category:Category)`)
        .where(`(exportRel.lastExportTimestamp < org.modified OR exportRel.lastExportTimestamp < assigner.lastConfigUpdate) OR
                 NOT EXISTS(exportRel.lastExportTimestamp)`)
        .match(`(org)<-[:IS_ADMIN]-(admin:Admin)`)
        .optionalMatch(`(org)-[:HAS]->(location:Location)`)
        .return(`org.organizationId AS uuid, org.name AS name, org.description AS description, 
                 org.website AS website, org.slogan AS slogan, COLLECT(DISTINCT category.idOnPlatform) AS categories, 
                 COLLECT(DISTINCT admin.email) AS admins, COLLECT(DISTINCT location) AS locations,
                 NOT EXISTS(exportRel.lastExportTimestamp) AS firstExport, exportRel.id AS idForExport`)
        .end({platformId: platformId}).send();

    return getExportData(orgsToExport);
};

let setOrganizationAsExported = async function (orgIdOnExportedPlatform, organizationId, platformId) {

    await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[exportRel:EXPORT|DELETE_REQUEST]-(org:Organization {organizationId: {organizationId}})`)
        .set(`exportRel`, {lastExportTimestamp: time.getNowUtcTimestamp(), id: orgIdOnExportedPlatform})
        .end({platformId: platformId, organizationId: organizationId}).send();
};

module.exports = {
    getOrganizationsToExport,
    setOrganizationAsExported
};
