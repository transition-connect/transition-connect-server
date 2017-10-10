<template>
    <div class="notification-container">
        <init-organization v-show="notification.action === 'INIT_ORGANISATION'" :action-data="notification.actionData"></init-organization>
        <accept-organization v-show="notification.action === 'EXPORT_REQUEST'" :action-data="notification.actionData"
                             @remove="$emit('remove')"></accept-organization>
    </div>
</template>

<script>
    import AcceptOrganization from './AcceptOrganization.vue';
    import InitOrganization from './InitOrganization.vue';

    export default {
        props: ['notification'],
        components: {AcceptOrganization, InitOrganization}
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .notification-container {
        min-height: 50px;
        width: 100%;
        margin-bottom: 6px;
    }
</style>
