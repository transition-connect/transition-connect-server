<template>
    <input type="checkbox" checked data-toggle="toggle">
</template>

<script>

    export default {
        props: ['on', 'off', 'size', 'onstyle', 'offstyle', 'height', 'width'],
        mounted: function () {
            $(this.$el).bootstrapToggle({
                on: this.on,
                off: this.off,
                size: this.size,
                onstyle: this.onstyle,
                offstyle: this.offstyle,
                height: this.height,
                width: this.width
            });
        },
        beforeDestroy: function () {
            $(this.$el).bootstrapToggle('destroy')
        }
    }
</script>

<style lang="scss">
    .toggle-group {
        .toggle-on {
            line-height: normal !important;
        }
        .toggle-off {
            line-height: normal !important;
        }
    }
</style>
