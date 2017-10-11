'use strict';

let db = require('server-lib').neo4j;
let uuid = require('server-lib').uuid;
let time = require('server-lib').time;

let addUuid = function (organizations) {
    for (let organization of organizations) {
        organization.uuid = uuid.generateUUID();
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

let createdCategoryAssigner = function (organizations, platformId) {
    return db.cypher().unwind(`{organizations} AS organization`)
        .match(`(orgDatabase:Organization {organizationIdOnExternalNP: organization.id})<-[:CREATED]-
                (np:NetworkingPlatform {platformId: {platformId}})`)
        .merge(`(orgDatabase)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
        .with(`organization, assigner`)
        .optionalMatch(`(assigner)-[relCategory:ASSIGNED]->(:Category)`)
        .delete(`relCategory`)
        .with(`organization, assigner`)
        .match(`(category:Category)`)
        .where(`category.categoryId IN organization.categories`)
        .merge(`(assigner)-[:ASSIGNED]->(category)`)
        .end({organizations: organizations, platformId: platformId});
};

let importOrganizations = async function (organizations, platformId) {

    addUuid(organizations);
    let commands = [
        createNotExistingOrganizations(organizations, platformId).getCommand()
    ];
    await createdCategoryAssigner(organizations, platformId).send(commands);

};

module.exports = {
    importOrganizations
};
