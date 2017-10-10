<template>
    <div id="tc-home">
        <div id="tc-home-container">
            <div class="panel panel-default">
                <div class="panel-heading">Benachrichtigungen</div>
                <div class="panel-body">
                    <notification v-for="notification in overviewData.notification" :notification="notification"
                                  @remove="removeNotification(notification)"></notification>
                </div>
            </div>
            <div class="panel panel-default" v-show="overviewData.nps.length > 0">
                <div class="panel-heading">Deine Vernetzungsplattformen</div>
                <div class="panel-body">
                    <networking-platform-element v-for="np in overviewData.nps" :np="np"
                                                 :key="np.platformId"></networking-platform-element>
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
        <snackbar type="error">
            <div slot="text">Ein Fehler ist aufgetreten.</div>
        </snackbar>
    </div>
</template>

<script>
    import {HTTP} from './../../../utils/http-common';
    import Snackbar from './../../../utils/components/Snackbar.vue';
    import OrganizationElement from './OrganizationElement.vue';
    import NetworkingPlatformElement from './NetworkPlatformElement.vue';
    import Notification from './notification/Notification.vue';

    export default {
        components: {Snackbar, OrganizationElement, NetworkingPlatformElement, Notification},
        data: function () {
            return {overviewData: {organization: {}, nps: {}}};
        },
        created: function () {
            HTTP.get(`/admin/api`).then((resp) => {
                this.overviewData = resp.data;
            }).catch(e => {
                this.$emit('showNotification', true);
                console.log(e);
            })
        },
        methods: {
            removeNotification: function (notification) {
                this.overviewData.notification.splice(
                    this.overviewData.notification.findIndex(
                        (notificationToCompare) => notificationToCompare === notification), 1);
            }
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
