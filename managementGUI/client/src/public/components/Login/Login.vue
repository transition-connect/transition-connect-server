<template>
    <div id="login-container">
        <h1 class="transition-connect-title">Transition Connect Management</h1>
        <request-password></request-password>
    </div>
</template>

<script>
    import RequestPassword from './RequestPassword.vue'

    export default {
        name: 'login',
        components: {
            RequestPassword
        }
    }
</script>

<style scoped>
    #login-container {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    h1, h2 {
        font-weight: normal;
    }
    .transition-connect-title {
        margin-bottom: 64px;
    }
</style>
