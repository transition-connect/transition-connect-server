<template>
    <div id="tc-detail-np">
        <div id="tc-container" v-if="npLoaded">
            <div id="tc-detail-header">
                <button type="button" class="btn btn-default"
                        v-on:click="$router.push({name: 'npConfig', params: {id: $route.params.id}})">
                    Konfigurieren
                </button>
            </div>
            <info :np="detail.np"></info>
            <org-request-export-to-np :organizations="detail.orgRequestedExportToNp" :max-time="detail.np.requestTimestamp"
                                      :number-of-organizations="detail.numberOfOrgRequestedExportToNp"
                                      :name-np="detail.np.name" :platform-id="$route.params.id"
                                      @addOrg="org => detail.orgRequestedExportToNp = detail.orgRequestedExportToNp.concat(org)"
                                      @moveToSync="org => moveTo(org,
                                      detail.orgRequestedExportToNp, 'numberOfOrgRequestedExportToNp',
                                      detail.orgExportedToNp, 'numberOfOrgExportedToNp')"
                                      @moveToDeny="org => moveTo(org,
                                      detail.orgRequestedExportToNp, 'numberOfOrgRequestedExportToNp',
                                      detail.orgDeniedExportToNp, 'numberOfOrgDeniedExportToNp')">
            </org-request-export-to-np>
            <org-created-by-np :organizations="detail.orgCreatedByNp" :max-time="detail.np.requestTimestamp"
                               :number-of-organizations="detail.numberOfOrgCreatedByNp"
                               :name-np="detail.np.name" :platform-id="$route.params.id"
                               @addOrg="org => detail.orgCreatedByNp = detail.orgCreatedByNp.concat(org)">
            </org-created-by-np>
            <org-exported-to-np :organizations="detail.orgExportedToNp" :max-time="detail.np.requestTimestamp"
                                :number-of-organizations="detail.numberOfOrgExportedToNp"
                                :name-np="detail.np.name" :platform-id="$route.params.id"
                                @addOrg="org => detail.orgExportedToNp = detail.orgExportedToNp.concat(org)"
                                @moveToDeny="org => moveTo(org,
                                      detail.orgExportedToNp, 'numberOfOrgExportedToNp',
                                      detail.orgDeniedExportToNp, 'numberOfOrgDeniedExportToNp')">
            </org-exported-to-np>
            <org-export-denied :organizations="detail.orgDeniedExportToNp" :max-time="detail.np.requestTimestamp"
                               :number-of-organizations="detail.numberOfOrgDeniedExportToNp"
                               :name-np="detail.np.name" :platform-id="$route.params.id"
                               @addOrg="org => detail.orgDeniedExportToNp = detail.orgDeniedExportToNp.concat(org)"
                               @moveToSync="org => moveTo(org,
                                      detail.orgDeniedExportToNp, 'numberOfOrgDeniedExportToNp',
                                      detail.orgExportedToNp, 'numberOfOrgExportedToNp')">
            </org-export-denied>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Info from './Info.vue';
    import OrgCreatedByNp from './OrgCreatedByNP.vue';
    import OrgExportDenied from './OrgExportDenied.vue';
    import OrgRequestExportToNp from './OrgRequestExportToNP.vue';
    import OrgExportedToNp from './OrgExportedToNP.vue';
    import moment from 'moment';

    export default {
        components: {Info, OrgCreatedByNp, OrgExportDenied, OrgRequestExportToNp, OrgExportedToNp},
        data: function () {
            return {detail: {np: {}}, npLoaded: false};
        },
        created: function () {
            HTTP.get(`/admin/api/networkingPlatform/detail`,
                {params: {platformId: this.$route.params.id, language: 'DE'}}).then((resp) => {
                this.npLoaded = true;
                this.detail = resp.data;
            }).catch(e => {
                console.log(e);
            })
        },
        methods: {
            moveTo: function (org, containerFrom, numberOfFrom, containerTo, numberOfTo) {
                containerFrom.splice(
                    containerFrom.findIndex(
                        (containerOrg) => containerOrg === org), 1);
                this.detail[numberOfFrom]--;
                this.detail[numberOfTo]++;
                containerTo.unshift(org);
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-np {
        width: 100%;
        padding-top: 104px;
        #tc-container {
            margin: 0 auto;
            width: 100%;
            max-width: $application-width;
            #tc-detail-header {
                margin-bottom: 12px;
            }
        }
    }
</style>
