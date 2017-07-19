<template>
    <div class="status-container"
         :class="{pending: !pending, accepted: pending}">
        <span v-if="!pending">Nicht aktiviert</span>
        <span v-else>Aktiviert</span>
    </div>
</template>

<script>
    export default {
        props: ['statusAdmin'],
        created: function () {
            this.pending = this.statusAdmin === 'accepted';
        }
    }
</script>

<style lang="scss">
    .status-container {
        display: inline-block;
        background-color: green;
        font-weight: 500;
        color: #ffffff;
        padding: 0 12px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 20px;
    }

    .pending {
        background-color: #c9302c;
    }

    .accepted {
        background-color: #5cb85c;
    }
</style>
