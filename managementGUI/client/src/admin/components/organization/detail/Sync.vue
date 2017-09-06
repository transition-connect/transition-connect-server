<template>
    <div id="tc-detail-export-container">
        <div id="export-title">Mit {{numberOfExported + 1}} Plattformen synchronisiert</div>
        <div class="sync-container">
            <div class="sync-name">{{organization.createdNetworkingPlatformName}}
                <span class="original-name">(Originale Plattform)</span></div>
            <div class="org-created">{{organization.name}} wurde von dieser Plattform auf TC erstellt am {{organization.created}}</div>
            <sync-categories :categories="organization.categories"></sync-categories>
        </div>
        <div v-for="np in nps" class="sync-container">
            <div class="sync-name">{{np.name}}</div>
            <sync-status :status="np.status" :last-update="np.exportTimestamp"></sync-status>
            <sync-categories :categories="np.categories"></sync-categories>
        </div>
    </div>
</template>

<script>
    import SyncStatus from './SyncStatus.vue';
    import SyncCategories from './SyncCategories.vue';

    export default {
        components: {SyncStatus, SyncCategories},
        props: {
            nps: {
                default() {
                    return [];
                }
            },
            organization: {
                default() {
                    return {};
                }
            }
        }, methods: {
            getNumberOfSyncStatus: function (nps, type) {
                let numberOfSyncStatus = 0;
                for (let np of nps) {
                    if (type.includes(np.status)) {
                        numberOfSyncStatus++;
                    }
                }
                return numberOfSyncStatus;
            }
        }, data: function () {
            return {numberOfExported: 0, numberOfPendingExport: 0, numberOfRequestExport: 0};
        }, watch: {
            nps: function (newNps) {
                this.numberOfExported = this.getNumberOfSyncStatus(newNps, ['EXPORT_UPDATE_NEEDED', 'EXPORTED']);
                this.numberOfPendingExport = this.getNumberOfSyncStatus(newNps, ['NOT_EXPORTED']);
                this.numberOfRequestExport = this.getNumberOfSyncStatus(newNps, ['EXPORT_REQUESTED']);
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-export-container {
        margin-top: 24px;
        #export-title {
            margin-bottom: 6px;
            font-size: 20px;
            font-weight: 500;
        }
        #sync-created-container {

        }
        .sync-container {
            border: 2px solid $divider;
            border-radius: 6px;
            padding: 6px;
            margin-bottom: 12px;
            .sync-name {
                font-weight: 500;
                font-size: 16px;
                .original-name {
                    font-weight: 400;
                    font-size: 14px;
                }
            }
            .org-created {
                margin-top: 6px;
            }
        }
    }
</style>
