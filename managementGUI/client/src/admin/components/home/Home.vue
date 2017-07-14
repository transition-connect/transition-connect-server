<template>
    <div id="tc-home">
        <div id="tc-home-container">
            <organization-element v-for="organization in overviewData" :organization="organization"
            :key="organization.organizationId"></organization-element>
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../utils/http-common';
    import OrganizationElement from './OrganizationElement.vue';

    export default {
        components: {OrganizationElement},
        data: function () {
            return {overviewData: null};
        },
        created: function () {
            HTTP.get(`/admin/api`).then((resp) => {
                this.overviewData = resp.data;
                console.log(this.overviewData);
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
