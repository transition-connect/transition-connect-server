<template>
    <div id="tc-breadcrumb">
        <div id="breadcrumb-home"
             v-on:click="$router.push({name: 'Home'})">
            <svgicon icon="home" width="22" height="22"></svgicon>
        </div>
        <div v-for="breadcrumb in breadcrumbs" class="breadcrumb-element">
            <span class="breadcrumb-separator"><svgicon icon="chevronRight" width="22" height="22"></svgicon></span>
            <span class="breadcrumb-text">{{breadcrumb.name}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['breadcrumbs']
    }
</script>

<style lang="scss">
    @import "../../style/variable";

    #tc-breadcrumb {
        #breadcrumb-home {
            cursor: pointer;
            display: inline-block;
            color: $secondary-text;
        }
        .breadcrumb-element {
            display: inline-block;
            line-height: 22px;
            vertical-align: middle;
            .breadcrumb-separator {
                padding: 0 6px;
                color: $secondary-text;
            }
            .breadcrumb-text {
                font-size: 14px;
                position: relative;
                top: 1px;
            }
        }
    }
</style>
