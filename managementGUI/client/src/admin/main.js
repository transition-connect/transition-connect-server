import Vue from 'vue';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import svgicon from 'vue-svgicon';
import App from './App.vue';
import routes from './routes';

if (!jQuery().bootstrapToggle) {
    require('bootstrap-toggle');
}

Vue.use(VeeValidate);
Vue.use(VueRouter);
Vue.use(svgicon);

new Vue({
    router: new VueRouter({routes}),
    el: '#admin-app',
    render: (h) => h(App)
});
