<template>
    <form id="verify-password-container">
        <div class="form-group" :class="{'has-error': errors.has('password')}">
            <h1 class="password-title">Passwort eingeben</h1>
            <h2 class="password-description">Gib das Passwort ein, welches du per E-Mail erhalten hast.</h2>
            <input v-model="password" v-validate="'required'" type="text" name="password"
                   class="form-control" placeholder="Passwort">
        </div>
        <div>
            <button v-on:click.prevent="abort" class="btn btn-default">Abbrechen</button>
            <button v-on:click.prevent="sendPasswordVerification" class="btn btn-primary"
                    :disabled="errors.has('password') || password === '' || !password || runningRequest">Login
            </button>
            <loader id="upload-loader" v-show="runningRequest"></loader>
        </div>
        <div id="request-error" v-show="loginError">Passwort stimmt nicht oder ist abgelaufen.</div>
    </form>
</template>

<script>
    import {HTTP} from './../../../utils/http-common';
    import Loader from './../../../utils/components/Loader.vue';

    export default {
        name: 'verify-password',
        props: ['mailAddress'],
        components: {Loader},
        data: function () {
            return {
                password: '', runningRequest: false, loginError: false
            }
        },
        created: function () {
            let url = window.location.href;
            if (url) {
                let regex = new RegExp("[?&]" + "password" + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(url);
                if (results && results.length > 2) {
                    this.password = decodeURIComponent(results[2].replace(/\+/g, " "));
                    this.sendPasswordVerification();
                }
            }
        },
        methods: {
            sendPasswordVerification: function () {
                console.log(this.mailAddress);
                this.runningRequest = true;
                this.loginError = false;
                HTTP.post(`/public/api/login`, {password: this.password, username: this.mailAddress}
                ).then(() => {
                    this.runningRequest = false;
                    window.location.href = "/admin";
                }).catch(e => {
                    this.runningRequest = false;
                    this.loginError = true;
                    console.log(e);
                })
            },
            abort: function () {
                this.$emit('abort')
            }
        }
    }
</script>

<style lang="scss">
    #verify-password-container {
        max-width: 400px;
        margin: 0 auto;
        text-align: left;
        border-radius: 6px;
        border: solid 1px #ccc;
        padding: 24px;
    }

    .password-title {
        margin-top: 0;
        font-size: 24px;
        margin-bottom: 24px;
    }

    .password-description {
        font-size: 12px;
        margin-bottom: 12px;
    }

    .text-danger {
        margin-top: 6px;
    }

    #upload-loader {
        position: relative;
        display: inline-block;
        top: 8px;
        margin-left: 6px;
        height: 28px;
        width: 28px;
    }
</style>
