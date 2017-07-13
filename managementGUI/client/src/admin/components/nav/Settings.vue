<template>
    <div id="global-dropdown-setting">
        <div class="dropdown">
            <div id="global-dropdown-setting-icon" class="dropdown-toggle" data-toggle="dropdown">
                <svgicon icon="settings" width="28" height="28"></svgicon>
            </div>
            <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="global-dropdown-setting-icon">
                <li><a href="#">Logout</a></li>
            </ul>
        </div>
    </div>
</template>

<script>
    import '../../../icons/settings'
    export default {}
</script>

<style lang="scss">
    #global-dropdown-setting {
        float: right;

    }

    #global-dropdown-setting-icon {
        cursor: pointer;
        margin: 26px 0;
    }
</style>
