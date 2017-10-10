<template>
    <div class="accept-organisation">
        <div class="action-title">
            <router-link :to="{name: 'orgDetail', params: {id: actionData.organizationId}}">
                {{actionData.organizationName}}
            </router-link>
            möchte nach
            <router-link :to="{name: 'npDetail', params: {id: actionData.platformId}}">
                {{actionData.nameNetworkingPlatform}}
            </router-link>
            synchronisiert werden
        </div>
        <div class="notification-commands">
            <button type="button" class="btn btn-default notification-button"
                    v-on:click="sendExportRequestStatus(false)">
                Ablehnen
            </button>
            <button type="button" class="btn btn-primary notification-button"
                    v-on:click="sendExportRequestStatus(true)">
                Akzeptieren
            </button>
        </div>
        <snackbar type="error">
            <div slot="text">Ein Fehler ist aufgetreten.</div>
        </snackbar>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Snackbar from './../../../../utils/components/Snackbar.vue';

    export default {
        props: ['actionData'],
        components: {Snackbar},
        methods: {
            sendExportRequestStatus: function (accept) {
                HTTP.put(`/admin/api/networkingPlatform/organization/exportRequest`, {
                    params: {
                        platformId: this.actionData.platformId,
                        organizationId: this.actionData.organizationId,
                        accept: accept
                    }
                }).then(() => {
                    this.$emit('remove');
                }).catch(e => {
                    this.$emit('showNotification', true);
                    console.log(e);
                })
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .accept-organisation {
        display: table;
        width: 100%;
        .action-title {
            display: table-cell;
            width: auto;
            vertical-align: middle;
            font-size: 16px;
            .org-name {
                cursor: pointer;
                font-weight: 500;
            }
            .org-name:hover {
                text-decoration: underline;
            }
            .np-name {
                cursor: pointer;
                font-weight: 500;
            }
        }
        .notification-commands {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 200px;
            margin-top: 8px;
            .notification-button {
                min-width: 75px;
            }
        }
    }
</style>
