'use strict';

let db = require('server-lib').neo4j;
let uuid = require('server-lib').uuid;
let time = require('server-lib').time;
let logger = require('server-lib').logging.getLogger(__filename);

let addMandatoryProperties = function (organizations) {
    for (let organization of organizations) {
        organization.uuid = uuid.generateUUID();
        organization.website = organization.website || '';
        organization.slogan = organization.slogan || '';
        organization.adminsWithUuid = [];
        for (let admin of organization.administrators) {
            organization.adminsWithUuid.push({email: admin, uuid: uuid.generateUUID()});
        }
    }
};

let createNotExistingOrganizations = function (organizations, platformId) {
    return db.cypher().unwind(`{organizations} AS organization`)
        .match(`(np:NetworkingPlatform {platformId: {platformId}})`)
        .where(`NOT (np)-[:CREATED]->(:Organization {organizationIdOnExternalNP: organization.id})`)
        .merge(`(np)-[:CREATED]->(orgDatabase:Organization {organizationIdOnExternalNP: organization.id, 
                 organizationId: organization.uuid, name: organization.name, 
                 description: organization.description, slogan: organization.slogan, 
                 website: organization.website, created: {now}, modified: {now}})`)
        .with(`organization, orgDatabase`)
        .unwind(`organization.adminsWithUuid AS adminWithUuid`)
        .merge(`(admin:Admin {email: toLower(adminWithUuid.email)})`)
        .onCreate(`SET admin.adminId = adminWithUuid.uuid`)
        .merge(`(admin)-[:IS_ADMIN]->(orgDatabase)`)
        .end({organizations: organizations, platformId: platformId, now: time.getNowUtcTimestamp()});
};

let modifyChangedOrganizations = function (organizations, platformId) {
    return db.cypher().unwind(`{organizations} AS organization`)
        .match(`(:NetworkingPlatform {platformId: {platformId}})-[:CREATED]->
                (orgDatabase:Organization {organizationIdOnExternalNP: organization.id})`)
        .where(`orgDatabase.name <> organization.name OR orgDatabase.description <> organization.description OR
                orgDatabase.slogan <> organization.slogan OR orgDatabase.website <> organization.website`)
        .addCommand(` SET orgDatabase.name = organization.name, orgDatabase.description = organization.description, 
                     orgDatabase.slogan = organization.slogan, orgDatabase.website = organization.website, 
                     orgDatabase.modified = {now}`)
        .end({organizations: organizations, platformId: platformId, now: time.getNowUtcTimestamp()});
};

let createCategoryAssigner = function (organizations, platformId) {
    return db.cypher().unwind(`{organizations} AS organization`)
        .match(`(orgDatabase:Organization {organizationIdOnExternalNP: organization.id})<-[:CREATED]-
                (np:NetworkingPlatform {platformId: {platformId}})`)
        .merge(`(orgDatabase)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
        .with(`organization, assigner`)
        .optionalMatch(`(assigner)-[relCategory:ASSIGNED]->(:Category)`)
        .delete(`relCategory`)
        .with(`organization, assigner`)
        .match(`(category:Category)`)
        .where(`category.idOnPlatform IN organization.categories`)
        .merge(`(assigner)-[:ASSIGNED]->(category)`)
        .end({organizations: organizations, platformId: platformId});
};

let logImportedOrg = function (organizations) {
    for (let organization of organizations) {
        logger.info(`${organization.name} successfully imported`);
    }
};

let importOrganizations = async function (organizations, platformId) {

    addMandatoryProperties(organizations);
    let commands = [
        modifyChangedOrganizations(organizations, platformId).getCommand(),
        createNotExistingOrganizations(organizations, platformId).getCommand()
    ];
    await createCategoryAssigner(organizations, platformId).send(commands);
    logImportedOrg(organizations);
};

module.exports = {
    importOrganizations
};
