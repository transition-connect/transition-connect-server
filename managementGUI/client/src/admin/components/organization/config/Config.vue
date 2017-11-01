<template>
    <div id="tc-config-organization" v-if="isLoaded">
        <div id="tc-container">
            <breadcrumb :breadcrumbs="[{name: 'Organisation'}, {name: 'Konfiguration'}]"></breadcrumb>
            <div id="org-config-header">
                <h1 id="org-name">Konfiguration der Organisation
                    <router-link :to="{name: 'orgDetail', params: {id: $route.params.id}}">
                        {{getOrgName}}
                    </router-link>
                </h1>
                <change-config-command :organizationId="$route.params.id">
                </change-config-command>
            </div>
            <administrator :admins="getOrgAdministrators" add-command="ADD_ADMIN_TO_ORG_CONFIG"
                           remove-command="REMOVE_ADMIN_FROM_ORG_CONFIG"></administrator>
            <h2 class="sub-title">Website für Veranstaltungsimport</h2>
            <event-website></event-website>
            <h2 class="sub-title">Mit Vernetzungsplattformen synchronisieren</h2>
            <networking-platform-config v-for="networkingPlatform in getNetworkingPlatforms"
                                        :np="networkingPlatform">
            </networking-platform-config>
        </div>

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
    import Breadcrumb from './../../../../utils/components/Breadcrumb.vue';
    import Administrator from './../../config/Administrators.vue';
    import NetworkingPlatformConfig from './NetworkingPlattformConfig.vue';
    import ChangeConfigCommand from './ChangeConfigCommand.vue';
    import EventWebsite from './EventWebsite.vue';
    import Snackbar from './../../../../utils/components/Snackbar.vue';
    import equal from 'deep-equal';
    import {mapGetters} from 'vuex';

    export default {
        components: {
            ModalDialog, Breadcrumb, Administrator, NetworkingPlatformConfig,
            ChangeConfigCommand, EventWebsite, Snackbar
        },
        data: function () {
            return {config: {organization: {eventsImportConfiguration: ''}}, showWarningDialog: false, nextRoute: null};
        },
        created: function () {
            this.$store.dispatch('getConfiguration', this.$route.params.id);
        },
        computed: {
            ...mapGetters({
                getOrgName: 'getOrgName',
                getNetworkingPlatforms: 'getNetworkingPlatforms',
                getOrgAdministrators: 'getOrgAdministrators',
                isLoaded: 'isLoaded',
                configChanged: 'hasChanged'
            })
        },
        methods: {
            navigateToNext: function () {
                this.nextRoute();
            },
            stayOnPage: function () {
                this.nextRoute(false);
                this.showWarningDialog = false;
            }
        },
        beforeRouteLeave: function (to, from, next) {
            if (this.configChanged) {
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
                    margin-top: 32px;
                    font-size: 24px;
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
