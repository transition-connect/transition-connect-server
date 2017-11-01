<template>
    <div id="tc-np-org-export-requested" v-if="numberOfOrganizations > 0">
        <h2 class="sub-title">Wollen mit {{nameNp}} synchronisiert werden</h2>
        <div class="org-export-requested-info">
            {{numberOfOrganizations}} Organisationen
        </div>
        <div class="org-container">
            <div v-for="org in organizations" class="org-row">
                <div class="org-commands">
                    <button type="button" class="btn btn-default"
                            v-on:click="sendExportRequestStatus(org, false)">
                        Ablehnen
                    </button>
                    <button type="button" class="btn btn-primary"
                            v-on:click="sendExportRequestStatus(org, true)">
                        Akzeptieren
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
                              url="/admin/api/networkingPlatform/orgExportRequestToNp"
                              @addOrg="org => $emit('addOrg', org)"></next-org-command>
        </div>

        <snackbar type="error">
            <div slot="text">Ein Fehler ist aufgetreten.</div>
        </snackbar>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import NextOrgCommand from './NextOrgCommand.vue';
    import Snackbar from './../../../../utils/components/Snackbar.vue';

    export default {
        props: ['organizations', 'numberOfOrganizations', 'nameNp', 'platformId', 'maxTime'],
        components: {NextOrgCommand, Snackbar},
        methods: {
            sendExportRequestStatus: function (org, accept) {
                HTTP.put(`/admin/api/networkingPlatform/organization/exportRequest`, {
                    params: {
                        platformId: this.platformId,
                        organizationId: org.organizationId,
                        accept: accept
                    }
                }).then(() => {
                    if (accept) {
                        this.$emit('moveToSync', org);
                    } else {
                        this.$emit('moveToDeny', org);
                    }
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

    #tc-np-org-export-requested {
        margin: 12px 0 24px 0;

        .org-export-requested-info {
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
                    width: 210px;
                    padding-bottom: 8px;
                }
            }
        }
    }
</style>
