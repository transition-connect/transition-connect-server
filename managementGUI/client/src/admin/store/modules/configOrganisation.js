import * as types from '../mutation-types';
import {HTTP} from './../../../utils/http-common';
import configCheck from './exportConfigCheck';
import equal from 'deep-equal';
import Vue from 'vue';

const state = {
    config: {networkingPlatforms: [], originalNetworkingPlatform: [], organization: {}},
    configActual: {networkingPlatforms: [], originalNetworkingPlatform: [], organization: {}},
    eventsImportConfigurationIsValid: true,
    eventsImportConfiguration: '',
    eventsImportConfigurationActual: '',
    eventsImportConfigurationFailed: false,
    successfullyUpdated: false,
    isLoaded: false
};

let networkingPlatformHasChanged = function (networkingPlatforms, actualNetworkingPlatforms) {
    let hasChanged = false;
    for (let i = 0; i < networkingPlatforms.length; i++) {
        if (networkingPlatforms[i].isExported) {
            if (!equal(networkingPlatforms[i], actualNetworkingPlatforms[i])) {
                hasChanged = true;
            }
        } else {
            if (networkingPlatforms[i].isExported !== actualNetworkingPlatforms[i].isExported) {
                hasChanged = true;
            }
        }
    }
    return hasChanged;
};

const getters = {
    hasChanged: state => {
        return !equal(state.config.organization.administrators,
            state.configActual.organization.administrators) ||
            networkingPlatformHasChanged(state.config.networkingPlatforms, state.configActual.networkingPlatforms) ||
            state.eventsImportConfiguration !==
            state.eventsImportConfigurationActual ||
            state.config.originalNetworkingPlatform.isEventExported !==
            state.configActual.originalNetworkingPlatform.isEventExported;
    },
    networkingPlatformsChanged: state => {
        return networkingPlatformHasChanged(state.config.networkingPlatforms, state.configActual.networkingPlatforms);
    },
    eventsImportConfigurationChanged: state => state.eventsImportConfiguration !== state.eventsImportConfigurationActual,
    eventsExportOriginalNPChanged: state => state.config.originalNetworkingPlatform.isEventExported !==
        state.configActual.originalNetworkingPlatform.isEventExported,
    administratorsChanged: state => state.config.organization.name,
    getOrgName: state => state.config.organization.name,
    getNetworkingPlatforms: state => state.config.networkingPlatforms,
    getOriginalNetworkingPlatform: state => state.config.originalNetworkingPlatform,
    getOrgAdministrators: state => state.config.organization.administrators,
    getEventsImportConfiguration: state => state.eventsImportConfiguration,
    getEventsExportOriginalNP: state => state.config.originalNetworkingPlatform.isEventExported,
    isLoaded: state => state.isLoaded,
    isValidConfig: state => configCheck(state.config.networkingPlatforms) && state.eventsImportConfigurationIsValid,
    isValidEventImport: state => state.eventsImportConfigurationIsValid && state.eventsImportConfiguration.trim() !== '',
    successfullyUpdated: state => state.successfullyUpdated,
    eventsImportConfigurationFailed: state => state.eventsImportConfigurationFailed
};

const actions = {
    getConfiguration({commit}, organizationId) {
        commit(types.RESET_ORG_CONFIG);
        HTTP.get(`/admin/api/organization/config`,
            {params: {organizationId: organizationId, language: 'DE'}}).then((resp) => {
            commit(types.SET_ORG_CONFIG, {config: resp.data});
        }).catch(e => {

        });
    }
};

let getNpForEventConfiguration = function (state, np) {
    let nps = [...state.config.networkingPlatforms, state.config.originalNetworkingPlatform];
    return nps.find(npToFind => npToFind.platformId === np.platformId);
};

const mutations = {
    [types.RESET_ORG_CONFIG](state) {
        state.config = {networkingPlatforms: [], originalNetworkingPlatform: [], organization: {}};
        state.configActual = {networkingPlatforms: [], originalNetworkingPlatform: [], organization: {}};
        state.isLoaded = false;
    },
    [types.SET_ORG_CONFIG](state, {config}) {
        state.config = JSON.parse(JSON.stringify(config));
        state.eventsImportConfiguration = state.config.organization.eventsImportConfiguration || '';
        state.eventsImportConfigurationActual = state.eventsImportConfiguration;
        state.configActual = JSON.parse(JSON.stringify(state.config));
        state.isLoaded = true;
    },
    [types.ADD_ADMIN_TO_ORG_CONFIG](state, {email}) {
        state.config.organization.administrators.push(email);
        state.successfullyUpdated = false;
    },
    [types.UPDATE_EVENT_EXPORT_CATEGORY_FILTER](state, {categoryFilter, np}) {
        let npToChange = getNpForEventConfiguration(state, np);
        if (categoryFilter) {
            Vue.set(npToChange, 'eventCategoryFilter', categoryFilter);
        } else {
            Vue.delete(npToChange, 'eventCategoryFilter');
        }
    },
    [types.UPDATE_EVENT_EXPORT_LOCATION_FILTER](state, {locationFilter, np}) {
        let npToChange = getNpForEventConfiguration(state, np);
        if (locationFilter) {
            Vue.set(npToChange, 'eventLocationFilter', locationFilter);
        } else {
            Vue.delete(npToChange, 'eventLocationFilter');
        }
    },
    [types.DELETE_EVENT_EXPORT_FILTER](state, np) {
        let npToChange = getNpForEventConfiguration(state, np);
        Vue.delete(npToChange, 'eventCategoryFilter');
        Vue.delete(npToChange, 'eventLocationFilter');
    },
    [types.REMOVE_ADMIN_FROM_ORG_CONFIG](state, {email}) {
        state.config.organization.administrators.splice(
            state.config.organization.administrators.findIndex((admin) => admin === email), 1);
        state.successfullyUpdated = false;
    },
    [types.UPDATE_EVENT_IMPORT_CONFIG](state, {importConfig, valid}) {
        state.eventsImportConfiguration = importConfig;
        state.eventsImportConfigurationIsValid = valid;
        state.successfullyUpdated = false;
    },
    [types.UPDATE_SYNC_ORG_STATE_TO_NP](state, {isExported, np}) {
        let npToChange = state.config.networkingPlatforms.find(npToFind => npToFind.platformId === np.platformId);
        npToChange.isExported = isExported;
        state.successfullyUpdated = false;
    },
    [types.UPDATE_SYNC_EVENT_STATE_TO_NP](state, {isExported, np}) {
        let npToChange = getNpForEventConfiguration(state, np);
        npToChange.isEventExported = isExported;
        state.successfullyUpdated = false;
    },
    [types.UPDATE_SYNC_CATEGORY_TO_NP](state, {categories, np}) {
        let npToChange = state.config.networkingPlatforms.find(npToFind => npToFind.platformId === np.platformId);
        npToChange.categories = categories;
        state.successfullyUpdated = false;
    },
    [types.UPDATE_CONFIG_COMMIT](state) {
        state.configActual = JSON.parse(JSON.stringify(state.config));
        state.eventsImportConfigurationActual = state.eventsImportConfiguration;
        state.successfullyUpdated = true;
        state.eventsImportConfigurationFailed = false;
    },
    [types.UPDATE_IMPORT_EVENT_URL_FAILED](state) {
        state.configActual = JSON.parse(JSON.stringify(state.config));
        state.successfullyUpdated = false;
        state.eventsImportConfigurationFailed = true;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
