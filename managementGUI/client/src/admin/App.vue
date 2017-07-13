<template>
    <div id="app">
        <header-nav></header-nav>
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
        background-color: #fafafa;
        min-height: 100%;

        font-family: Roboto,Helvetica Neue,sans-serif;
    }
</style>
