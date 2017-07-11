import Vue from 'vue';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import App from './App.vue';

Vue.use(VeeValidate);
Vue.use(Vuex);

new Vue({ // eslint-disable-line no-new
    el: '#public-app',
    render: (h) => h(App)
});
