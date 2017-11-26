'use strict';

let db = require('server-lib').neo4j;
let adapter = requireAdapter('networkingPlatform/index');
let time = require('server-lib').time;
let logger = require('server-lib').logging.getLogger(__filename);

let logExportedOrg = function (description, organizations) {
    for (let organization of organizations) {
        logger.info(`${description} ${organization.name} successfully exported`);
    }
};

let setExportTimestamp = async function (organizations, platformId) {
    await db.cypher().match(`(:NetworkingPlatform {platformId: {platformId}})
                        <-[export:EXPORT]-(org:Organization)`)
        .where(`org.organizationId IN {organizations}`)
        .set(`export`, {lastExportTimestamp: time.getNowUtcTimestamp()})
        .end({
            platformId: platformId,
            organizations: organizations.map(organization => organization.uuid)
        }).send();
};

let exportNewOrganizations = async function (npConfig) {
    let orgsToExport = await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[exportRel:EXPORT]-(org:Organization)`)
        .where(`NOT EXISTS(exportRel.lastExportTimestamp)`)
        .with(`np, org`)
        .match(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
        .optionalMatch(`(assigner)-[:ASSIGNED]->(category:Category)`)
        .with(`org, category`)
        .orderBy(`category.categoryId`)
        .return(`org.organizationId AS uuid, org.name AS name, org.description AS description, 
                 org.website AS website, org.slogan AS slogan, org.language AS language,
                 COLLECT(category.idOnPlatform) AS categories`)
        .end({platformId: npConfig.np.platformId}).send();
    if (orgsToExport.length > 0) {
        await adapter.exportOrganizations(orgsToExport, npConfig.config.adapterType,
            npConfig.config.npApiUrl);
        await setExportTimestamp(orgsToExport, npConfig.np.platformId);
        logExportedOrg('New organization', orgsToExport);
    }

};

let exportModifiedOrganizations = async function (npConfig) {
    let orgsToExport = await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[exportRel:EXPORT]-(org:Organization)-[:ASSIGNED]->(assigner:CategoryAssigner)
                        -[:ASSIGNED]->(:NetworkingPlatform {platformId: {platformId}})`)
        .where(`EXISTS(exportRel.lastExportTimestamp) AND 
               (exportRel.lastExportTimestamp < org.modified OR 
                exportRel.lastExportTimestamp < assigner.lastConfigUpdate)`)
        .with(`np, org`)
        .match(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
        .optionalMatch(`(assigner)-[:ASSIGNED]->(category:Category)`)
        .with(`org, category`)
        .orderBy(`category.categoryId`)
        .return(`org.organizationId AS uuid, org.name AS name, org.description AS description, 
                 org.website AS website, org.slogan AS slogan, org.language AS language,
                 COLLECT(category.idOnPlatform) AS categories`)
        .end({platformId: npConfig.np.platformId}).send();
    if (orgsToExport.length > 0) {
        await adapter.exportOrganizations(orgsToExport, npConfig.config.adapterType,
            npConfig.config.npApiUrl);
        await setExportTimestamp(orgsToExport, npConfig.np.platformId);
        logExportedOrg('Modified organization', orgsToExport);
    }

};

let exportOrganizations = async function (npConfig) {
    await exportNewOrganizations(npConfig);
    await exportModifiedOrganizations(npConfig);
};

module.exports = {
    exportOrganizations
};
