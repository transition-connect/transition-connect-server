<template>
    <div id="tc-config-np">
        <div id="tc-container" v-if="npConfigIsLoaded">
            <breadcrumb :breadcrumbs="[{name: 'Vernetzungsplatform'}, {name: 'Konfiguration'}]"></breadcrumb>
            <div id="np-config-header">
                <h1 id="np-name">Konfiguration der Vernetzungsplatform
                    <router-link :to="{name: 'npDetail', params: {id: $route.params.id}}">
                        {{npName}}
                    </router-link>
                </h1>
                <change-config-command :platformId="$route.params.id"></change-config-command>
            </div>
            <administrator :admins="npAdministrators" add-command="ADD_ADMIN_TO_NP_CONFIG"
                           remove-command="REMOVE_ADMIN_FROM_NP_CONFIG"></administrator>
            <h2 class="sub-title">Allgemeine Einstellungen</h2>
            <general-config :config="npGeneralConfig"></general-config>
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
    import ModalDialog from './../../../../utils/components/ModalDialog.vue';
    import Snackbar from './../../../../utils/components/Snackbar.vue';
    import Breadcrumb from './../../../../utils/components/Breadcrumb.vue';
    import Administrator from './../../config/Administrators.vue';
    import ChangeConfigCommand from './ChangeConfigCommand.vue';
    import GeneralConfig from './GeneralConfig.vue';
    import {mapGetters} from 'vuex';

    export default {
        components: {ModalDialog, Snackbar, Breadcrumb, Administrator, ChangeConfigCommand, GeneralConfig},
        data: function () {
            return {
                showWarningDialog: false, nextRoute: null
            };
        },
        created: function () {
            this.$store.dispatch('getNpConfiguration', this.$route.params.id);
        },
        computed: {
            ...mapGetters({
                npConfigIsLoaded: 'npConfigIsLoaded',
                npName: 'npName',
                npAdministrators: 'npAdministrators',
                npGeneralConfig: 'npGeneralConfig',
                hasChanged: 'npHasChanged',
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
            if (this.hasChanged) {
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

    #tc-config-np {
        width: 100%;
        padding-top: 104px;
        #tc-container {
            margin: 0 auto;
            padding-bottom: 90px;
            width: 100%;
            max-width: $application-width;
            #np-config-header {
                margin-bottom: 28px;
                #np-name {
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
