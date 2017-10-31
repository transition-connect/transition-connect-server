<template>
    <div id="tc-commands-config-container">
        <div id="tc-commands">
            <button type="button" id="change-config-button" class="btn btn-primary"
                    v-on:click="changeExportConfig" :disabled="showLoading || !isValidConfig || !hasChanged">
                Konfiguration speichern
            </button>
            <loader id="config-change-loader" v-show="showLoading"></loader>
            <div id="config-update-successful" v-show="successfullyUpdated">
                Konfiguration erfolgreich geändert
            </div>
            <div class="config-upload-failed" v-show="configUpdateFailed">
                Fehler: Konfiguration konnte nicht gespeichert werden
            </div>
            <div class="config-upload-failed" v-show="invalidEventImportUrl">
                Fehler: Url für Veranstaltungsimport ist nicht gültig
            </div>
            <div id="invalid-config" v-show="!isValidConfig">
                Konfiguration ist noch nicht vollständig
            </div>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Loader from './../../../../utils/components/Loader.vue';
    import {getExportMessage} from './exportConfigHandler';
    import * as types from '../../../store/mutation-types';
    import equal from 'deep-equal';
    import {mapGetters} from 'vuex'

    export default {
        components: {Loader},
        props: ['organizationId'],
        data: function () {
            return {showLoading: false, configUpdateFailed: false, invalidEventImportUrl: false};
        },
        methods: {
            changeExportConfig: function () {
                let commands = [];
                this.invalidEventImportUrl = false;
                this.configUpdateFailed = false;
                if (this.networkingPlatformsChanged) {
                    let npsMessage = getExportMessage(this.getNetworkingPlatforms);
                    commands.push(HTTP.put(`/admin/api/organization/config/export`,
                        {params: {organizationId: this.organizationId, nps: npsMessage}}));
                }
                if (this.administratorsChanged) {
                    commands.push(HTTP.put(`/admin/api/organization/config/admin`,
                        {params: {organizationId: this.organizationId, admins: this.getOrgAdministrators}}));
                }
                if (this.eventsImportConfigurationChanged) {
                    commands.push(HTTP.put(`/admin/api/organization/config/websiteEventImport`,
                        {params: {organizationId: this.organizationId, url: this.eventUrl}}));
                }
                if (commands.length > 0) {
                    Promise.all(commands).then(() => {
                        this.showLoading = false;
                        this.$store.commit(types.UPDATE_CONFIG_COMMIT)
                    }).catch(e => {
                        console.log(e);
                        this.showLoading = false;
                        if (e.response.data && e.response.data.errorCode &&
                            (e.response.data.errorCode === 1 || e.response.data.errorCode === 2)) {
                            this.invalidEventImportUrl = true;
                            this.$store.commit(types.UPDATE_IMPORT_EVENT_URL_FAILED)
                        } else {
                            this.configUpdateFailed = true;
                        }
                    })
                }
            }
        },
        computed: {
            ...mapGetters({
                hasChanged: 'hasChanged',
                isValidConfig: 'isValidConfig',
                networkingPlatformsChanged: 'networkingPlatformsChanged',
                administratorsChanged: 'administratorsChanged',
                eventsImportConfigurationChanged: 'eventsImportConfigurationChanged',
                getNetworkingPlatforms: 'getNetworkingPlatforms',
                getOrgAdministrators: 'getOrgAdministrators',
                eventUrl: 'getEventsImportConfiguration',
                successfullyUpdated: 'successfullyUpdated'
            })
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-commands-config-container {
        #tc-commands {
            margin: 0 auto;
            width: 100%;
            margin-bottom: 12px;
            max-width: $application-width;
            #change-config-button {
                display: inline-block;
                margin-right: 12px;
            }
            #config-change-loader {
                position: relative;
                top: 8px;
            }
            .config-upload-failed {
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
