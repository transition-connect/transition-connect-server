import Vue from 'vue';
import Vuex from 'vuex';

import configOrganisation from './modules/configOrganisation';
import configNp from './modules/configNetworkingPlatform';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        configOrganisation,
        configNp
    },

});
