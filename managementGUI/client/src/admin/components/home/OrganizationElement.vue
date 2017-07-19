<template>
    <div class="org-container">
        <div class="org-header">
            <div class="org-title">
                {{organization.name}}
            </div>
            <status-display :status-admin="organization.statusOrganizationAdmin"></status-display>
            <div class="np-name">Organisation erstellt von
                <span class="np-name-bold">{{organization.nameNetworkingPlatform}}</span>
            </div>
            <div class="org-commands">
                <button type="button" class="btn btn-default"
                        v-show="organization.statusAdmin === 'pending'">Aktivieren</button>
            </div>
        </div>
        <project-element v-for="project in organization.projects" :project="project"
                         :key="project.projectId"></project-element>
    </div>
</template>

<script>
    import ProjectElement from './ProjectElement.vue';
    import StatusDisplay from './StatusDisplay.vue';

    export default {
        props: ['organization'],
        components: {ProjectElement, StatusDisplay}
    }
</script>

<style lang="scss">
    @import "../../../style/variable";

    .org-container {
        .org-header {
            padding-bottom: 4px;
            border-bottom: 1px solid $divider;
            .org-title {
                font-weight: 300;
                font-size: 28px;
            }
            margin-bottom: 12px;
            .np-name {
                display: inline-block;
                line-height: 20px;
                padding-left: 4px;
                font-size: 12px;
                .np-name-bold {
                    font-weight: 500;
                }
            }
            .org-commands {
                margin-top: 8px;
            }
        }
    }
</style>
