'use strict';

let db = require('server-lib').neo4j;
let _ = require('lodash');

let getUnchangedOrganizations = function (events, platformId) {
    return db.cypher().unwind(`{events} AS event`)
        .match(`(np:NetworkingPlatform {platformId: {platformId}})-[:CREATED]->
                (:Organization)-[:ORGANIZE]->(eventDb:Event {uid: event.uid})`)
        .where(`event.timestamp = eventDb.modifiedOnNp`)
        .return(`event.uid AS uid, event.modifiedOnNp AS timestamp`)
        .end({events: events, platformId: platformId});
};

let getEventsToImport = async function (events, platformId) {
    let unchangedEvents = await getUnchangedOrganizations(events, platformId).send();
    return _.differenceBy(events, unchangedEvents, 'uid');
};

module.exports = {
    getEventsToImport
};
