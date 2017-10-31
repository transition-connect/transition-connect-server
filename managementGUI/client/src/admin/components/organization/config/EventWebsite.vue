<template>
    <div id="event-website-config">
        <form id="event-website-container">
            <div class="form-group" :class="{'has-error': errors.has('urlWebsite') && eventUrl !== ''}">
                <div class="input-group">
                    <input v-model="eventUrl" v-validate="'url'" type="text" name="urlWebsite"
                           class="form-control" placeholder="https://...">
                </div>
                <p class="text-danger" v-show="errors.has('urlWebsite')">Keine gültige URL</p>
                <p class="text-danger" v-show="urlSaveError">Url konnte nicht gespeichert werden. Ist dies die korrekte URL?</p>
            </div>
        </form>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';
    import Toggle from './../../../../utils/components/Toggle.vue';
    import {mapGetters} from 'vuex';
    import * as types from '../../../store/mutation-types';

    export default {
        components: {Toggle},
        data: function () {
            return {urlSaveError: false, requestPending: false};
        },
        computed: {
            eventUrl: {
                get () {
                    return this.$store.state.configOrganisation.eventsImportConfiguration
                },
                set (value) {
                    this.$validator.validateAll().then(() => {
                        this.$store.commit(types.UPDATE_EVENT_IMPORT_CONFIG,
                            {importConfig: value, valid: !this.errors.has('urlWebsite')})
                    });
                }
            }
        },
        methods: {
            updateEventUrl: function (e) {
                this.$validator.validateAll().then(() => {
                    this.$store.commit(types.UPDATE_EVENT_IMPORT_CONFIG,
                        {importConfig: e.data, valid: !this.errors.has('urlWebsite')})
                });
            },
            saveEventWebsite: function () {
                this.urlSaveError = false;
                this.requestPending = true;
                HTTP.put(`admin/api/organization/config/websiteEventImport`,
                    {params: {organizationId: this.$route.params.id, url: this.eventUrl}}).then(() => {
                    this.requestPending = false;
                }).catch(e => {
                    this.urlSaveError = true;
                    this.requestPending = false;
                });
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #event-website-config {
        #event-website-container {
            width: 100%;
            .input-group {
                width: 100%;
                input {
                    border-radius: 4px;
                }
            }
            .text-danger {
                margin-top: 6px;
            }
            .save-event-website {
                margin-top: 12px;
            }
        }
        padding-bottom: 8px;
        margin-bottom: 18px;
    }
</style>
