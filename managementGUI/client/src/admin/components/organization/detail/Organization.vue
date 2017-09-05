<template>
    <div id="tc-detail-organization">
        <div id="tc-container">
            <div id="tc-detail-header">
                <div id="org-name">{{detail.organization.name}}</div>
                <button type="button" class="btn btn-default"
                        v-on:click="$router.push({name: 'orgConfig', params: {id: $route.params.id}})">
                    Konfigurieren
                </button>
            </div>
            <div id="org-detail-container">
                <div class="org-detail-row">
                    <div class="org-detail-title">Erstellt</div>
                    <div class="org-detail-text">Von
                        <span class="np-created">{{detail.organization.createdNetworkingPlatformName}}</span>
                        am {{detail.organization.created}}
                    </div>
                </div>
                <div class="org-detail-row">
                    <div class="org-detail-title">Slogan</div>
                    <div class="org-detail-text">{{detail.organization.slogan}}</div>
                </div>
                <div class="org-detail-row">
                    <div class="org-detail-title">Website</div>
                    <div class="org-detail-text">
                        <a target="_blank" :href="detail.organization.website">{{detail.organization.website}}</a>
                    </div>
                </div>
                <div class="org-detail-row">
                    <div class="org-detail-title">Kategorien</div>
                    <div class="org-detail-text">
                        <span v-for="(category, index) in detail.organization.categories">
                            {{category}}<span v-if="index !== detail.organization.categories.length - 1">,</span>
                        </span>
                    </div>
                </div>
                <div class="org-detail-row">
                    <div class="org-detail-title">Beschreibung</div>
                    <div class="org-detail-text">{{detail.organization.description}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import moment from 'moment';

    export default {
        components: {},
        data: function () {
            return {detail: {organization: {}}};
        },
        created: function () {
            HTTP.get(`/admin/api/organization/detail`,
                {params: {organizationId: this.$route.params.id, language: 'DE'}}).then((resp) => {
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
                padding-bottom: 6px;
                margin-bottom: 24px;
                border-bottom: 1px solid $divider;
                #org-name {
                    font-size: 20px;
                    font-weight: 500;
                    padding-bottom: 3px;
                }
            }
            #org-detail-container {
                display: table;
                .org-detail-row {
                    display: table-row;
                    .org-detail-title {
                        display: table-cell;
                        padding: 6px 32px 6px 0;
                        font-weight: 500;
                        font-size: 14px;
                    }
                    .org-detail-text {
                        display: table-cell;
                        font-size: 14px;
                        .np-created {
                            font-weight: 500;
                        }
                    }
                }
            }
        }
    }
</style>
