'use strict';

let _ = require('lodash');
let logger = require('server-lib').logging.getLogger(__filename);

let adapters = [{adapterType: 'standardNp', adapter: require('./networkingPlatform/standard/index')}];


let importOrganizations = async function importOrganizations(adapterType, url, lastUpdateTimestamp, skip) {

    let adapter = _.find(adapters, adapter => adapter.adapterType === adapterType),
        result = null;
    if (adapter && adapter.adapter) {
        try {
            result = await adapter.adapter.importOrganizations(url, lastUpdateTimestamp, skip);
        } catch (error) {
            logger.error(`Connection to ${url} failed`, error);
        }
    } else {
        logger.error(`${adapterType} for ${url} not found`);
    }
    return result;
};

let exportOrganizations = async function importOrganizations(orgsToExport, adapterType, url, lastUpdateTimestamp, skip) {

    let adapter = _.find(adapters, adapter => adapter.adapterType === adapterType),
        result = null;
    if (adapter && adapter.adapter) {
        try {
            result = await adapter.adapter.exportOrganizations(orgsToExport, url, lastUpdateTimestamp, skip);
        } catch (error) {
            logger.error(`Connection to ${url} failed`, error);
        }
    } else {
        logger.error(`${adapterType} for ${url} not found`);
    }
    return result;
};

module.exports = {
    importOrganizations,
    exportOrganizations
};
