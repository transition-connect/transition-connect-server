import Vue from 'vue';
import VeeValidate from 'vee-validate';
import App from './App.vue';
import es6Promise from 'es6-promise';

es6Promise.polyfill();

Vue.use(VeeValidate);

new Vue({
    el: '#public-app',
    render: (h) => h(App)
});
