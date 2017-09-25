<template>
    <div>
        <div class="tc-sync-status">
            <div class="tc-sync-exported tc-sync-text"
                 v-if="status === 'EXPORTED'">Synchronisiert</div>
            <div class="tc-sync-running tc-sync-text"
                 v-if="status === 'NOT_EXPORTED' || status === 'EXPORT_UPDATE_NEEDED'">Synchronisation läuft
            </div>
            <div class="tc-sync-requested tc-sync-text"
                 v-if="status === 'EXPORT_REQUESTED'">Warte auf Freigabe</div>
        </div>
        <div class="tc-sync-status-text" v-if="status === 'EXPORTED'">Synchronisiert am {{getDateTime}}</div>
        <div class="tc-sync-status-text" v-if="status === 'NOT_EXPORTED'">Es kann einige Minuten dauern bis die Synchronisation abgeschlossen ist.</div>
        <div class="tc-sync-status-text" v-if="status === 'EXPORT_REQUESTED'">
            Synchronisation muss von Plattform bestätigt werden.
        </div>
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
        color: #ffffff;
        display: inline-block;
        line-height: 22px;
        .tc-sync-text {
            padding: 3px 6px;
            border-radius: 4px;
        }
        .tc-sync-exported {
            background-color: $success;
        }
        .tc-sync-running {
            background-color: #558B2F;
        }
        .tc-sync-requested {
            background-color: $warning;
        }
    }

    .tc-sync-status-text {
        margin: 6px 0;
        padding: 3px 8px;
        display: inline-block;
        line-height: 22px;
    }
</style>
