<template>
    <div id="tc-np-org-created" v-if="numberOfOrganizations > 0">
        <div class="org-created-title">{{numberOfOrganizations}} von {{nameNp}} erstellte Organisationen</div>
        <div v-for="org in organizations" class="org-container">
            <router-link :to="{name: 'orgDetail', params: {id: org.organizationId}}" class="org-name">
                {{org.name}}
            </router-link>
            <div class="org-created">Erstellt am {{getCreated(org.created)}}</div>
        </div>
        <next-org-command :organizations="organizations" :platformId="platformId"
                          :numberOfOrganizations="numberOfOrganizations" :maxTime="maxTime"
                          url="/admin/api/networkingPlatform/orgCreatedByNp"
                          @addOrg="org => $emit('addOrg', org)"></next-org-command>
    </div>
</template>

<script>
    import moment from 'moment';
    import {HTTP} from './../../../../utils/http-common';
    import NextOrgCommand from './NextOrgCommand.vue';

    export default {
        props: ['organizations', 'platformId', 'numberOfOrganizations', 'nameNp', 'maxTime'],
        components: {NextOrgCommand},
        methods: {
            getCreated: function (created) {
                return moment.unix(created).format('LLL')
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-np-org-created {
        margin: 12px 0 24px 0;
        .org-created-title {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 18px;
        }
        .org-container {
            .org-name {
                display: inline-block;
                font-size: 16px;
                margin-right: 6px;
            }
            .org-created {
                display: inline-block;
                color: $secondary-text;
            }
        }
        .next-org-container {

        }
    }
</style>
