<template>
    <div id="tc-config-general">
        <form>
            <div class="form-group">
                <div class="export-rules-container">
                    <div class="toggle-accept-container">
                        <toggle :on="'Aktiviert'" :off="'Deaktiviert'" :size="'normal'"
                                :onstyle="'success'" :state="config.manuallyAcceptOrganization"
                                :offstyle="!config.manuallyAcceptOrganization ? 'default': 'warning'"
                                height="32px" width="120px" @changed="manuallyAcceptOrganizationChanged"></toggle>
                    </div>
                    <div class="accept-org-text">Jede Organisation, welche von einer anderen Vernetzungsplatform erstellt wurde
                        und mit {{config.name}} synchronisiert werden möchte, muss zuerst durch einen Administrator von
                        {{config.name}} manuell genehmigt werden.
                    </div>
                </div>
            </div>
            <div class="form-group" :class="{'has-error': errors.has('inputDescription')}">
                <label for="inputDescription">Beschreibung</label>
                <textarea class="form-control" id="inputDescription" v-model="config.description"
                          name="inputDescription" rows="5" v-validate="'required|max: 700'">
                </textarea>
                <p class="text-danger" v-show="errors.has('inputDescription')">Beschreibung wird benötigt und darf nicht länger als 700 Zeichen sein.</p>
            </div>
            <div class="form-group">
                <label for="inputWebsite">Website</label>
                <input type="url" class="form-control" id="inputWebsite" v-model="config.link"
                       name="inputWebsite" v-validate="'required|url'">
                <p class="text-danger" v-show="errors.has('inputWebsite')">Keine gültige URL</p>
            </div>
        </form>
    </div>
</template>

<script>
    import Toggle from './../../../../utils/components/Toggle.vue';

    export default {
        props: ['config'],
        components: {Toggle},
        data: function () {
            return {};
        },
        watch: {
            config: {
                handler: function () {
                    this.$validator.validateAll().then(() => {
                        this.$emit('changed', this.errors.errors.length > 0);
                    });
                },
                deep: true
            }
        },
        methods: {
            manuallyAcceptOrganizationChanged: function (newState) {
                this.config.manuallyAcceptOrganization = newState;
                this.$emit('changed', this.errors.errors.length > 0);
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-config-general {
        .export-rules-container {
            display: table;
            .toggle-accept-container {
                display: table-cell;
                width: 120px;
            }
            .accept-org-text {
                position: relative;
                display: table-cell;
                padding-left: 12px;
                top: -9px;
                width: auto;
            }
        }
    }
</style>
