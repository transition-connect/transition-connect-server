<template>
    <div id="original-np-config">
        <div class="np-name">{{np.name}}</div>
        <a class="np-link" target="_blank" rel="noopener" :href="np.link">{{np.link}}</a>
        <div class="np-description">{{np.description}}</div>
        <div class="sync-events" v-show="isValidEventImport">
            <event-export :np="np" export-title="Veranstaltungen von Website importiert"></event-export>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex';
    import * as types from '../../../store/mutation-types';
    import EventExport from './eventExport/EventExport.vue';

    export default {
        components: {EventExport},
        computed: {
            eventUrl: {
                get() {
                    return this.$store.state.configOrganisation.eventsImportConfiguration
                },
                set(value) {
                    this.$validator.validateAll().then(() => {
                        this.$store.commit(types.UPDATE_EVENT_IMPORT_CONFIG,
                            {importConfig: value, valid: !this.errors.has('urlWebsite')})
                    });
                }
            },
            ...mapGetters({
                np: 'getOriginalNetworkingPlatform',
                isValidEventImport: 'isValidEventImport'
            })
        },
        methods: {
            updateEventUrl: function (e) {
                this.$validator.validateAll().then(() => {
                    this.$store.commit(types.UPDATE_EVENT_IMPORT_CONFIG,
                        {importConfig: e.data, valid: !this.errors.has('urlWebsite')})
                });
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #original-np-config {
        margin-bottom: 48px;
        border: 2px solid $divider;
        border-radius: 6px;
        .np-name {
            font-size: 18px;
            font-weight: 500;
            padding: 6px 12px;
            color: $tc-default-color;
        }
        .np-link {
            padding: 0 12px;
        }
        .np-description {
            padding: 0 12px 8px 12px;
        }
        .sync-events {
            border-top: 1px solid $divider;
            padding: 8px 12px;
            .np-config-title {
                font-size: 16px;
                margin-bottom: 12px;
                font-weight: 500;
            }
            .sync-toggle-container {
                display: inline-block;
                margin-bottom: 6px;
                .sync-description {
                    display: inline-block;
                    margin-left: 4px;
                    margin-right: 32px;
                    font-weight: 400;
                }
            }
        }
    }
</style>
