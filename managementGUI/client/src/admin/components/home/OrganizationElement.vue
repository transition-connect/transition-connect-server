<template>
    <div class="org-container">
        <div class="org-header">
            <div class="org-title">
                <router-link :to="{name: 'orgDetail', params: {id: organization.organizationId}}">
                    {{organization.name}}
                </router-link>
            </div>
            <div class="np-name">Erstellt auf der Plattform
                <span class="np-name-bold">{{organization.nameNetworkingPlatform}}</span>
            </div>
        </div>
        <div class="org-commands">
            <button type="button" class="btn btn-default"
                    v-on:click="$router.push({name: 'orgDetail', params: {id: organization.organizationId}})">
                Detail
            </button>
        </div>
    </div>
</template>

<script>

    export default {
        props: ['organization']
    }
</script>

<style lang="scss">
    @import "../../../style/variable";

    .org-container {
        display: table;
        width: 100%;
        margin-bottom: 18px;
        .org-header {
            display: table-cell;
            width: auto;
            .org-title {
                cursor: pointer;
                font-weight: 300;
                font-size: 22px;
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 500px;
            }
            .np-name {
                display: inline-block;
                line-height: 20px;
                font-size: 14px;
                .np-name-bold {
                    font-weight: 500;
                }
            }
        }
        .org-commands {
            display: table-cell;
            width: 175px;
            margin-top: 8px;
            text-align: right;
        }
    }
</style>
