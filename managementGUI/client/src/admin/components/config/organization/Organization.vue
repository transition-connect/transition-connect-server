<template>
    <div id="tc-config-organization">
        <div id="tc-container">
            Test
        </div>
    </div>
</template>

<script>
    import {HTTP} from './../../../../utils/http-common';

    export default {
        components: {},
        data: function () {
            return {overviewData: {}};
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
    @import "../../../../style/variable";

    #tc-config-organization {
        width: 100%;
        padding-top: 104px;
        #tc-container {
            margin: 0 auto;
            width: 100%;
            max-width: $application-width;
        }
    }
</style>
