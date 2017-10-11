'use strict';

let _ = require('lodash');
let logger = require('server-lib').logging.getLogger(__filename);

let adapters = [{adapterType: 'standardNp', adapter: require('./networkingPlatform/standard/index')}];


let importOrganizations = async function importOrganizations(adapterType, url, lastUpdateTimestamp, skip) {

    let adapter = _.find(adapters, adapter => adapter.adapterType === adapterType),
        result = null;
    if (adapter && adapter.adapter) {
        result = await adapter.adapter.importOrganizations(url, lastUpdateTimestamp, skip);
    } else {
        logger.error(`${adapterType} for ${url} not found`);
    }
    return result;
};

module.exports = {
    importOrganizations
};
