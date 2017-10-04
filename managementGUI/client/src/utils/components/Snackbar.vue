<template>
    <transition name="snackbar-fade" v-if="showNotification">
        <div id="notification-snackbar" v-bind:class="type" >
            <div class="notification-text">
                <slot name="text">
                    default message
                </slot>
                <div id="notification-close" v-on:click="setShowNotification(false)">✖</div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        props: ['type'],
        data: function () {
            return {showNotification: false};
        },
        created: function () {
            this.$parent.$on('showNotification', this.setShowNotification);
        },
        methods: {
            setShowNotification: function (show) {
                this.showNotification = show;
            }
        },
    }
</script>

<style lang="scss">
    @import "../../style/variable";

    #notification-snackbar {
        min-width: 250px;
        margin-left: -125px;
        color: #fff;
        text-align: center;
        border-radius: 2px;
        padding: 16px 40px 16px 16px;
        position: fixed;
        z-index: 10000;
        left: 50%;
        bottom: 30px;
        background-color: #333;
        #notification-close {
            position: absolute;
            right: 12px;
            top: 0;
            bottom: 0;
            height: 50%;
            margin: auto;
            text-align: center;
            font-weight: 700;
            font-size: 20px;
            color: #ffffff;
            cursor: pointer;
        }
    }

    #notification-snackbar.error {
        background-color: $error;
    }

    .snackbar-fade-enter-active {
        -webkit-animation: fadein 0.5s;
        animation: fadein 0.5s;
    }

    .snackbar-fade-leave-active {
        -webkit-animation: fadeout 0.5s;
        animation: fadeout 0.5s;
    }

    @-webkit-keyframes fadein {
        from {
            bottom: 0;
            opacity: 0;
        }
        to {
            bottom: 30px;
            opacity: 1;
        }
    }

    @keyframes fadein {
        from {
            bottom: 0;
            opacity: 0;
        }
        to {
            bottom: 30px;
            opacity: 1;
        }
    }

    @-webkit-keyframes fadeout {
        from {
            bottom: 30px;
            opacity: 1;
        }
        to {
            bottom: 0;
            opacity: 0;
        }
    }

    @keyframes fadeout {
        from {
            bottom: 30px;
            opacity: 1;
        }
        to {
            bottom: 0;
            opacity: 0;
        }
    }
</style>
