'use strict';

let db = require('server-lib').neo4j;
let eventExport = require('server-lib').eventExport;

let getActiveEventRules = function (nps) {
    let activeEventRules = [];
    for (let np of nps) {
        if (np.events.exportActive) {
            activeEventRules.push(np.platformId);
        }
    }
    return activeEventRules;
};

let deleteDeactivatedEventRules = function (organizationId, activeEventRules) {
    return db.cypher().match(`(:Organization {organizationId: {organizationId}})
                              -[ruleRel1:EVENT_RULE]->(rule:EventRule)-[ruleRel2:EVENT_RULE_FOR]->(np:NetworkingPlatform)`)
        .where(`NOT np.platformId IN {activeEventRules}`)
        .delete(`rule, ruleRel1, ruleRel2`)
        .end({organizationId: organizationId, activeEventRules: activeEventRules}).getCommand();
};

let setNotExistingEventRules = function (organizationId, activeEventRules) {
    return db.cypher().match(`(org:Organization {organizationId: {organizationId}}), (np:NetworkingPlatform)`)
        .where(`np.platformId IN {activeEventRules} AND 
                NOT EXISTS((org)-[:EVENT_RULE]->(:EventRule)-[:EVENT_RULE_FOR]->(np))`)
        .merge(`(org)-[:EVENT_RULE]->(:EventRule)-[:EVENT_RULE_FOR]->(np)`)
        .end({organizationId: organizationId, activeEventRules: activeEventRules});
};

let changeConfig = async function (organizationId, nps) {
    let activeEventRules = getActiveEventRules(nps);
    let commands = [deleteDeactivatedEventRules(organizationId, activeEventRules)];
    await setNotExistingEventRules(organizationId, activeEventRules).send(commands);
    await eventExport.setEventExportRelationships(organizationId);
};

module.exports = {
    changeConfig
};
