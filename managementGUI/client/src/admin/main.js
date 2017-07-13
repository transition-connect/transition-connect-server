import Vue from 'vue';
import VeeValidate from 'vee-validate';
import App from './App.vue';
import svgicon from 'vue-svgicon';

Vue.use(VeeValidate);
Vue.use(svgicon);

new Vue({
    el: '#admin-app',
    render: (h) => h(App)
});
