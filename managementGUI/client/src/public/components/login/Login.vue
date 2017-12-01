<template>
    <div id="login-container">
        <h1 class="transition-connect-title">TRANSITION-<span class="c-logo">C</span>ONNECT Konfiguration</h1>
        <div v-if="!showStepVerification">
            <request-password v-on:passwordSent="showValidatePassword"></request-password>
        </div>
        <div v-else>
            <verify-password v-on:abort="abort" :mail-address="email"></verify-password>
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
            return {showStepVerification: false, email: ''};
        },
        created: function () {
            let url = window.location.href;
            if (url) {
                let regex = new RegExp("[?&]" + "email" + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(url);
                if (results && results.length > 2) {
                    this.email = decodeURIComponent(results[2].replace(/\+/g, " "));
                    this.showStepVerification = true;
                }
            }
        },
        methods: {
            showValidatePassword: function (email) {
                this.showStepVerification = true;
                this.email = email;
            },
            abort: function () {
                this.showStepVerification = false;
            }
        }
    }
</script>

<style lang="scss">
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
        color: #4D4D4D;
        .c-logo {
            color: #2A7FFF;
        }
    }
</style>
