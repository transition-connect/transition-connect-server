'use strict';

let db = require('server-lib').neo4j;
let adapter = requireAdapter();

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
                 org.website AS website, org.slogan AS slogan, COLLECT(category.categoryId) AS categories`)
        .end({platformId: npConfig.np.platformId}).send();
    if (orgsToExport.length > 0) {
        await adapter.exportOrganizations(orgsToExport, npConfig.config.adapterType,
            npConfig.config.npApiUrl);
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
                 org.website AS website, org.slogan AS slogan, COLLECT(category.categoryId) AS categories`)
        .end({platformId: npConfig.np.platformId}).send();
    if (orgsToExport.length > 0) {
        await adapter.exportOrganizations(orgsToExport, npConfig.config.adapterType,
            npConfig.config.npApiUrl);
    }

};

let exportOrganizations = async function (npConfig) {
    await exportNewOrganizations(npConfig);
    await exportModifiedOrganizations(npConfig);
};

module.exports = {
    exportOrganizations
};
