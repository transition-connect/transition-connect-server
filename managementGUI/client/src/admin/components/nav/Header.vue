<template>
    <div id="tc-header">
        <div id="tc-header-container">
            <div id="tc-logo">TC</div>
            <nav-settings id="nav-settings"></nav-settings>
        </div>
    </div>
</template>

<script>
    import NavSettings from './Settings.vue'

    export default {
        name: 'header-nav',
        components: {
            NavSettings
        }
    }
</script>

<style lang="scss">
    @import "../../../style/variable";

    #tc-header {
        width: 100%;
        position: fixed;
        top: 0;
        background-color: #ffffff;
        height: 80px;
        border-bottom: 1px solid $divider;

        #tc-header-container {
            height: 80px;
            margin: 0 auto;
            width: 100%;
            max-width: $application-width;
            #tc-logo {
                float: left;
                font-size: 30px;
                font-weight: 500;
                line-height: 80px;
            }
            #nav-settings {
                float: right;
            }
        }
    }
</style>
