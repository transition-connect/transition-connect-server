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
                <textarea class="form-control" id="inputDescription" v-model="description"
                          name="inputDescription" rows="5" v-validate="'required|max: 700'">
                </textarea>
                <p class="text-danger" v-show="errors.has('inputDescription')">Beschreibung wird benötigt und darf nicht länger als 700 Zeichen sein.</p>
            </div>
            <div class="form-group">
                <label for="inputWebsite">Website</label>
                <input type="url" class="form-control" id="inputWebsite" v-model="website"
                       name="inputWebsite" v-validate="'required|url'">
                <p class="text-danger" v-show="errors.has('inputWebsite')">Keine gültige URL</p>
            </div>
        </form>
    </div>
</template>

<script>
    import Toggle from './../../../../utils/components/Toggle.vue';
    import * as types from '../../../store/mutation-types';
    import { mapGetters } from 'vuex';

    export default {
        props: ['config'],
        components: {Toggle},
        data: function () {
            return {};
        },
        computed: {
            description: {
                get() {
                    return this.config.description;
                },
                set(description) {
                    this.$store.commit(types.CHANGE_NP_DESCRIPTION,
                        {description: description, valid: this.errors.has('inputDescription')})
                }
            },
            website: {
                get() {
                    return this.config.link;
                },
                set(website) {
                    this.$store.commit(types.CHANGE_NP_WEBSITE,
                        {website: website, valid: this.errors.has('inputWebsite')})
                }
            }
        },
        methods: {
            manuallyAcceptOrganizationChanged: function (newState) {
                this.$store.commit(types.CHANGE_NP_MANUALLY_ACCEPT_ORG, newState)
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
