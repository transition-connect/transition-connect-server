<template>
    <div class="org-container">
        <div class="org-header">
            <div class="org-title">
                {{organization.name}}
            </div>
            <status-display :status-admin="organization.statusOrganizationAdmin"></status-display>
            <div class="np-name">Erstellt auf der Plattform
                <span class="np-name-bold">{{organization.nameNetworkingPlatform}}</span>
            </div>
        </div>
        <div class="org-commands">
            <button type="button" class="btn btn-default">Detail</button>
        </div>
    </div>
</template>

<script>
    import StatusDisplay from './StatusDisplay.vue';

    export default {
        props: ['organization'],
        components: {StatusDisplay}
    }
</script>

<style lang="scss">
    @import "../../../style/variable";

    .org-container {
        display: table;
        width: 100%;
        margin-bottom: 18px;
        .org-header {
            display: table-cell;
            width: auto;
            .org-title {
                cursor: pointer;
                font-weight: 300;
                font-size: 22px;
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 500px;
            }
            .org-title:hover {
                text-decoration: underline;
            }
            .np-name {
                display: inline-block;
                line-height: 20px;
                padding-left: 4px;
                font-size: 12px;
                .np-name-bold {
                    font-weight: 500;
                }
            }
        }
        .org-commands {
            display: table-cell;
            width: 175px;
            margin-top: 8px;
            text-align: right;
        }
    }
</style>
