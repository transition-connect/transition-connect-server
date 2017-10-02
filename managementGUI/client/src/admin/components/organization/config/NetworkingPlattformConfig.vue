<template>
    <div class="np-config">
        <div class="np-config-header">
            <div class="sync-toggle-container">
                <toggle :on="np.isDenied ? 'Nein': 'Ja'" off="Nein" size="normal"
                        :onstyle="getOnStyle" :disabled="np.isDenied"
                        :offstyle="!np.isExported ? 'danger': 'warning'" :state="np.isExported"
                        height="32px" width="80px" @changed="syncChanged"></toggle>
                <span class="np-name">Synchronisieren mit {{np.name}}</span>
            </div>
            <div class="category-config-denied" v-show="np.isDenied">
                Synchronisationsanfrage wurde abgelehnt
            </div>
            <a target="_blank" rel="noopener" :href="np.link">{{np.link}}</a>
            <div class="np-description">{{np.description}}</div>
        </div>
        <div class="category-container" v-show="np.isExported && !np.isDenied">
            <div class="category-title">
                Welchen Kategorien soll dieses Projekt auf {{np.name}} zugeordnet werden?
            </div>
            <div class="category-config-warning" v-show="!categorySelected">
                Mindestens eine Kategorie muss ausgewählt werden
            </div>
            <div v-for="category in np.categories">
                <div class="checkbox">
                    <label><input type="checkbox" v-model="category.isSelected">
                        <span>{{category.name}}</span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Toggle from './../../../../utils/components/Toggle.vue';

    export default {
        components: {Toggle},
        props: ['np'],
        data: function () {
            return {config: {}, categorySelected: true};
        },
        watch: {
            np: {
                handler: function (newNp) {
                    this.categorySelected = false;
                    for (let category of newNp.categories) {
                        if (category.isSelected) {
                            this.categorySelected = true;
                        }
                    }
                    this.$emit('changed');
                },
                deep: true
            }
        },
        methods: {
            syncChanged: function (newState) {
                this.np.isExported = newState;
                this.$emit('changed');
            }
        },
        computed: {
            getOnStyle: function () {
                if(this.np.isDenied) {
                    return 'danger'
                }
                return this.np.isExported ? 'success': 'warning'
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .np-config {
        margin-bottom: 32px;
        .np-config-header {
            padding-bottom: 8px;
            margin-bottom: 8px;
            border-bottom: 1px solid $divider;
            .sync-toggle-container {
                margin-bottom: 12px;
            }
            .np-description {
                margin-top: 2px;
                font-size: 14px;
                color: $secondary-text;
            }
            .category-config-denied {
                margin-top: -4px;
                margin-bottom: 6px;
                color: $error;
            }
        }
        .np-name {
            font-size: 16px;
            font-weight: 500;
            margin-left: 4px;
        }
        .category-container {
            .category-title {
                font-size: 14px;
                font-weight: 500;
            }
            .category-config-warning {
                font-size: 12px;
                color: $warning;
            }
        }
    }
</style>
