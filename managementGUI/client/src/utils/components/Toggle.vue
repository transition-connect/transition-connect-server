<template>
    <input type="checkbox" data-toggle="toggle">
</template>

<script>

    export default {
        props: ['on', 'off', 'size', 'onstyle', 'offstyle', 'height', 'width', 'state'],
        mounted: function () {
            let element = this;
            $(this.$el).bootstrapToggle({
                on: this.on,
                off: this.off,
                size: this.size,
                onstyle: this.onstyle,
                offstyle: this.offstyle,
                height: this.height,
                width: this.width
            });
            if (this.state) {
                $(this.$el).bootstrapToggle('on');
            } else {
                $(this.$el).bootstrapToggle('off');
            }
            $(this.$el).change(function () {
                element.$emit('changed', $(this).prop('checked'));
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
