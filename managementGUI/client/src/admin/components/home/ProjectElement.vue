<template>
    <div class="project-container">
        <div class="project-title">
            {{project.name}}
        </div>
        <status-display :status-admin="project.statusProjectAdmin"></status-display>
        <div class="project-info">Projekt</div>
        <div class="org-commands">
            <button type="button" class="btn btn-default"
                    v-show="project.statusAdmin === 'pending'">Aktivieren</button>
        </div>
    </div>
</template>

<script>
    import StatusDisplay from './StatusDisplay.vue';

    export default {
        props: ['project'],
        components: {StatusDisplay},
        created: function () {
            console.log(this.project);
        }
    }
</script>

<style lang="scss">
    .project-container {

        margin-bottom: 8px;
        .project-title {
            font-weight: 300;
            font-size: 18px;
        }
        .project-info {
            display: inline-block;
            font-size: 12px;
            padding-left: 4px;
        }
        .org-commands {
            margin-top: 8px;
        }
    }
</style>
