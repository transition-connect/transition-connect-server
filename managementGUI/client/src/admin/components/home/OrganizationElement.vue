<template>
    <div class="org-container">
        <div class="org-title">
            {{organization[0].name}}
        </div>
        <project-element v-for="project in organization[0].projects" :project="project"
                         :key="project.projectId"></project-element>
    </div>
</template>

<script>
    import ProjectElement from './ProjectElement.vue';

    export default {
        props: ['organization'],
        components: {ProjectElement}
    }
</script>

<style lang="scss">
    .org-container {
        .org-title {
            font-weight: 300;
            font-size: 28px;
            margin-bottom: 12px;
        }
    }
</style>
