<template>
    <modal-dialog>
        <h3 slot="header">Filter Kategorie</h3>
        <div slot="body">
            <select class="form-control select-category-combination"
                    v-show="filter.categories.length > 1" v-model="filter.addCombination">
                <option value="true">Alle Kategorien müssen vorhanden sein</option>
                <option value="false">Mindestens eine Kategorie muss vorhanden sein</option>
            </select>
            <div class="event-categories">
                <div class="combination"></div>
                <div class="event-no-category-filter" v-show="filter.categories.length === 0">
                    Kategorie Filter ist deaktiviert.
                </div>
                <div v-for="category in filter.categories" class="event-category">
            <span class="event-category-icon" v-on:click="removeCategory(category)">
                <svgicon icon="removeCircle" width="22" height="22"></svgicon>
            </span>
                    <span class="event-category-name">{{category}}</span>
                </div>
                <div class="input-group add-event-categories-button">
            <span class="input-group-btn">
                <button class="btn btn-default" type="button" v-on:click="addNewCategory"
                        :disabled="category === ''">Hinzufügen</button>
            </span>
                    <input type="text" class="form-control" placeholder="Kategorie"
                           v-model="category">
                </div>
            </div>
        </div>
        <div slot="footer">
            <button type="button" class="btn btn-default"
                    v-on:click="$emit('abort')">
                Abbrechen
            </button>
            <button type="button" class="btn btn-primary" :disabled="!filterHasChanged"
                    v-on:click="changeEventFilter">
                Übernehmen
            </button>
        </div>
    </modal-dialog>
</template>

<script>
    import ModalDialog from './../../../../../utils/components/ModalDialog.vue';
    import equal from 'deep-equal';

    export default {
        props: ['categoryFilter'],
        components: {ModalDialog},
        data: function () {
            return {
                category: '', filter: {
                    addCombination: false, categories: [], excludedCategories: []
                }
            }
        },
        computed: {
            filterHasChanged: function () {
                if (this.categoryFilter) {
                    return !equal(this.filter, this.categoryFilter);
                } else {
                    return !equal(this.filter, {addCombination: false, categories: [], excludedCategories: []});
                }
            }
        },
        created: function () {
            if (this.categoryFilter) {
                this.filter = JSON.parse(JSON.stringify(this.categoryFilter));
            }
        },
        methods: {
            addNewCategory: function () {
                if (this.filter.categories.indexOf(this.category.toLowerCase()) === -1) {
                    this.filter.categories.push(this.category.toLowerCase());
                }
                this.category = '';
            },
            removeCategory: function (category) {
                let index = this.filter.categories.indexOf(category);
                if (index !== -1) {
                    this.filter.categories.splice(index, 1);
                }
            },
            changeEventFilter: function () {
                if (this.filter.categories.length > 0 || this.filter.excludedCategories.length > 0) {
                    this.$emit('change', this.filter);
                } else {
                    this.$emit('change', null);
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../../style/variable";

    .select-category-combination {
        margin-bottom: 8px;
    }

    .event-categories {
        .event-category {
            margin-bottom: 4px;
            .event-category-icon {
                cursor: pointer;
            }
            .event-category-name {
                margin-left: 6px;
                line-height: 22px;
                vertical-align: middle;
            }
        }
        .add-event-categories-button {
            margin-top: 18px;
        }
    }
</style>
