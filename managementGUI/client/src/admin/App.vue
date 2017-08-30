<template>
    <div id="app">
        <header-nav></header-nav>
        <router-view></router-view>
    </div>
</template>

<script>
    import HeaderNav from './components/nav/Header.vue'

    export default {
        name: 'app',
        components: {
            HeaderNav
        }
    }
</script>

<style lang="scss">
    #app {
        background-color: #ffffff;
        min-height: 100%;

        font-family: Roboto,Helvetica Neue,sans-serif;
    }
</style>
