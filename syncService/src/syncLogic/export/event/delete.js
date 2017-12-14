'use strict';

let db = require('server-lib').neo4j;

let getEventsToDelete = async function (platformId) {
    return await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[exportRel:DELETE_REQUEST]-(event:Event)`)
        .return(`event.uid AS uid`)
        .end({platformId: platformId}).send();
};

let setEventAsDeleted = async function (uid, platformId) {
    return await db.cypher().match(`(np:NetworkingPlatform {platformId: {platformId}})
                        <-[deleteRequest:DELETE_REQUEST]-(event:Event {uid: {uid}})`)
        .merge(`(np)<-[deleteRequestSuccess:DELETE_REQUEST_SUCCESS]-(event)`)
        .delete(`deleteRequest`)
        .end({uid: uid, platformId: platformId}).send();
};

module.exports = {
    getEventsToDelete,
    setEventAsDeleted
};
