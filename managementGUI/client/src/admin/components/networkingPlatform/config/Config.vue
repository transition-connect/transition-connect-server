<template>
    <div id="tc-config-np">
        <div id="tc-container" v-if="configLoaded">
            <div id="np-config-header">
                <div id="np-name">Konfiguration der Vernetzungsplatform
                    <router-link :to="{name: 'npDetail', params: {id: $route.params.id}}">
                        '{{config.np.config.name}}'
                    </router-link>
                </div>
            </div>
            <administrator :admins="config.np.administrators"
                           @changed="configChanged"></administrator>
            <general-config :config="config.np.config" @changed="configChanged"></general-config>
        </div>

        <change-config-command v-if="showConfigChanged" :config="config.np.config"
                               :has-errors="hasErrors"
                               :previous-config="configOriginal.np.config"
                               :admins="config.np.administrators"
                               :previous-admins="configOriginal.np.administrators"
                               :platformId="$route.params.id"
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
    import Snackbar from './../../../../utils/components/Snackbar.vue';
    import Administrator from './../../config/Administrators.vue';
    import ChangeConfigCommand from './ChangeConfigCommand.vue';
    import GeneralConfig from './GeneralConfig.vue';

    export default {
        components: {ModalDialog, Snackbar, Administrator, ChangeConfigCommand, GeneralConfig},
        data: function () {
            return {
                config: {np: {config: {}}}, showConfigChanged: false, hasErrors: true,
                showWarningDialog: false, nextRoute: null, configLoaded: false
            };
        },
        created: function () {
            HTTP.get(`/admin/api/networkingPlatform/config`,
                {params: {platformId: this.$route.params.id}}).then((resp) => {
                this.config = resp.data;
                this.configOriginal = JSON.parse(JSON.stringify(resp.data));
                this.configLoaded = true;
            }).catch(e => {
                this.$emit('showNotification', true);
                this.configLoaded = true;
                console.log(e);
            })
        },
        methods: {
            configChanged: function (newHasErrors) {
                this.hasErrors = newHasErrors;
                this.showConfigChanged = JSON.stringify(this.config.np.config)
                    !== JSON.stringify(this.configOriginal.np.config) ||
                    JSON.stringify(this.config.np.administrators)
                    !== JSON.stringify(this.configOriginal.np.administrators);
            },
            updateSuccess: function () {
                this.showConfigChanged = false;
                this.$router.push({name: 'npDetail', params: {id: this.$route.params.id}})
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

    #tc-config-np {
        width: 100%;
        padding-top: 104px;
        #tc-container {
            margin: 0 auto;
            padding-bottom: 90px;
            width: 100%;
            max-width: $application-width;
            #np-config-header {
                margin-bottom: 18px;
                border-bottom: 1px solid $divider;
                #np-name {
                    font-size: 20px;
                    font-weight: 500;
                    padding-bottom: 6px;
                }
            }
        }
    }
</style>
