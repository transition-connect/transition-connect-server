<template>
    <modal-dialog>
        <h3 slot="header">Filter Veranstaltungsort</h3>
        <div slot="body">
            <div class="event-no-location-filter"
                 v-show="filter.location.trim() === ''">
                Veranstaltungsort Filter ist deaktiviert.
            </div>
            <div class="input-group input-location">
                <div class="input-location-title">Standort</div>
                <input v-model="filter.location" type="text" name="location"
                       class="form-control">
            </div>
            <div class="input-group input-location-radius">
                <div class="input-location-title">Im Umkreis von</div>
                <div class="form-group" :class="{'has-error': errors.has('locationRadius')}">
                    <input v-model="filter.radius" type="text" name="locationRadius"
                           v-validate="'required|numeric'"
                           class="form-control input-radius" placeholder="Standort">
                    <span class="radius-unit">Km</span>
                </div>
            </div>
        </div>
        <div slot="footer">
            <button type="button" class="btn btn-default"
                    v-on:click="$emit('abort')">
                Abbrechen
            </button>
            <button type="button" class="btn btn-primary"
                    :disabled="!filterHasChanged || errors.has('locationRadius')"
                    v-on:click="changeEventLocationFilter">
                Übernehmen
            </button>
        </div>
    </modal-dialog>
</template>

<script>
    import ModalDialog from './../../../../../utils/components/ModalDialog.vue';
    import equal from 'deep-equal';

    export default {
        props: ['locationFilter'],
        components: {ModalDialog},
        data: function () {
            return {
                filter: {location: '', radius: 50}
            }
        },
        computed: {
            filterHasChanged: function () {
                if (this.locationFilter) {
                    return this.filter.location.trim() !== this.locationFilter.location ||
                        this.filter.radius !== this.locationFilter.radius;
                } else {
                    return this.filter.location.trim() !== '' || this.filter.radius !== 50;
                }
            }
        },
        created: function () {
            if (this.locationFilter) {
                this.filter = JSON.parse(JSON.stringify(this.locationFilter));
            }
        },
        methods: {

            changeEventLocationFilter: function () {
                if (this.filter.location.trim() !== '') {
                    this.$emit('change', this.filter);
                } else {
                    this.$emit('change', null);
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../../style/variable";

    .event-no-location-filter {
        margin-bottom: 18px;
    }

    .input-location-title {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 6px;
    }

    .input-location {
        width: 100%;
        margin-bottom: 12px;
    }

    .input-location-radius {
        .form-group {
            margin-bottom: 0;
        }
        .input-radius {
            width: 60px;
            display: inline-block;
        }
        .radius-unit {
            font-weight: 500;
            margin-left: 6px;
            line-height: 34px;
        }
    }
</style>
