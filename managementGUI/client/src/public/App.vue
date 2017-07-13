<template>
    <div id="app">
        <login></login>
    </div>
</template>

<script>
    import Login from './components/login/Login.vue'

    export default {
        name: 'app',
        components: {
            Login
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
