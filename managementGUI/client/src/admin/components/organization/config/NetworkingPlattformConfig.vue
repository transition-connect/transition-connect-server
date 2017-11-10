<template>
    <div class="np-config">
        <div class="np-name">{{np.name}}</div>
        <a class="np-link" target="_blank" rel="noopener" :href="np.link">{{np.link}}</a>
        <div class="np-description">{{np.description}}</div>
        <div class="np-config-container">
            <div class="np-config-title">Organisationsprofil</div>
            <div class="sync-toggle-container">
                <toggle :on="np.isDenied ? 'Nein': 'Ja'" off="Nein" size="normal"
                        :onstyle="getOnStyle" :disabled="np.isDenied"
                        :offstyle="!np.isExported ? 'danger': 'warning'" :state="np.isExported"
                        height="22px" width="70px" @changed="syncChanged"></toggle>
                <span class="sync-description">synchronisieren</span>
            </div>
            <div class="config-button-container" v-show="np.isExported">
                <button type="button" class="btn btn-default"
                        v-on:click="showOrgCategoryMappingDialog = true">
                    Kategorien zuweisen
                </button>
            </div>
            <div v-show="np.isExported">
                <div class="category-config-warning" v-show="!isCategorySelected">
                    Mindestens eine Kategorie muss zugewiesen werden
                </div>
                <div class="category-list" v-show="isCategorySelected">
                    Diese Organisation wird auf {{np.name}} den folgenden Kategorien zugeordnet:
                    <ul>
                        <li>
                        <span v-for="(category, index) in getSelectedCategories" class="category-name">
                            {{category.name}}<span v-show="index < getSelectedCategories.length - 1">, </span>
                        </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="category-config-denied" v-show="np.isDenied">
                Synchronisationsanfrage wurde abgelehnt
            </div>
        </div>
        <div class="np-config-container" v-show="np.isExported && !np.isDenied">
            <div class="np-config-title">Veranstaltungen</div>
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

        <org-category-mapping-dialog :category-mapping="np.categories" :np-name="np.name"
                                     @abort="showOrgCategoryMappingDialog = false"
                                     @change="updateOrgCategoryMapping"
                                     v-if="showOrgCategoryMappingDialog">
        </org-category-mapping-dialog>
    </div>
</template>

<script>
    import Toggle from './../../../../utils/components/Toggle.vue';
    import * as types from '../../../store/mutation-types';
    import EventExportCategoryDialog from './EventExportCategoryDialog.vue';
    import EventExportLocationDialog from './EventExportLocationDialog.vue';
    import OrgCategoryMappingDialog from './OrgCategoryMappingDialog.vue';
    import ModalDialog from './../../../../utils/components/ModalDialog.vue';
    import {mapGetters} from 'vuex';

    export default {
        components: {
            Toggle, ModalDialog, EventExportCategoryDialog,
            EventExportLocationDialog, OrgCategoryMappingDialog
        },
        props: ['np'],
        data: function () {
            return {
                config: {}, showEventCategoryExportDialog: false,
                showEventLocationExportDialog: false,
                showOrgCategoryMappingDialog: false
            };
        },
        methods: {
            syncChanged: function (isExported) {
                this.$store.commit(types.UPDATE_SYNC_ORG_STATE_TO_NP,
                    {isExported: isExported, np: this.np})
            },
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
            },
            updateOrgCategoryMapping: function (categories) {
                this.$store.commit(types.UPDATE_SYNC_CATEGORY_TO_NP,
                    {categories: categories, np: this.np});
                this.showOrgCategoryMappingDialog = false;
            }
        },
        computed: {
            isCategorySelected: function () {
                let categorySelected = false;
                for (let category of this.np.categories) {
                    if (category.isSelected) {
                        categorySelected = true;
                    }
                }
                return categorySelected;
            },
            getSelectedCategories: function () {
                let categories = [];
                for (let category of this.np.categories) {
                    if (category.isSelected) {
                        categories.push(category);
                    }
                }
                return categories;
            },
            getOnStyle: function () {
                if (this.np.isDenied) {
                    return 'danger'
                }
                return this.np.isExported ? 'success' : 'warning'
            },
            getOnEventStyle: function () {
                if (this.np.isDenied) {
                    return 'danger'
                }
                return this.np.isEventExported ? 'success' : 'warning'
            },
            ...mapGetters({
                successfullyUpdated: 'successfullyUpdated'
            })
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .np-config {
        margin-bottom: 16px;
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
        .np-config-container {
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
            .category-config-denied {
                font-size: 14px;
                color: $error;
            }
            .config-button-container {
                display: inline-block;
                button {
                    margin-right: 6px;
                }
            }
            .category-config-warning {
                margin-top: 18px;
                font-size: 14px;
                color: $warning;
            }
            .category-list {
                margin-top: 18px;
                ul {
                    margin-top: 6px;
                    padding-left: 18px;
                    li {
                        .category-name {
                            //font-weight: 500;
                        }
                    }
                }
            }
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
        }
    }
</style>
