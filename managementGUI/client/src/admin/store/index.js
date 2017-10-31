import Vue from 'vue';
import Vuex from 'vuex';

import configOrganisation from './modules/configOrganisation';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        configOrganisation
    },

});
