<template>
    <form id="request-password-container">
        <div class="form-group" :class="{'has-error': errors.has('email')}">
            <h1 class="email-title">E-Mail Adresse eingeben</h1>
            <h2 class="email-description">Gib deine E-Mail Adresse ein, um dich anzumelden.</h2>
            <input v-model="email" v-validate="'required|email'" type="text" name="email"
                   class="form-control" placeholder="E-Mail">
            <p class="text-danger" v-show="errors.has('email')">Korrekte E-Mail Adresse wird benötigt</p>
        </div>
        <div id="upload-container">
            <button v-on:click.prevent="sendPasswordRequest" class="btn btn-primary"
                    :disabled="errors.has('email') || email === '' || !email || runningRequest">Weiter
            </button>
            <loader id="upload-loader" v-show="runningRequest"></loader>
        </div>
        <div id="request-error" v-show="loginError">Diese Email Adresse existiert nicht auf Transition Connect</div>
    </form>
</template>

<script>
    import {HTTP} from './../../../utils/http-common';
    import Loader from './../../../utils/components/Loader.vue';

    export default {
        name: 'request-password',
        components: {Loader},
        data: function () {
            return {
                email: '', runningRequest: false, loginError: false
            }
        },
        methods: {
            sendPasswordRequest: function () {
                this.runningRequest = true;
                this.loginError = false;
                HTTP.post(`/public/api/login/requestPassword`, {email: this.email}
                ).then(() => {
                    this.runningRequest = false;
                    this.$emit('passwordSent', this.email)
                }).catch(e => {
                    this.loginError = true;
                    this.runningRequest = false;
                    console.log(e);
                })
            }
        }
    }
</script>

<style lang="scss">
    #request-password-container {
        max-width: 400px;
        margin: 0 auto;
        text-align: left;
        border-radius: 6px;
        border: solid 1px #ccc;
        padding: 24px;
    }
    .email-title {
        margin-top: 0;
        font-size: 24px;
        margin-bottom: 24px;
    }
    .email-description {
        font-size: 12px;
        margin-bottom: 12px;
    }
    .text-danger {
        margin-top: 6px;
    }
    #upload-container {
        #upload-loader {
            position: relative;
            display: inline-block;
            top: 8px;
            margin-left: 6px;
            height: 28px;
            width: 28px;
        }
    }
    #request-error {
        margin-top: 6px;
        font-size: 12px;
        color: #a94442;
    }
</style>
