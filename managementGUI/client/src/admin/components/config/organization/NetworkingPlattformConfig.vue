<template>
    <div class="np-config-header">
        <div>
            <toggle on="Ja" off="Nein" size="normal" onstyle="success" offstyle="danger"
                    height="32px" width="80px"></toggle>
            <span class="np-name">Synchronisiert mit {{np.name}}</span>
        </div>
        <div class="category-container">
            <div v-for="category in np.categories">
                <div class="checkbox">
                    <label><input type="checkbox" v-model="category.isSelected">
                        {{category.name}}
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
        }
    }
</style>
