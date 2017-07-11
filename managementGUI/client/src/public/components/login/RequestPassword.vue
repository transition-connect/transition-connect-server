<template>
    <form id="request-password-container">
        <div class="form-group" :class="{'has-error': errors.has('email')}">
            <h1 class="email-title">E-Mail Adresse eingeben</h1>
            <h2 class="email-description">Geben Sie Ihre E-Mail Adresse ein, um sich anzumelden.</h2>
            <input v-model="email" v-validate="'required|email'" type="text" name="email"
                   class="form-control" placeholder="E-Mail">
            <p class="text-danger" v-show="errors.has('email')">Korrekte E-Mail Adresse wird benötigt</p>
        </div>
        <button v-on:click.prevent="sendPasswordRequest" class="btn btn-primary"
                :disabled="errors.has('email') || email === ''">Weiter
        </button>
    </form>
</template>

<script>
    import {HTTP} from './../../../utils/http-common';

    export default {
        name: 'request-password',
        components: {},
        data: function () {
            return {
                email: ''
            }
        },
        methods: {
            sendPasswordRequest: function () {
                HTTP.post(`/login/requestPassword`, {email: this.email}
                ).then(() => {
                    this.$emit('passwordSent', this.email)
                }).catch(e => {
                    console.log(e);
                })
            }
        }
    }
</script>

<style scoped>
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
</style>
