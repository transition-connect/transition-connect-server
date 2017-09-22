<template>
    <div id="tc-config-organization">
        <div id="tc-container">
            <div id="org-config-header">
                <div id="org-name">Konfiguration für '{{config.organization.name}}'</div>
                <div id="org-config-commands">
                    <button type="button" class="btn btn-default"
                            v-on:click="$router.push({name: 'orgDetail', params: {id: $route.params.id}})">
                        Detailansicht
                    </button>
                </div>
            </div>
            <administrator :admins="config.organization.administrators"></administrator>
            <networking-platform-config v-for="networkingPlatform in config.networkingPlatforms"
                                        :np="networkingPlatform" @changed="configChanged">
            </networking-platform-config>
        </div>
        <change-config-command v-show="showConfigChanged"></change-config-command>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Administrator from './Administrators.vue';
    import NetworkingPlatformConfig from './NetworkingPlattformConfig.vue';
    import ChangeConfigCommand from './ChangeConfigCommand.vue';

    export default {
        components: {Administrator, NetworkingPlatformConfig, ChangeConfigCommand},
        data: function () {
            return {config: {organization: {}}, showConfigChanged: false};
        },
        created: function () {
            HTTP.get(`/admin/api/organization/config`,
                {params: {organizationId: this.$route.params.id, language: 'DE'}}).then((resp) => {
                this.config = resp.data;
                this.configOriginal = JSON.parse(JSON.stringify(resp.data));
            }).catch(e => console.log(e))
        },
        methods: {
            configChanged: function () {
                this.showConfigChanged = JSON.stringify(this.config.networkingPlatforms)
                    !== JSON.stringify(this.configOriginal.networkingPlatforms);
            }
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
            padding-bottom: 90px;
            width: 100%;
            max-width: $application-width;
            #org-config-header {
                margin-bottom: 12px;
                border-bottom: 1px solid $divider;
                #org-name {
                    font-size: 20px;
                    font-weight: 500;
                    padding-bottom: 6px;
                }
                #org-config-commands {
                    padding-bottom: 6px;
                }
            }
        }
    }
</style>
