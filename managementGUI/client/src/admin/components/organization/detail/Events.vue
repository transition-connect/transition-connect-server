<template>
    <div id="tc-detail-events" v-show="events.length > 0">
        <h2 class="sub-title">Veranstaltungen</h2>
        <div id="event-container">
            <div class="event" v-for="event in events">
                <div class="summary">{{event.summary}}</div>
                <div class="secondary-title">{{getDateTime(event.startDate, event.endDate)}}</div>
                <div class="secondary-title">{{event.location}}</div>
                <div class="description">{{event.description}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';

    export default {
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
                margin-bottom: 12px;
                .summary {
                    font-weight: 400;
                }
                .secondary-title {
                    font-size: 12px;
                    color: $secondary-text;
                }
                .description {
                    margin-top: 4px;
                    font-size: 12px;
                    //color: $secondary-text;
                }
            }
        }
    }
</style>
