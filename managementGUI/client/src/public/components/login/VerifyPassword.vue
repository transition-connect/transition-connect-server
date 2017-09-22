<template>
    <form id="verify-password-container">
        <div class="form-group" :class="{'has-error': errors.has('password')}">
            <h1 class="password-title">Passwort eingeben</h1>
            <h2 class="password-description">Geben Sie das Passwort ein, welches Sie per E-Mail erhalten haben.</h2>
            <input v-model="password" v-validate="'required'" type="text" name="password"
                   class="form-control" placeholder="Passwort">
        </div>
        <button v-on:click.prevent="abort" class="btn btn-default">Abbrechen</button>
        <button v-on:click.prevent="sendPasswordVerification" class="btn btn-primary"
                :disabled="errors.has('password') || password === '' || !password">Login
        </button>
    </form>
</template>

<script>
    import {HTTP} from './../../../utils/http-common';

    export default {
        name: 'verify-password',
        props: ['mailAddress'],
        components: {},
        data: function () {
            return {
                password: ''
            }
        },
        methods: {
            sendPasswordVerification: function () {
                console.log(this.mailAddress);
                HTTP.post(`/public/api/login`, {password: this.password, username: this.mailAddress}
                ).then(() => {
                    window.location.href = "/admin";
                }).catch(e => {
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
</style>
