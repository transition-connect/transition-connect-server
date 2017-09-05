<template>
    <div id="tc-detail-organization">
        <div id="tc-container">
            <div id="org-name">{{detail.organization.name}}</div>
            <div id="org-detail-container">
                <div class="org-detail-row">
                    <div class="org-detail-title">Erstellt</div>
                    <div class="org-detail-text">{{detail.organization.created}}</div>
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
            #org-name {
                font-size: 20px;
                font-weight: 500;
                padding-bottom: 6px;
                margin-bottom: 32px;
                border-bottom: 1px solid $divider;
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
                    }
                }
            }
        }
    }
</style>
