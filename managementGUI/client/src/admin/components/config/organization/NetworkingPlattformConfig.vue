<template>
    <div class="np-config-header">
        <div>
            <toggle on="Ja" off="Nein" size="normal" onstyle="success" offstyle="danger" :state="np.isExported"
                    height="32px" width="80px" @changed="syncChanged"></toggle>
            <span class="np-name">Synchronisieren mit {{np.name}}</span>
        </div>
        <div class="category-container">
            <div v-for="category in np.categories">
                <div class="checkbox">
                    <label><input type="checkbox" v-model="category.isSelected" :disabled="!np.isExported">
                        <span :class="{disabled: !np.isExported}">{{category.name}}</span>
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
            return {config: {}};
        },
        methods: {
            syncChanged: function (newState) {
                this.np.isExported = newState;
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .np-config-header {
        .np-name {
            font-size: 16px;
            font-weight: 500;
            margin-left: 4px;
        }
        .category-container {
            margin-bottom: 32px;
            .disabled {
                color: $disabled-text;
            }
        }
    }
</style>
