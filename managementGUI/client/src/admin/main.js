import Vue from 'vue';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import svgicon from 'vue-svgicon';
import 'innersvg-polyfill';
import moment from 'moment';
import es6Promise from 'es6-promise';
import "babel-polyfill";
import App from './App.vue';
import routes from './routes';

import '../icons/index';

es6Promise.polyfill();

Vue.use(VeeValidate);
Vue.use(VueRouter);
Vue.use(svgicon);

moment.locale('de');

new Vue({
    router: new VueRouter({routes}),
    el: '#admin-app',
    render: (h) => h(App)
});
