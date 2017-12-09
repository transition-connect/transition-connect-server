<template>
    <div id="tc-detail-locations" v-show="locations.length > 0">
        <h2 class="sub-title">Standorte</h2>
        <div id="location-container">
            <div class="location" v-for="location in locations">
                <div class="address">{{location.address}}</div>
                <div class="description">{{location.description}}</div>
                <div class="geo-data">Longitude: {{location.longitude}}, Latitude: {{location.latitude}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['locations']
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-locations {
        margin-bottom: 32px;
        #location-container {
            margin-top: 18px;
            .location {
                border: 2px solid $divider;
                border-radius: 6px;
                margin-bottom: 12px;
                padding: 6px;
                .address {
                    font-size: 14px;
                    font-weight: 500;
                }
                .description {
                    margin-top: 4px;
                    font-size: 14px;
                }
            }
        }
    }
</style>
