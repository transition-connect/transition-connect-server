<template>
    <div id="org-exported-denied" v-if="numberOfOrganizations > 0">
        <h2 class="sub-title">Abgelehnte Organisationen</h2>
        <div class="org-denied-info">
            {{numberOfOrganizations}} Organisationen
        </div>
        <div class="org-container">
            <div v-for="org in organizations" class="org-row">
                <div class="org-commands">
                    <button type="button" class="btn btn-primary"
                            v-on:click="showStartSyncOrganisation(org)">
                        Sync starten
                    </button>
                </div>
                <div class="org-name-container">
                    <router-link :to="{name: 'orgDetail', params: {id: org.organizationId}}" class="org-name">
                        {{org.name}}
                    </router-link>
                </div>
            </div>
            <next-org-command :organizations="organizations" :platformId="platformId"
                              :numberOfOrganizations="numberOfOrganizations" :maxTime="maxTime"
                              url="/admin/api/networkingPlatform/orgDeniedExportToNp"
                              @addOrg="org => $emit('addOrg', org)"></next-org-command>
        </div>

        <snackbar type="error">
            <div slot="text">Ein Fehler ist aufgetreten.</div>
        </snackbar>

        <modal-dialog v-if="showWarningDialog">
            <h3 slot="header">Synchronisation starten</h3>
            <div slot="body">Soll die Synchronisation für
                <span class="org-name-dialog">{{orgToSync.name}}</span> gestartet werden?
            </div>
            <div slot="footer">
                <button type="button" class="btn btn-default"
                        v-on:click="showWarningDialog = false">
                    Nein
                </button>
                <button type="button" class="btn btn-primary"
                        v-on:click="syncOrganisation">
                    Ja
                </button>
            </div>
        </modal-dialog>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import ModalDialog from './../../../../utils/components/ModalDialog.vue';
    import NextOrgCommand from './NextOrgCommand.vue';
    import Snackbar from './../../../../utils/components/Snackbar.vue';

    export default {
        props: ['organizations', 'numberOfOrganizations', 'nameNp', 'platformId', 'maxTime'],
        components: {ModalDialog, NextOrgCommand, Snackbar},
        data: function () {
            return {showWarningDialog: false, orgToSync: null};
        },
        methods: {
            showStartSyncOrganisation: function (org) {
                this.showWarningDialog = true;
                this.orgToSync = org;
            },
            syncOrganisation: function () {
                this.showWarningDialog = false;
                HTTP.put(`/admin/api/networkingPlatform/organization/exportRequest`, {
                    params: {
                        platformId: this.platformId,
                        organizationId: this.orgToSync.organizationId,
                        accept: true
                    }
                }).then(() => {
                    this.$emit('moveToSync', this.orgToSync);
                }).catch(e => {
                    this.$emit('showNotification', true);
                    console.log(e);
                })
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #org-exported-denied {
        margin: 12px 0 24px 0;
        .org-denied-info {
            font-size: 14px;
            font-weight: 500;
            color: $secondary-text;
            margin-bottom: 18px;
        }
        .org-container {
            display: table;
            .org-row {
                display: table-row;
                .org-name-container {
                    display: table-cell;
                    width: auto;
                    vertical-align: middle;
                    padding-bottom: 8px;
                    .org-name {
                        display: inline-block;
                        font-size: 16px;
                    }
                }
                .org-commands {
                    display: table-cell;
                    vertical-align: middle;
                    text-align: left;
                    width: 135px;
                    padding-bottom: 8px;
                }
            }
        }
        .org-name-dialog {
            color: $tc-default-color;
            font-weight: 500;
        }
    }
</style>
