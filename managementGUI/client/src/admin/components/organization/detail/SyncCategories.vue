<template>
    <div class="sync-categories-container">
        <div class="sync-category" v-for="(category, index) in categories">
            {{category}}
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            categories: {
                default() {
                    return [];
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .sync-categories-container {
        margin-top: 6px;
        .sync-category {
            margin-right: 6px;
            padding: 3px 6px;
            border-radius: 4px;
            display: inline-block;
            background-color: #616161;
            color: #ffffff;
        }
    }
</style>
