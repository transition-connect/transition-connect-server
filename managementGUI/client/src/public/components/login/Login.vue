<template>
    <div id="login-container">
        <h1 class="transition-connect-title">Transition Connect Management</h1>
        <div v-if="!showStepVerification">
            <request-password v-on:passwordSent="showValidatePassword"></request-password>
        </div>
        <div v-else>
            <verify-password v-on:abort="abort"></verify-password>
        </div>
    </div>
</template>

<script>
    import RequestPassword from './RequestPassword.vue'
    import VerifyPassword from './VerifyPassword.vue'

    export default {
        name: 'login',
        components: {
            RequestPassword,
            VerifyPassword
        },
        data: function () {
            return {showStepVerification: false};
        },
        methods: {
            showValidatePassword: function () {
                this.showStepVerification = true;
            },
            abort: function () {
                this.showStepVerification = false;
            }
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
