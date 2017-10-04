<template>
    <div class="next-org-container" v-if="numberOfOrganizations > organizations.length">
        <button type="button" class="btn btn-default todo-button"
                v-on:click="getNext()">
            Mehr Anzeigen
        </button>
        <snackbar type="error">
            <div slot="text">Ein Fehler ist beim Nachladen aufgetreten.</div>
        </snackbar>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Snackbar from './../../../../utils/components/Snackbar.vue';

    export default {
        props: ['organizations', 'platformId', 'numberOfOrganizations', 'maxTime', 'url'],
        components: {Snackbar},
        methods: {
            getNext: function () {
                HTTP.get(this.url, {
                    params: {
                        platformId: this.platformId,
                        skip: this.organizations.length,
                        limit: 20,
                        maxTime: this.maxTime
                    }
                }).then((resp) => {
                    this.$emit('addOrg', resp.data.org);
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

    .next-org-container {
        margin: 6px 0;
    }
</style>
