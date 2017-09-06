<template>
    <div>
        <div class="tc-sync-status">
            <div class="tc-sync-exported" v-if="status === 'EXPORTED'">Synchronisiert</div>
            <div class="tc-sync-not-exported"
                 v-if="status === 'NOT_EXPORTED' || status === 'EXPORT_UPDATE_NEEDED'">Pending
            </div>
        </div>
        <div class="tc-sync-last-update">Synchronisiert am {{getDateTime}}</div>
    </div>
</template>

<script>
    import moment from 'moment';

    export default {
        props: ['status', 'lastUpdate'],
        computed: {
            getDateTime: function () {
                return moment.unix(this.lastUpdate).format('LLL')
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .tc-sync-status {
        margin: 6px 0;
        padding: 3px 6px;
        border-radius: 4px;
        background-color: green;
        display: inline-block;
        line-height: 22px;
        .tc-sync-exported {
            color: #ffffff;
        }
        .tc-sync-not-exported {
            color: yellow;
        }
    }

    .tc-sync-last-update {
        margin: 6px 0;
        padding: 3px 8px;
        display: inline-block;
        line-height: 22px;
    }
</style>
