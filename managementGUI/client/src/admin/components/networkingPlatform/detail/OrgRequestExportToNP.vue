<template>
    <div id="tc-np-org-export-requested" v-if="numberOfOrganizations > 0">
        <div class="org-export-requested-title">
            {{numberOfOrganizations}} Organisationen wollen mit {{nameNp}} synchronisiert werden
        </div>
        <div class="org-container">
            <div v-for="org in organizations" class="org-row">
                <div class="org-commands">
                    <button type="button" class="btn btn-default todo-button"
                            v-on:click="sendExportRequestStatus(org, false)">
                        Ablehnen
                    </button>
                    <button type="button" class="btn btn-primary todo-button"
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
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';

    export default {
        props: ['organizations', 'numberOfOrganizations', 'nameNp', 'platformId'],
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

        .org-export-requested-title {
            font-size: 20px;
            font-weight: 500;
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
