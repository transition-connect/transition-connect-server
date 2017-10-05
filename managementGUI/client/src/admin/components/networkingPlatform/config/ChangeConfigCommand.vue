<template>
    <div id="tc-commands-config-container">
        <div id="tc-commands">
            <button type="button" id="change-config-button" class="btn btn-warning"
                    v-on:click="changeExportConfig" :disabled="showLoading || this.hasErrors">
                Konfiguration ändern
            </button>
            <loader id="config-change-loader" v-show="showLoading"></loader>
            <div id="config-upload-failed" v-show="configUpdateFailed">
                Fehler: Konfiguration konnte nicht gespeichert werden
            </div>
            <div id="invalid-config" v-show="this.hasErrors">
                Konfiguration ist nicht gültig
            </div>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Loader from './../../../../utils/components/Loader.vue';

    export default {
        components: {Loader},
        props: ['config', 'previousConfig', 'admins', 'previousAdmins', 'platformId', 'hasErrors'],
        data: function () {
            return {showLoading: false, configUpdateFailed: false};
        },
        methods: {
            changeExportConfig: function () {
                let commands = [];
                if (JSON.stringify(this.config) !== JSON.stringify(this.previousConfig)) {
                    commands.push(HTTP.put(`/admin/api/networkingPlatform/config/general`,
                        {
                            params: {
                                platformId: this.platformId, description: this.config.description,
                                link: this.config.link,
                                manuallyAcceptOrganization: this.config.manuallyAcceptOrganization,
                            }
                        }));
                }
                if (JSON.stringify(this.admins) !== JSON.stringify(this.previousAdmins)) {
                    commands.push(HTTP.put(`/admin/api/networkingPlatform/config/admin`,
                        {params: {platformId: this.platformId, admins: this.admins}}));
                }
                if (commands.length > 0) {
                    Promise.all(commands).then(() => {
                        this.showLoading = false;
                        this.$emit('updateSuccess');
                    }).catch(e => {
                        console.log(e);
                        this.showLoading = false;
                        this.configUpdateFailed = true;
                    })
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-commands-config-container {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        height: 72px;
        z-index: 1000;
        background-color: #e5e5e5;
        border-top: 1px $divider solid;
        #tc-commands {
            margin: 0 auto;
            width: 100%;
            padding-top: 19px;
            max-width: $application-width;
            #change-config-button {
                display: inline-block;
                margin-right: 12px;
            }
            #config-change-loader {
                position: relative;
                top: 8px;
            }
            #config-upload-failed {
                display: inline-block;
                font-weight: 500;
                color: $error;
            }
            #invalid-config {
                display: inline-block;
                font-weight: 500;
                color: $warning;
            }
        }
    }
</style>
