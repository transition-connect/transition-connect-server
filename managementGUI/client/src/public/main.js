import Vue from 'vue';
import VeeValidate from 'vee-validate';
import App from './App.vue';

Vue.use(VeeValidate);

new Vue({
    el: '#public-app',
    render: (h) => h(App)
});
