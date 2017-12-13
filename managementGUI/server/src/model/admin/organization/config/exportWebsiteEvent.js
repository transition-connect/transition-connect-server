'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);
let exceptions = require('server-lib').exceptions;
let eventExport = require('server-lib').eventExport;

let checkAllowedToEditConfig = async function (adminId, organizationId, req) {
    function userNotAdmin(resp) {
        return resp.length === 0;
    }

    let resp = await db.cypher()
        .match("(org:Organization {organizationId: {organizationId}})<-[:IS_ADMIN]-(admin:Admin {adminId: {adminId}})")
        .return("org")
        .end({adminId: adminId, organizationId: organizationId}).send();

    if (userNotAdmin(resp)) {
        return exceptions.getInvalidOperation(`Not admin tries to get ` +
                `config of organization ${organizationId}`, logger, req);
    }
};

let activateEventExportToOriginalNp = function (organizationId) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})<-[:CREATED]-(np:NetworkingPlatform)`)
        .merge(`(org)-[:EVENT_RULE]->(:EventRule)-[:EVENT_RULE_FOR]->(np)`)
        .end({organizationId: organizationId}).send();
};

let deactivateEventExportToOriginalNp = function (organizationId) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}})<-[:CREATED]-(np:NetworkingPlatform)`)
        .optionalMatch(`(org)-[ruleRel:EVENT_RULE]->(rule:EventRule)-[ruleRel2:EVENT_RULE_FOR]->(np)`)
        .delete(`ruleRel, ruleRel2, rule`)
        .end({organizationId: organizationId}).send();
};

let changeConfig = async function (adminId, organizationId, exportActive, req) {
    await checkAllowedToEditConfig(adminId, organizationId, req);
    if(exportActive) {
        await activateEventExportToOriginalNp(organizationId);
    } else {
        await deactivateEventExportToOriginalNp(organizationId);
    }
    await eventExport.setEventExportRelationships(organizationId);
};

module.exports = {
    changeConfig
};
