<template>
    <div>
        <div>
            <div class="np-config-title">{{exportTitle}}</div>
            <div class="sync-toggle-container">
                <toggle :on="'Ja'" off="Nein" size="normal"
                        :onstyle="getOnEventStyle" :disabled="np.isEventDenied"
                        :offstyle="!np.isEventExported ? 'danger': 'warning'" :state="np.isEventExported"
                        height="22px" width="70px" @changed="syncEventChanged"></toggle>
                <span class="sync-description">synchronisieren</span>
            </div>
            <div class="config-filter-container" v-show="np.isEventExported">
                <div class="btn-group filter-button">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Filter konfiguriern <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li><span class="filter-element" v-on:click="showEventCategoryExportDialog = true">
                            Kategorie</span></li>
                        <li><span class="filter-element" v-on:click="showEventLocationExportDialog = true">
                            Veranstaltungsort</span></li>
                        <li role="separator" class="divider"></li>
                        <li><span class="filter-element" v-on:click="deleteEventFilter">Alle Filter löschen</span></li>
                    </ul>
                </div>
            </div>
            <div v-show="np.isEventExported">
                <div class="event-filter-all-export-description"
                     v-if="!np.eventCategoryFilter && !np.eventLocationFilter">
                    Alle Veranstaltungen werden nach {{np.name}} synchronisiert
                </div>
                <div class="event-filter-export-description" v-else>
                    Um eine Veranstaltung nach {{np.name}} zu synchronisieren, müssen folgende Bedingungen erfüllt sein:
                    <ul>
                        <li v-if="np.eventCategoryFilter && np.eventCategoryFilter.categories &&
                                    np.eventCategoryFilter.categories.length > 0">
                            <span v-show="np.eventCategoryFilter.addCombination">
                                Alle Kategorien müssen vorhanden sein:
                                <span class="category-name" v-for="(category, index) in np.eventCategoryFilter.categories">
                                    {{category}}<span v-show="index < np.eventCategoryFilter.categories.length - 1">, </span></span>
                            </span>
                            <span v-show="!np.eventCategoryFilter.addCombination">
                                Mindestens eine der Kategorien muss vorhanden sein:
                                <span class="category-name" v-for="(category, index) in np.eventCategoryFilter.categories">
                                    {{category}}<span v-show="index < np.eventCategoryFilter.categories.length - 1">, </span></span>

                            </span>
                        </li>
                        <li v-if="np.eventCategoryFilter && np.eventCategoryFilter.excludedCategories
                                    && np.eventCategoryFilter.excludedCategories.length > 0">
                            Keine der Kategorien darf vorhanden sein:
                        </li>
                        <li v-if="np.eventLocationFilter && np.eventLocationFilter.location &&
                                  np.eventLocationFilter.location.trim() !== ''">
                            Veranstaltungsort befindet sich im Umkreis von {{np.eventLocationFilter.radius}} Km von {{np.eventLocationFilter.location}}
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <event-export-category-dialog :category-filter="np.eventCategoryFilter"
                                      @abort="showEventCategoryExportDialog = false"
                                      @change="updateEventFilterCategory"
                                      v-if="showEventCategoryExportDialog">
        </event-export-category-dialog>

        <event-export-location-dialog :location-filter="np.eventLocationFilter"
                                      @abort="showEventLocationExportDialog = false"
                                      @change="updateEventFilterLocation"
                                      v-if="showEventLocationExportDialog">
        </event-export-location-dialog>
    </div>
</template>

<script>
    import Toggle from './../../../../../utils/components/Toggle.vue';
    import * as types from '../../../../store/mutation-types';
    import EventExportCategoryDialog from './EventExportCategoryDialog.vue';
    import EventExportLocationDialog from './EventExportLocationDialog.vue';
    import ModalDialog from './../../../../../utils/components/ModalDialog.vue';
    import {mapGetters} from 'vuex';

    export default {
        components: {
            Toggle, ModalDialog, EventExportCategoryDialog,
            EventExportLocationDialog
        },
        props: ['np', 'exportTitle'],
        data: function () {
            return {
                config: {}, showEventCategoryExportDialog: false,
                showEventLocationExportDialog: false,
                showOrgCategoryMappingDialog: false
            };
        },
        methods: {
            syncEventChanged: function (isExported) {
                this.$store.commit(types.UPDATE_SYNC_EVENT_STATE_TO_NP,
                    {isExported: isExported, np: this.np})
            },
            updateEventFilterCategory: function (filter) {
                this.$store.commit(types.UPDATE_EVENT_EXPORT_CATEGORY_FILTER,
                    {categoryFilter: filter, np: this.np});
                this.showEventCategoryExportDialog = false;
            },
            updateEventFilterLocation: function (filter) {
                this.$store.commit(types.UPDATE_EVENT_EXPORT_LOCATION_FILTER,
                    {locationFilter: filter, np: this.np});
                this.showEventLocationExportDialog = false;
            },
            deleteEventFilter: function () {
                this.$store.commit(types.DELETE_EVENT_EXPORT_FILTER, this.np);
            }
        },
        computed: {
            getSelectedCategories: function () {
                let categories = [];
                for (let category of this.np.categories) {
                    if (category.isSelected) {
                        categories.push(category);
                    }
                }
                return categories;
            },
            getOnEventStyle: function () {
                if (this.np.isDenied) {
                    return 'danger'
                }
                return this.np.isEventExported ? 'success' : 'warning'
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../../style/variable";

    .config-filter-container {
        display: inline-block;
        .dropdown-menu {
            li {
                line-height: 1.42857143;
                .filter-element {
                    cursor: pointer;
                    font-size: 14px;
                    display: block;
                    padding: 3px 20px;
                    clear: both;
                    line-height: 1.42857143;
                    color: #333;
                    white-space: nowrap;
                }
            }
        }
    }

    .event-filter-all-export-description {
        margin-top: 18px;
    }

    .event-filter-export-description {
        margin-top: 18px;
        ul {
            margin-top: 6px;
            padding-left: 18px;
            li {
                .category-name {
                    font-weight: 500;
                }
            }
        }
    }
</style>
