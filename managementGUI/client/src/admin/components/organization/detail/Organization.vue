<template>
    <div id="tc-detail-organization">
        <div id="tc-container">
            <div id="org-name">{{detail.organization.name}}</div>
            <div id="org-slogan>">{{detail.organization.slogan}}</div>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';

    export default {
        components: {},
        data: function () {
            return {detail: {organization: {}}};
        },
        created: function () {
            HTTP.get(`/admin/api/organization/detail`,
                {params: {organizationId: this.$route.params.id, language: 'DE'}}).then((resp) => {
                this.detail = resp.data;
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
        }
    }
</style>
