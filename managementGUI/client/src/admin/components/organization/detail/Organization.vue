<template>
    <div id="tc-detail-organization">
        <div id="tc-container" v-show="organizationLoaded">
            <div id="tc-detail-header">
                <button type="button" class="btn btn-default"
                        v-on:click="$router.push({name: 'orgConfig', params: {id: $route.params.id}})">
                    Konfigurieren
                </button>
            </div>
            <info :organization="detail.organization"></info>
            <sync :nps="detail.exportedNetworkingPlatforms"
                  :organization="detail.organization"></sync>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Info from './Info.vue';
    import Sync from './Sync.vue';
    import moment from 'moment';

    export default {
        components: {Info, Sync},
        data: function () {
            return {detail: {organization: {}}, organizationLoaded: false};
        },
        created: function () {
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
            }
        }
    }
</style>
