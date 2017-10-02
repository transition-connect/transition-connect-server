<template>
    <div class="np-container">
        <div class="np-header">
            <div class="np-title">
                <router-link :to="{name: 'npDetail', params: {id: np.platformId}}">
                    {{np.name}}
                </router-link>
            </div>
        </div>
        <div class="np-commands">
            <button type="button" class="btn btn-default"
                    v-on:click="$router.push({name: 'npDetail', params: {id: np.platformId}})">
                Detail
            </button>
        </div>
    </div>
</template>

<script>

    export default {
        props: ['np']
    }
</script>

<style lang="scss">
    @import "../../../style/variable";

    .np-container {
        display: table;
        width: 100%;
        margin-bottom: 18px;
        .np-header {
            display: table-cell;
            vertical-align: middle;
            width: auto;
            .np-title {
                cursor: pointer;
                font-weight: 300;
                font-size: 22px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 500px;
            }
        }
        .np-commands {
            display: table-cell;
            width: 175px;
            margin-top: 8px;
            text-align: right;
        }
    }
</style>
