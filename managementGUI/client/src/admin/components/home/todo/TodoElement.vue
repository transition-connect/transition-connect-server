<template>
    <div class="todo-container">
        <init-organisation v-show="todo.action === 'INIT_ORGANISATION'" :action-data="todo.actionData"></init-organisation>
    </div>
</template>

<script>
    import InitOrganisation from './InitOrganisation.vue';

    export default {
        props: ['todo'],
        components: {InitOrganisation}
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
