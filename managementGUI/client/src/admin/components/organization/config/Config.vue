<template>
    <div id="tc-config-organization">
        <div id="tc-container">
            <div id="org-config-header">
                <h1 id="org-name">Konfiguration der Organisation
                    <router-link :to="{name: 'orgDetail', params: {id: $route.params.id}}">
                        '{{config.organization.name}}'
                    </router-link>
                </h1>
            </div>
            <administrator :admins="config.organization.administrators"
                           @changed="configChanged"></administrator>
            <h2 class="sub-title">Website für Veranstaltungsimport</h2>
            <event-website></event-website>
            <h2 class="sub-title">Mit Vernetzungsplattformen synchronisieren</h2>
            <networking-platform-config v-for="networkingPlatform in config.networkingPlatforms"
                                        :np="networkingPlatform" @changed="configChanged">
            </networking-platform-config>
        </div>
        <change-config-command v-if="showConfigChanged" :nps="config.networkingPlatforms"
                               :previous-nps="configOriginal.networkingPlatforms"
                               :admins="config.organization.administrators"
                               :previous-admins="configOriginal.organization.administrators"
                               :organizationId="$route.params.id"
                               @updateSuccess="updateSuccess">
        </change-config-command>

        <snackbar type="error">
            <div slot="text">Ein Fehler ist aufgetreten.</div>
        </snackbar>

        <modal-dialog v-if="showWarningDialog">
            <h3 slot="header">Konfiguration nicht gespeichert</h3>
            <div slot="body">Die Konfiguration wurde noch nicht gespeichert. Möchtest du trotzdem diese Seite verlassen?</div>
            <div slot="footer">
                <button type="button" class="btn btn-default"
                        v-on:click="stayOnPage">
                    Zurück
                </button>
                <button type="button" class="btn btn-primary"
                        v-on:click="navigateToNext">
                    Nicht Speichern
                </button>
            </div>
        </modal-dialog>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import ModalDialog from './../../../../utils/components/ModalDialog.vue';
    import Administrator from './../../config/Administrators.vue';
    import NetworkingPlatformConfig from './NetworkingPlattformConfig.vue';
    import ChangeConfigCommand from './ChangeConfigCommand.vue';
    import EventWebsite from './EventWebsite.vue';
    import Snackbar from './../../../../utils/components/Snackbar.vue';

    export default {
        components: {ModalDialog, Administrator, NetworkingPlatformConfig, ChangeConfigCommand, EventWebsite, Snackbar},
        data: function () {
            return {config: {organization: {}}, showConfigChanged: false, showWarningDialog: false, nextRoute: null};
        },
        created: function () {
            HTTP.get(`/admin/api/organization/config`,
                {params: {organizationId: this.$route.params.id, language: 'DE'}}).then((resp) => {
                this.config = resp.data;
                this.configOriginal = JSON.parse(JSON.stringify(resp.data));
            }).catch(e => {
                this.$emit('showNotification', true);
                console.log(e);
            })
        },
        methods: {
            configChanged: function () {
                this.showConfigChanged = JSON.stringify(this.config.networkingPlatforms)
                    !== JSON.stringify(this.configOriginal.networkingPlatforms) ||
                    JSON.stringify(this.config.organization.administrators)
                    !== JSON.stringify(this.configOriginal.organization.administrators);
            },
            updateSuccess: function () {
                this.showConfigChanged = false;
                this.$router.push({name: 'orgDetail', params: {id: this.$route.params.id}})
            },
            navigateToNext: function () {
                this.nextRoute();
            },
            stayOnPage: function () {
                this.nextRoute(false);
                this.showWarningDialog = false;
            }
        },
        beforeRouteLeave: function (to, from, next) {
            if (this.showConfigChanged) {
                this.showWarningDialog = true;
                this.nextRoute = next;
            } else {
                next();
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
                margin-bottom: 28px;
                #org-name {
                    margin-top: 8px;
                    font-size: 20px;
                    font-weight: 500;
                    padding-bottom: 6px;
                }
            }
            .sub-title {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 18px;
                padding-bottom: 6px;
                border-bottom: 1px $divider solid;
            }
        }
    }
</style>
