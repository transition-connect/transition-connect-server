'use strict';

let db = require('server-lib').neo4j;
let uuid = require('server-lib').uuid;
let time = require('server-lib').time;
let logger = require('server-lib').logging.getLogger(__filename);

let addMandatoryProperties = function (organization) {
    organization.uuid = uuid.generateUUID();
    organization.website = organization.website || '';
    organization.slogan = organization.slogan || '';
    organization.adminsWithUuid = [];
    organization.locations = organization.locations || [];
    for (let admin of organization.admins) {
        organization.adminsWithUuid.push({email: admin, uuid: uuid.generateUUID()});
    }
};

let createNotExistingOrganization = function (id, timestamp, organization, platformId) {
    return db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .where(`NOT (np)-[:CREATED]->(:Organization {organizationIdOnExternalNP: {id}})`)
        .merge(`(np)-[:CREATED]->(orgDatabase:Organization {organizationIdOnExternalNP: {id}, 
                 organizationId: {organizationId}, name: {name}, 
                 description: {description}, slogan: {slogan}, website: {website}, 
                 created: {now}, modified: {now}, modifiedOnNp: {modifiedOnNp}})`)
        .with(`orgDatabase`)
        .unwind(`{adminsWithUuid} AS adminWithUuid`)
        .merge(`(admin:Admin {email: toLower(adminWithUuid.email)})`)
        .onCreate(`SET admin.adminId = adminWithUuid.uuid`)
        .merge(`(admin)-[:IS_ADMIN]->(orgDatabase)`)
        .return(`orgDatabase.organizationIdOnExternalNP AS id`)
        .end({
            id: id, organizationId: uuid.generateUUID(), name: organization.name,
            description: organization.description, slogan: organization.slogan,
            website: organization.website, adminsWithUuid: organization.adminsWithUuid,
            platformId: platformId, modifiedOnNp: timestamp, now: time.getNowUtcTimestamp()
        });
};

let modifyChangedOrganization = function (id, timestamp, organization, platformId) {
    return db.cypher().match(`(:NetworkingPlatform {platformId: {platformId}})-[:CREATED]->
                (orgDatabase:Organization {organizationIdOnExternalNP: {id}})`)
        .set(`orgDatabase`, {
            name: organization.name, description: organization.description,
            slogan: organization.slogan, website: organization.website,
            modifiedOnNp: timestamp, modified: time.getNowUtcTimestamp()
        })
        .return(`orgDatabase.organizationIdOnExternalNP AS id`)
        .end({id: id, platformId: platformId});
};

let addLocations = function (id, organization, platformId) {
    return db.cypher().match(`(:NetworkingPlatform {platformId: {platformId}})
                -[:CREATED]->(org:Organization {organizationIdOnExternalNP: {id}})`)
        .optionalMatch(`(org)-[rel:HAS]->(location:Location)`)
        .delete(`rel, location`)
        .with(`DISTINCT org`)
        .unwind(`{locations} AS location`)
        .merge(`(org)-[:HAS]->(:Location {address: location.address, description: location.description,
                                          latitude: location.geo.latitude, longitude: location.geo.longitude})`)
        .end({
            id: id, platformId: platformId, locations: organization.locations
        });
};

let createCategoryAssigner = function (id, organization, platformId) {
    return db.cypher().match(`(orgDatabase:Organization {organizationIdOnExternalNP: {id}})<-[:CREATED]-
                (np:NetworkingPlatform {platformId: {platformId}})`)
        .merge(`(orgDatabase)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
        .with(`assigner`)
        .optionalMatch(`(assigner)-[relCategory:ASSIGNED]->(:Category)`)
        .delete(`relCategory`)
        .with(`assigner`)
        .match(`(category:Category)`)
        .where(`category.idOnPlatform IN {categories}`)
        .merge(`(assigner)-[:ASSIGNED]->(category)`)
        .end({id: id, categories: organization.categories, platformId: platformId});
};

let importOrganizationPostActions = function (resultCreated, resultModified, orgName) {
    if (resultCreated.length > 0 && resultModified.length > 0) {
        logger.error(`Organisation has been created an modified during import ${orgName}`);
    } else if (resultCreated.length > 0) {
        logger.info(`${orgName} successfully imported (created)`);
    } else if (resultModified.length > 0) {
        logger.info(`${orgName} successfully imported (modified)`);
    } else {
        logger.error(`Organisation could not be imported ${orgName}`);
    }
};

let importOrganization = async function (id, timestamp, organization, platformId) {

    addMandatoryProperties(organization);
    let commands = [
        modifyChangedOrganization(id, timestamp, organization, platformId).getCommand(),
        createNotExistingOrganization(id, timestamp, organization, platformId).getCommand(),
        addLocations(id, organization, platformId).getCommand()
    ];
    let result = await createCategoryAssigner(id, organization, platformId).send(commands);
    importOrganizationPostActions(result[1], result[0], organization.name);
};

module.exports = {
    importOrganization
};
