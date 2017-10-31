<template>
    <div class="checkbox">
        <label>
            <input type="checkbox" v-model="isSelected">
            <span>{{category.name}}</span>
        </label>
    </div>
</template>

<script>
    import * as types from '../../../store/mutation-types';

    export default {
        props: ['np', 'category'],
        data: function () {
            return {};
        },
        computed: {
            isSelected: {
                get() {
                    return this.category.isSelected;
                },
                set(isSelected) {
                    this.$store.commit(types.UPDATE_SYNC_CATEGORY_TO_NP,
                        {isSelected: isSelected, np: this.np, category: this.category})
                }
            }
        }
    }
</script>
