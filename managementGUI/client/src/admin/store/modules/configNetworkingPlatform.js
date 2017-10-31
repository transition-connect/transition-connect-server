import * as types from '../mutation-types';
import {HTTP} from './../../../utils/http-common';
import equal from 'deep-equal';

const state = {
    config: {config: {}, administrators: []},
    configActual: {config: {}, administrators: []},
    descriptionIsValid: true,
    websiteIsValid: true,
    successfullyUpdated: false,
    isLoaded: false
};

const getters = {
    npHasChanged: state => {
        return !equal(state.config, state.configActual);
    },
    npGeneralConfigChanged: state => state.config.config !== state.configActual.config,
    npAdministratorsChanged: state => !equal(state.config.administrators, state.configActual.administrators),
    npName: state => state.config.config.name,
    npAdministrators: state => state.config.administrators,
    npGeneralConfig: state => state.config.config,
    npConfigIsLoaded: state => state.isLoaded,
    npConfigSuccessfullyUpdated: state => state.successfullyUpdated
};

const actions = {
    getNpConfiguration({commit}, platformId) {
        commit(types.RESET_NP_CONFIG);
        HTTP.get(`/admin/api/networkingPlatform/config`,
            {params: {platformId: platformId}}).then((resp) => {
            commit(types.SET_NP_CONFIG, {config: resp.data});
        }).catch(e => {

        });
    }
};

const mutations = {
    [types.RESET_NP_CONFIG](state) {
        state.config = {config: {}, administrators: []};
        state.configActual = {config: {}, administrators: []};
        state.isLoaded = false;
    },[types.SET_NP_CONFIG](state, {config}) {
        state.config = JSON.parse(JSON.stringify(config.np));
        state.configActual = JSON.parse(JSON.stringify(state.config));
        state.isLoaded = true;
    },
    [types.ADD_ADMIN_TO_NP_CONFIG](state, {email}) {
        state.config.administrators.push(email);
        state.successfullyUpdated = false;
    },
    [types.REMOVE_ADMIN_FROM_NP_CONFIG](state, {email}) {
        state.config.administrators.splice(
            state.config.administrators.findIndex((admin) => admin === email), 1);
        state.successfullyUpdated = false;
    },
    [types.CHANGE_NP_DESCRIPTION](state, {description, valid}) {
        state.config.config.description = description;
        state.descriptionIsValid = valid;
        state.successfullyUpdated = false;
    },
    [types.CHANGE_NP_WEBSITE](state, {website, valid}) {
        state.config.config.link = website;
        state.websiteIsValid = valid;
        state.successfullyUpdated = false;
    },
    [types.CHANGE_NP_MANUALLY_ACCEPT_ORG](state, manuallyAcceptOrg) {
        state.config.config.manuallyAcceptOrganization = manuallyAcceptOrg;
        state.successfullyUpdated = false;
    },
    [types.UPDATE_NP_CONFIG_COMMIT](state) {
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
