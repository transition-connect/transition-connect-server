import Home from './components/home/Home.vue';
import OrganizationConfig from './components/organization/config/Config.vue';
import OrganizationDetail from './components/organization/detail/Detail.vue';
import NetworkingPlatformDetail from './components/networkingPlatform/detail/Detail.vue';
import NetworkingPlatformConfig from './components/networkingPlatform/config/Config.vue';

export default [
    {
        path: '/',
        name: 'Home',
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
    },
    {
        path: '/networking-platform/detail/:id',
        name: 'npDetail',
        component: NetworkingPlatformDetail
    },
    {
        path: '/networking-platform/config/:id',
        name: 'npConfig',
        component: NetworkingPlatformConfig
    }
];
