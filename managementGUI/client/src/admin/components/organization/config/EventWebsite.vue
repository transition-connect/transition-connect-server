<template>
    <div id="event-website-config">
        <form id="event-website-container">
            <div class="form-group" :class="{'has-error': errors.has('urlWebsite') && eventUrl !== ''}">
                <div class="input-group">
                    <span class="input-group-btn">
                        <button class="btn btn-default" type="button" v-on:click="saveEventWebsite"
                                :disabled="errors.has('urlWebsite') || eventUrl === '' || !eventUrl || previousUrl === eventUrl">
                            Speichern</button>
                    </span>
                    <input v-model="eventUrl" v-validate="'url'" type="text" name="urlWebsite"
                           class="form-control" placeholder="https://...">
                </div>
                <p class="text-danger" v-show="errors.has('urlWebsite')">Keine gültige URL</p>
            </div>
        </form>
    </div>
</template>

<script>
    import Toggle from './../../../../utils/components/Toggle.vue';

    export default {
        components: {Toggle},
        props: ['existingUrl'],
        data: function () {
            return {eventUrl: ''};
        },
        created: function () {
            this.previousUrl = this.existingUrl;
            this.eventUrl = this.existingUrl;
        },
        methods: {
            saveEventWebsite: function () {

            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #event-website-config {
        #event-website-container {
            width: 100%;
        }
        padding-bottom: 8px;
        margin-bottom: 18px;
        .text-danger {
            margin-top: 6px;
        }
    }
</style>
