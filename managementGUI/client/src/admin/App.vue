<template>
    <div id="app">
        <header-nav></header-nav>
        <home></home>
    </div>
</template>

<script>
    import HeaderNav from './components/nav/Header.vue'
    import Home from './components/home/Home.vue'

    export default {
        name: 'app',
        components: {
            HeaderNav,
            Home
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
