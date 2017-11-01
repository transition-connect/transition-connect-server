<template>
    <div id="tc-detail-info">
        <h2 class="sub-title">Allgemeine Infos</h2>
        <div id="np-detail-info-container">
            <div class="np-detail-row">
                <div class="np-detail-title">Website</div>
                <div class="np-detail-text">
                    <a target="_blank" :href="np.link">{{np.link}}</a>
                </div>
            </div>
            <div class="np-detail-row">
                <div class="np-detail-title">Beschreibung</div>
                <div class="np-detail-text">{{np.description}}</div>
            </div>
            <div class="np-detail-row">
                <div class="np-detail-title">Kategorien</div>
                <div class="np-detail-text">
                        <span v-for="(category, index) in np.categories">
                            {{category}}<span v-if="index !== np.categories.length - 1">,</span>
                        </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['np']
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-info {
        #np-detail-info-container {
            display: table;
            padding-bottom: 12px;
            .np-detail-row {
                display: table-row;
                .np-detail-title {
                    display: table-cell;
                    padding: 6px 24px 6px 0;
                    font-weight: 500;
                    font-size: 14px;
                    min-width: 140px;
                }
                .np-detail-text {
                    display: table-cell;
                    font-size: 14px;
                    .np-created {
                        font-weight: 500;
                    }
                }
            }
        }
    }
</style>
