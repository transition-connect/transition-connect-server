import Home from './components/home/Home.vue';
import OrganizationConfig from './components/organization/config/Organization.vue';
import OrganizationDetail from './components/organization/detail/Organization.vue';

export default [
    {
        path: '/',
        component: Home
    },
    {
        path: '/organization/config/:id',
        name: 'orgConfig',
        component: OrganizationConfig
    },
    {
        path: '/organization/detail/:id',
        name: 'orgDetail',
        component: OrganizationDetail
    }
];
