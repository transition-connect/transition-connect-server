import Home from './components/home/Home.vue';
import Organization from './components/config/organization/Organization.vue';

export default [
    {
        path: '/',
        component: Home
    },
    {
        path: '/organization/config/:id',
        name: 'orgConfig',
        component: Organization
    }
];
