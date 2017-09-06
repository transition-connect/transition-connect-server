<template>
    <div id="tc-home">
        <div id="tc-home-container">
            <div class="panel panel-default">
                <div class="panel-heading">Todo's</div>
                <div class="panel-body">
                    <todo-element v-for="todo in overviewData.todo" :todo="todo"></todo-element>
                </div>
            </div>
            <div class="panel panel-default" v-show="overviewData.organization.length > 0">
                <div class="panel-heading">Deine Organisationen/Projekte</div>
                <div class="panel-body">
                    <organization-element v-for="organization in overviewData.organization" :organization="organization"
                                          :key="organization.organizationId"></organization-element>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../utils/http-common';
    import OrganizationElement from './OrganizationElement.vue';
    import TodoElement from './todo/TodoElement.vue';

    export default {
        components: {OrganizationElement, TodoElement},
        data: function () {
            return {overviewData: {organization: {}}};
        },
        created: function () {
            HTTP.get(`/admin/api`).then((resp) => {
                this.overviewData = resp.data;
            }).catch(e => {
                console.log(e);
            })
        }
    }
</script>

<style lang="scss">
    @import "../../../style/variable";

    #tc-home {
        width: 100%;
        padding-top: 104px;
        #tc-home-container {
            margin: 0 auto;
            width: 100%;
            max-width: $application-width;
        }
    }
</style>
