<template>
    <modal-dialog>
        <h3 slot="header">Kategorie zuweisen</h3>
        <div slot="body">
            <div class="category-container">
                <div class="category-title">Welchen Kategorien soll diese Organisation auf {{npName}} zugeordnet werden?</div>
                <div class="checkbox" v-for="category in categories">
                    <label>
                        <input type="checkbox" v-model="category.isSelected">
                        <span>{{category.name}}</span>
                    </label>
                </div>
            </div>
        </div>
        <div slot="footer">
            <button type="button" class="btn btn-default"
                    v-on:click="$emit('abort')">
                Abbrechen
            </button>
            <button type="button" class="btn btn-primary" :disabled="!mappingHasChanged"
                    v-on:click="changeCategoryMapping">
                Übernehmen
            </button>
        </div>
    </modal-dialog>
</template>

<script>
    import ModalDialog from './../../../../utils/components/ModalDialog.vue';
    import equal from 'deep-equal';

    export default {
        props: ['categoryMapping', 'npName'],
        components: {ModalDialog},
        data: function () {
            return {
                categories: []
            }
        },
        computed: {
            mappingHasChanged: function () {
                return !equal(this.categories, this.categoryMapping);
            }
        },
        created: function () {
            this.categories = JSON.parse(JSON.stringify(this.categoryMapping));
        },
        methods: {

            changeCategoryMapping: function () {
                this.$emit('change', this.categories);
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .category-container {
        max-height: 300px;
        overflow-y: auto;
        .checkbox {

        }
    }
</style>
