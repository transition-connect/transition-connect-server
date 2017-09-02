<template>
    <div id="tc-config-organization">
        <div id="tc-container">
            <div id="org-name">Konfiguration für '{{config.organization.name}}'</div>
            <networking-platform-config v-for="networkingPlatform in config.networkingPlatforms"
                                        :np="networkingPlatform"></networking-platform-config>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import NetworkingPlatformConfig from './NetworkingPlattformConfig.vue';

    export default {
        components: {NetworkingPlatformConfig},
        data: function () {
            return {config: {organization: {}}};
        },
        created: function () {
            HTTP.get(`/admin/api/organization/config`,
                {params: {organizationId: this.$route.params.id, language: 'DE'}}).then((resp) => {
                this.config = resp.data;
            }).catch(e => {
                console.log(e);
            })
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-config-organization {
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
