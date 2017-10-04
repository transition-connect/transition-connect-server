<template>
    <div id="global-dropdown-setting">
        <div class="dropdown">
            <div id="global-dropdown-setting-icon" class="dropdown-toggle" data-toggle="dropdown">
                <svgicon icon="settings" width="28" height="28"></svgicon>
            </div>
            <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="global-dropdown-setting-icon">
                <li><a v-on:click="logout()" href="#">Logout</a></li>
            </ul>
        </div>
        <snackbar type="error">
            <div slot="text">Ein Fehler ist beim Logout aufgetreten.</div>
        </snackbar>
    </div>
</template>

<script>
    import {HTTP} from './../../../utils/http-common';
    import Snackbar from './../../../utils/components/Snackbar.vue';

    export default {
        components: {Snackbar},
        methods: {
            logout: function () {
                HTTP.post(`/admin/api/logout`).then(() => {
                    window.location.href = "/";
                }).catch(e => {
                    this.$emit('showNotification', true);
                    console.log(e);
                })
            }
        }
    }
</script>

<style lang="scss">
    #global-dropdown-setting {
        float: right;

    }

    #global-dropdown-setting-icon {
        cursor: pointer;
        margin: 26px 0;
    }
</style>
