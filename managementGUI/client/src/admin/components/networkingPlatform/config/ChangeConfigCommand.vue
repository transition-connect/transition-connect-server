<template>
    <div id="tc-commands-np-config-container">
        <div id="tc-commands">
            <button type="button" id="change-config-button" class="btn btn-primary"
                    v-on:click="changeExportConfig" :disabled="showLoading || !hasChanged">
                Konfiguration speichern
            </button>
            <loader id="config-change-loader" v-show="showLoading"></loader>
            <div id="config-update-successful" v-show="successfullyUpdated">
                Konfiguration erfolgreich gespeichert
            </div>
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
    import * as types from '../../../store/mutation-types';
    import {mapGetters} from 'vuex'

    export default {
        components: {Loader},
        props: ['platformId'],
        data: function () {
            return {showLoading: false, configUpdateFailed: false};
        },
        computed: {
            ...mapGetters({
                hasChanged: 'npHasChanged',
                npGeneralConfigChanged: 'npGeneralConfigChanged',
                npAdministratorsChanged: 'npAdministratorsChanged',
                npGeneralConfig: 'npGeneralConfig',
                npAdministrators: 'npAdministrators',
                successfullyUpdated: 'npConfigSuccessfullyUpdated'
            })
        },
        methods: {
            changeExportConfig: function () {
                let commands = [];
                if (this.npGeneralConfigChanged) {
                    commands.push(HTTP.put(`/admin/api/networkingPlatform/config/general`,
                        {
                            params: {
                                platformId: this.platformId, description: this.npGeneralConfig.description,
                                link: this.npGeneralConfig.link,
                                manuallyAcceptOrganization: this.npGeneralConfig.manuallyAcceptOrganization,
                            }
                        }));
                }
                if (this.npAdministratorsChanged) {
                    commands.push(HTTP.put(`/admin/api/networkingPlatform/config/admin`,
                        {params: {platformId: this.platformId, admins: this.npAdministrators}}));
                }
                if (commands.length > 0) {
                    this.showLoading = true;
                    Promise.all(commands).then(() => {
                        this.showLoading = false;
                        this.$store.commit(types.UPDATE_NP_CONFIG_COMMIT)
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

    #tc-commands-np-config-container {
        #tc-commands {
            width: 100%;
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
            #config-update-successful {
                display: inline-block;
                font-weight: 500;
                color: $success;
            }
        }
    }
</style>
