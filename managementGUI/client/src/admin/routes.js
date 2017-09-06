import Home from './components/home/Home.vue';
import OrganizationConfig from './components/organization/config/Organization.vue';
import OrganizationDetail from './components/organization/detail/Organization.vue';
import NetworkingPlatformDetail from './components/networkingPlatform/detail/NetworkingPlatform.vue';

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
        path: '/networking-platform/config/:id',
        name: 'npConfig',
        component: OrganizationConfig
    },
    {
        path: '/organization/detail/:id',
        name: 'orgDetail',
        component: OrganizationDetail
    },
    {
        path: '/networking-platform/detail/:id',
        name: 'npDetail',
        component: NetworkingPlatformDetail
    }
];
