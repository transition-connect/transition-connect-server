<template>
    <div class="accept-organisation">
        <div class="action-title">
            <router-link :to="{name: 'orgDetail', params: {id: actionData.organizationId}}">
                {{actionData.organizationName}}
            </router-link> möchte mit
            <router-link :to="{name: 'npDetail', params: {id: actionData.platformId}}">
                {{actionData.nameNetworkingPlatform}}
            </router-link> synchronisiert werden
        </div>
        <div class="todo-commands">
            <button type="button" class="btn btn-default todo-button"
                    v-on:click="">
                Ablehnen
            </button>
            <button type="button" class="btn btn-primary todo-button"
                    v-on:click="">
                Akzeptieren
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['actionData'],
        components: {}
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .accept-organisation {
        display: table;
        width: 100%;
        .action-title {
            display: table-cell;
            width: auto;
            vertical-align: middle;
            font-size: 16px;
            .org-name {
                cursor: pointer;
                font-weight: 500;
            }
            .org-name:hover {
                text-decoration: underline;
            }
            .np-name {
                cursor: pointer;
                font-weight: 500;
            }
        }
        .todo-commands {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 200px;
            margin-top: 8px;
            .todo-button {
                min-width: 75px;
            }
        }
    }
</style>
