import Vue from 'vue';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import svgicon from 'vue-svgicon';
import moment from 'moment';
import App from './App.vue';
import routes from './routes';

Vue.use(VeeValidate);
Vue.use(VueRouter);
Vue.use(svgicon);

moment.locale('de');

new Vue({
    router: new VueRouter({routes}),
    el: '#admin-app',
    render: (h) => h(App)
});
