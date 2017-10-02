<template>
    <div class="todo-container">
        <init-organization v-show="todo.action === 'INIT_ORGANISATION'" :action-data="todo.actionData"></init-organization>
        <accept-organization v-show="todo.action === 'EXPORT_REQUEST'" :action-data="todo.actionData"
                             @remove="$emit('remove')"></accept-organization>
    </div>
</template>

<script>
    import AcceptOrganization from './AcceptOrganization.vue';
    import InitOrganization from './InitOrganization.vue';

    export default {
        props: ['todo'],
        components: {AcceptOrganization, InitOrganization}
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .todo-container {
        min-height: 50px;
        width: 100%;
        margin-bottom: 6px;
    }
</style>
