<template>
    <div id="tc-detail-organization">
        <div id="tc-container" v-show="organizationLoaded">
            <breadcrumb :breadcrumbs="[{name: 'Organisation'}, {name: 'Übersicht'}]"></breadcrumb>
            <div id="tc-detail-header">
                <h1 id="org-name">{{detail.organization.name}}</h1>
                <div id="org-delete-info" v-show="detail.organization.isDeleted">Diese Organisation wird gelöscht</div>
                <div v-if="detail.organization.isAdmin">
                    <button type="button" class="btn btn-default" :disabled="!organizationLoaded || detail.organization.isDeleted"
                            v-on:click="$router.push({name: 'orgConfig', params: {id: $route.params.id}})">
                        Konfigurieren
                    </button>
                    <button type="button" class="btn btn-default" :disabled="!organizationLoaded"
                            v-on:click="getDetailOfOrg()">
                        Ansicht aktualisieren
                    </button>
                </div>
                <div v-else>
                    <div v-for="np in detail.exportedNetworkingPlatforms" v-if="np.isAdminOfExportRequestedNp">
                        <button type="button" class="btn btn-default"
                                v-on:click="sendExportRequestStatus(false, np)">
                            Ablehnen
                        </button>
                        <button type="button" class="btn btn-primary todo-button"
                                v-on:click="sendExportRequestStatus(true, np)">
                            Akzeptieren
                        </button>
                        <div class="export-np-request-text">Mit {{np.name}} synchronisieren</div>
                    </div>
                </div>
            </div>
            <info :organization="detail.organization"></info>
            <locations :locations="detail.locations"></locations>
            <sync :nps="detail.exportedNetworkingPlatforms"
                  :organization="detail.organization"></sync>
            <events :events="detail.events"></events>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Breadcrumb from './../../../../utils/components/Breadcrumb.vue';
    import Info from './Info.vue';
    import Events from './Events.vue';
    import Locations from './Locations.vue';
    import Sync from './Sync.vue';
    import moment from 'moment';

    export default {
        components: {Breadcrumb, Info, Locations, Events, Sync},
        data: function () {
            return {detail: {organization: {}, events: [], locations: []}, organizationLoaded: false};
        },
        created: function () {
            this.getDetailOfOrg();
        },
        methods: {
            sendExportRequestStatus: function (accept, np) {
                HTTP.put(`/admin/api/networkingPlatform/organization/exportRequest`, {
                    params: {
                        platformId: np.platformId,
                        organizationId: this.$route.params.id,
                        accept: accept
                    }
                }).then(() => {
                    np.isAdminOfExportRequestedNp = false;
                    if (accept) {
                        np.status = 'NOT_EXPORTED';
                    } else {
                        np.status = 'EXPORT_DENY';
                    }
                }).catch(e => {
                    console.log(e);
                })
            },
            getDetailOfOrg: function () {
                this.organizationLoaded = false;
                HTTP.get(`/admin/api/organization/detail`,
                    {params: {organizationId: this.$route.params.id, language: 'DE'}}).then((resp) => {
                    this.organizationLoaded = true;
                    this.detail = resp.data;
                    this.detail.organization.created = moment.unix(resp.data.organization.created).format('LLL')
                }).catch(e => {
                    console.log(e);
                })
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-organization {
        width: 100%;
        padding-top: 104px;
        #tc-container {
            margin: 0 auto;
            width: 100%;
            max-width: $application-width;
            #tc-detail-header {
                margin-bottom: 12px;
                .export-np-request-text {
                    margin-left: 12px;
                    display: inline-block;
                    font-weight: 500;
                }
                #org-name {
                    margin-top: 32px;
                    font-size: 24px;
                    font-weight: 500;
                    padding-bottom: 6px;
                    color: #337ab7;
                }
                #org-delete-info {
                    font-weight: 500;
                    font-size: 18px;
                    color: $error;
                    margin-bottom: 18px;
                }
            }
            .sub-title {
                font-size: 18px;
                font-weight: 500;
                padding-bottom: 6px;
                margin-bottom: 6px;
                border-bottom: 1px $divider solid;
            }
        }
    }
</style>
