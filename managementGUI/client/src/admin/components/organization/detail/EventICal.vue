<template>
    <div class="ical-info">
        <div class="ical-text" v-show="showICal">{{event.iCal}}</div>
        <div class="ical-more-button" v-on:click="showICal = true" v-show="!showICal">ICal Event anzeigen</div>
        <div class="ical-more-button" v-on:click="showICal = false" v-show="showICal">ICal Event verbergen</div>
    </div>
</template>

<script>
    export default {
        props: ['event'],
        data: function () {
            return {showICal: false};
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .ical-info {
        padding: 6px;
        .ical-text {
            white-space: pre-wrap;
            color: $secondary-text;
        }
        .ical-more-button {
            margin-top: 6px;
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
        }
        :hover.ical-more-button {
            text-decoration: underline;
        }
    }
</style>
