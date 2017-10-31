import * as types from '../mutation-types';
import {HTTP} from './../../../utils/http-common';
import configCheck from './exportConfigCheck';
import equal from 'deep-equal';

const state = {
    config: {networkingPlatforms: [], organization: {}},
    configActual: {networkingPlatforms: [], organization: {}},
    eventsImportConfigurationIsValid: true,
    eventsImportConfiguration: '',
    eventsImportConfigurationActual: '',
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
            state.eventsImportConfigurationActual;
    },
    networkingPlatformsChanged: state => {
        return networkingPlatformHasChanged(state.config.networkingPlatforms, state.configActual.networkingPlatforms);
    },
    administratorsChanged: state => {
        return !equal(state.config.organization.administrators, state.configActual.organization.administrators);
    },
    getOrgName: state => state.config.organization.name,
    getNetworkingPlatforms: state => state.config.networkingPlatforms,
    getOrgAdministrators: state => state.config.organization.administrators,
    getEventsImportConfiguration: state => state.config.organization.eventsImportConfiguration,
    isLoaded: state => state.isLoaded,
    isValidConfig: state => configCheck(state.config.networkingPlatforms) && state.eventsImportConfigurationIsValid,
    successfullyUpdated: state => state.successfullyUpdated
};

const actions = {
    getConfiguration({commit}, organizationId) {
        HTTP.get(`/admin/api/organization/config`,
            {params: {organizationId: organizationId, language: 'DE'}}).then((resp) => {
            commit(types.SET_ORG_CONFIG, {config: resp.data});
        }).catch(e => {

        });
    }
};

const mutations = {
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
    [types.UPDATE_SYNC_STATE_TO_NP](state, {isExported, np}) {
        let npToChange = state.config.networkingPlatforms.find(npToFind => npToFind.platformId === np.platformId);
        npToChange.isExported = isExported;
        state.successfullyUpdated = false;
    },
    [types.UPDATE_SYNC_CATEGORY_TO_NP](state, {isSelected, np, category}) {
        let npToChange = state.config.networkingPlatforms
            .find(npToFind => npToFind.platformId === np.platformId);
        let categoryToChange = npToChange.categories
            .find(categoryToFind => categoryToFind.categoryId === category.categoryId);
        categoryToChange.isSelected = isSelected;
        state.successfullyUpdated = false;
    },
    [types.UPDATE_CONFIG_COMMIT](state) {
        state.configActual = JSON.parse(JSON.stringify(state.config));
        state.successfullyUpdated = true;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
