<template>
    <div id="tc-detail-export-container">
        <h2 class="sub-title">Synchronisation Organisationsdaten</h2>
        <div id="org-sync-container">
            <div class="sync-container">
                <div class="sync-name">{{organization.createdNetworkingPlatformName}}
                    <span class="original-name">(Originale Plattform)</span></div>
                <div class="org-created">{{organization.name}} wurde von dieser Plattform auf TC am {{organization.created}} erstellt.</div>
                <sync-categories :categories="organization.categories"></sync-categories>
            </div>
            <div v-for="np in nps" class="sync-container">
                <div class="sync-name">{{np.name}}</div>
                <sync-status :status="np.status" :last-update="np.exportTimestamp"></sync-status>
                <sync-categories :categories="np.categories"></sync-categories>
            </div>
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
        }, computed: {
            platformDescription: function () {
                return this.numberOfExported > 1 ? 'Plattformen' : 'Plattform'
            },
            pendingExportDescription: function () {
                return this.numberOfPendingExport > 1 ? 'Synchronisationen wurden' : 'Synchronisation wurde'
            },
            requestExportDescription: function () {
                return this.numberOfRequestExport > 1 ? 'Warten' : 'Wartet'
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-export-container {
        margin-top: 28px;
        margin-bottom: 52px;
        #org-sync-container {
            margin-top: 18px;
            .sync-container {
                border: 2px solid $divider;
                border-radius: 6px;
                padding: 6px;
                margin-bottom: 12px;
                .sync-name {
                    font-weight: 500;
                    font-size: 14px;
                    color: $tc-default-color;
                    .original-name {
                        font-weight: 400;
                        font-size: 12px;
                    }
                }
                .org-created {
                    margin-top: 6px;
                }
            }
        }
    }
</style>
