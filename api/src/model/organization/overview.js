'use strict';

let db = requireDb();

let getOverview = function (params) {
    return db.cypher().match(`(organization:Organization)`)
        .return(`organization.organizationId AS organizationId, organization.name AS name`)
        .orderBy(`organization.name`).skip(`{skip}`).limit(`{limit}`).end({
            skip: params.skip, limit: params.maxItems
        }).send().then(function (resp) {
            return {organization: resp};
        });
};


module.exports = {
    getOverview: getOverview
};
