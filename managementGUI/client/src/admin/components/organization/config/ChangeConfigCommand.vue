<template>
    <div id="tc-commands-config-container" v-show="showConfigChanged">
        <div id="tc-commands">
            <button type="button" class="btn btn-warning"
                    v-on:click="$router.push({name: 'npConfig', params: {id: $route.params.id}})">
                Konfiguration ändern
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        components: {}
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-commands-config-container {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        height: 72px;
        z-index: 1000;
        background-color: #e5e5e5;
        border-top: 1px $divider solid;
        #tc-commands {
            margin: 0 auto;
            width: 100%;
            padding-top: 19px;
            max-width: $application-width;
        }
    }
</style>
