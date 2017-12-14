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
            <event-export :np="np" export-title="Veranstaltungen"></event-export>
        </div>

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
    import EventExport from './eventExport/EventExport.vue';
    import OrgCategoryMappingDialog from './OrgCategoryMappingDialog.vue';
    import ModalDialog from './../../../../utils/components/ModalDialog.vue';
    import {mapGetters} from 'vuex';

    export default {
        components: {
            Toggle, ModalDialog, EventExport, OrgCategoryMappingDialog
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
        }
    }
</style>
