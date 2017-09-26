<template>
    <div id="tc-commands-config-container">
        <div id="tc-commands">
            <button type="button" id="change-config-button" class="btn btn-warning"
                    v-on:click="changeExportConfig" :disabled="showLoading || !isValidNpConfig">
                Konfiguration ändern
            </button>
            <loader id="config-change-loader" v-show="showLoading"></loader>
            <div id="config-upload-failed" v-show="configUpdateFailed">
                Fehler: Konfiguration konnte nicht gespeichert werden
            </div>
            <div id="invalid-config" v-show="!isValidNpConfig">
                Konfiguration ist noch nicht vollständig
            </div>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Loader from './../../../../utils/components/Loader.vue';
    import {getExportMessage} from './exportConfigHandler';
    import {isValidConfig} from './exportConfigHandler';

    export default {
        components: {Loader},
        props: ['nps', 'previousNps', 'admins', 'previousAdmins', 'organizationId'],
        data: function () {
            return {showLoading: false, configUpdateFailed: false};
        },
        methods: {
            changeExportConfig: function () {
                let commands = [];
                if (JSON.stringify(this.nps) !== JSON.stringify(this.previousNps)) {
                    let npsMessage = getExportMessage(this.nps);
                    commands.push(HTTP.put(`/admin/api/organization/exportConfig`,
                        {params: {organizationId: this.organizationId, nps: npsMessage}}));
                }
                if (JSON.stringify(this.admins) !== JSON.stringify(this.previousAdmins)) {
                    commands.push(HTTP.put(`/admin/api/organization/adminConfig`,
                        {params: {organizationId: this.organizationId, admins: this.admins}}));
                }
                if(commands.length > 0) {
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
        },
        computed: {
            isValidNpConfig: function () {
                return isValidConfig(this.nps);
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
