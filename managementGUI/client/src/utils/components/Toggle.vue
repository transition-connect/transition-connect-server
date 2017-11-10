<template>
    <input type="checkbox" data-toggle="toggle">
</template>

<script>

    export default {
        props: ['on', 'off', 'size', 'onstyle', 'offstyle', 'height', 'width', 'state', 'disabled'],
        mounted: function () {
            let element = this;
            if (this.state) {
                this.$el.checked = true;
            }
            if (this.disabled) {
                this.$el.disabled = true;
            }
            $(this.$el).bootstrapToggle({
                on: this.on,
                off: this.off,
                size: this.size,
                onstyle: this.onstyle,
                offstyle: this.offstyle,
                height: this.height,
                width: this.width
            });
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
            line-height: 19px !important;
        }
        .toggle-off {
            line-height: 19px !important;
        }
    }
</style>
