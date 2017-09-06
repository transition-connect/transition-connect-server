<template>
    <div id="tc-detail-np">
        <div id="tc-container" v-if="npLoaded">
            <div id="tc-detail-header">
                <button type="button" class="btn btn-default"
                        v-on:click="$router.push({name: 'npConfig', params: {id: $route.params.id}})">
                    Konfigurieren
                </button>
            </div>
            <info :np="this.detail.np"></info>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Info from './Info.vue';
    import moment from 'moment';

    export default {
        components: {Info},
        data: function () {
            return {detail: {np: {}}, npLoaded: false};
        },
        created: function () {
            HTTP.get(`/admin/api/networkingPlatform/detail`,
                {params: {platformId: this.$route.params.id, language: 'DE'}}).then((resp) => {
                this.npLoaded = true;
                this.detail = resp.data;
            }).catch(e => {
                console.log(e);
            })
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-np {
        width: 100%;
        padding-top: 104px;
        #tc-container {
            margin: 0 auto;
            width: 100%;
            max-width: $application-width;
            #tc-detail-header {
                margin-bottom: 12px;
            }
        }
    }
</style>
