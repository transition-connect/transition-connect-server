<template>
    <div id="tc-config-admin">
        <h2 class="tc-admin-title">{{getAdministrator}}</h2>
        <div class="tc-admin-container" v-for="admin in admins">
            <div class="icon-circle" :class="{'icon-circle-disabled': admins.length === 1}"
                 v-on:click="removeAdministrator(admin)">
                <svgicon icon="removeCircle" width="26" height="26"></svgicon>
            </div>
            <div class="admin-email">{{admin}}</div>
        </div>
        <div class="add-admin-container">
            <form id="request-password-container">
                <div class="form-group" :class="{'has-error': errors.has('email') && email !== ''}">
                    <div class="input-group">
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="button" v-on:click="addAdministrator"
                                    :disabled="errors.has('email') || email === '' || !email">Hinzufügen</button>
                        </span>
                        <input v-model="email" v-validate="'required|email'" type="text" name="email"
                               class="form-control" placeholder="E-Mail Administrator...">
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['admins'],
        data: function () {
            return {email: ''}
        },
        methods: {
            addAdministrator: function () {
                if (!this.checkEMailExists(this.email)) {
                    this.admins.push(this.email);
                    this.$emit('changed');
                }
                this.email = '';
            },
            removeAdministrator: function (adminToRemove) {
                if (this.admins && this.admins.length > 1) {
                    this.admins.splice(this.admins.findIndex((admin) => admin === adminToRemove), 1);
                    this.$emit('changed');
                }
            },
            checkEMailExists: function (email) {
                for (let admin of this.admins) {
                    if (admin === email) {
                        return true;
                    }
                }
                return false;
            }
        },
        computed: {
            getAdministrator: function () {
                if (this.admins) {
                    return this.admins.length > 1 ? 'Administratoren' : 'Administrator';
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../style/variable";

    #tc-config-admin {
        padding-bottom: 8px;
        margin-bottom: 18px;
        .tc-admin-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px $divider solid;
        }
        .tc-admin-container {
            margin-bottom: 6px;
            .icon-circle {
                display: inline-block;
                margin-right: 6px;
                cursor: pointer;
                color: #c9302c;
            }
            .icon-circle-disabled {
                cursor: not-allowed;
                color: grey;
            }
            .admin-email {
                display: inline-block;
                font-size: 14px;
            }
        }
        .add-admin-container {
            margin-top: 18px;
            .add-admin-icon {
                svg {
                    color: green;
                }
            }
        }

    }
</style>
