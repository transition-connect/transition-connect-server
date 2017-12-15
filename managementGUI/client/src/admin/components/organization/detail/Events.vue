<template>
    <div id="tc-detail-events" v-show="events.length > 0">
        <h2 class="sub-title">Synchronisation Veranstaltungen</h2>
        <div id="event-container">
            <div class="event" v-for="event in events">
                <div class="event-info-container">
                    <div class="summary">{{event.summary}}</div>
                    <div class="secondary-title">{{getDateTime(event.startDate, event.endDate)}}</div>
                    <div class="secondary-title">{{event.location}}</div>
                    <div class="description">{{event.description}}</div>
                </div>
                <div class="sync-info" v-if="event.exportedToNp.length > 0">
                    <span class="sync-title">Wird synchronisiert nach:</span>
                    <span v-for="(np, index)  in event.exportedToNp">{{np}}<span v-if="index < event.exportedToNp.length - 1">, </span></span>
                </div>
                <div class="sync-info" v-else="">
                    <span class="sync-title">Wird nicht synchronisiert</span>
                </div>
                <event-ical :event="event"></event-ical>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';
    import EventIcal from './EventICal.vue';

    export default {
        components: {EventIcal},
        props: ['events'],
        methods: {
            getDateTime: function (startDate, endDate) {
                if (moment.unix(endDate).diff(moment.unix(startDate), 'h') === 24 &&
                    moment.unix(startDate).utc().hour() === 0) {
                    return moment.unix(startDate).utc().format('L')
                }
                return `${moment.unix(startDate).format('LLL')} bis ${moment.unix(endDate).format('LLL')}`
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-events {
        margin-bottom: 32px;
        #event-container {
            margin-top: 18px;
            .event {
                border: 2px solid $divider;
                border-radius: 6px;
                margin-bottom: 12px;
                .event-info-container {
                    padding: 6px;
                    .summary {
                        color: $tc-default-color;
                        font-size: 14px;
                        font-weight: 500;
                    }
                    .secondary-title {
                        font-size: 12px;
                        color: $secondary-text;
                    }
                    .description {
                        margin-top: 4px;
                        font-size: 14px;
                    }
                }
                .sync-info {
                    border-top: 1px solid $divider;
                    margin-top: 6px;
                    padding: 6px;
                    font-size: 12px;
                    .sync-title {
                        font-weight: 500;
                    }
                }
            }
        }
    }
</style>
