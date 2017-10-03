<template>
    <div id="tc-np-org-created" v-if="numberOfOrganizations > 0">
        <div class="org-created-title">{{numberOfOrganizations}} von {{nameNp}} erstellte Organisationen</div>
        <div v-for="org in organizations" class="org-container">
            <router-link :to="{name: 'orgDetail', params: {id: org.organizationId}}" class="org-name">
                {{org.name}}
            </router-link>
            <div class="org-created">Erstellt am {{getCreated(org.created)}}</div>
        </div>
        <div class="next-org-container" v-if="numberOfOrganizations > organizations.length">
            <button type="button" class="btn btn-default todo-button"
                    v-on:click="getNext()">
                Nächste
            </button>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';
    import {HTTP} from './../../../../utils/http-common';

    export default {
        props: ['organizations', 'platformId', 'numberOfOrganizations', 'nameNp', 'maxTime'],
        methods: {
            getCreated: function (created) {
                return moment.unix(created).format('LLL')
            },
            getNext: function () {
                HTTP.get(`/admin/api/networkingPlatform/orgCreatedByNp`, {
                    params: {
                        platformId: this.platformId,
                        skip: this.organizations.length,
                        limit: 20,
                        maxTime: this.maxTime
                    }
                }).then((resp) => {
                    this.$emit('addOrg', resp.data.org);
                }).catch(e => {
                    console.log(e);
                })
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
