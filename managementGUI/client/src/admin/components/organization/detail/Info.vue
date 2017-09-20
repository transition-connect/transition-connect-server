<template>
    <div id="tc-detail-info">
        <div id="org-detail-info-container">
            <div class="org-detail-row">
                <div class="org-detail-title">Organisation/Projekt</div>
                <div class="org-detail-text">{{organization.name}}</div>
            </div>
            <div class="org-detail-row">
                <div class="org-detail-title">Slogan</div>
                <div class="org-detail-text">{{organization.slogan}}</div>
            </div>
            <div class="org-detail-row">
                <div class="org-detail-title">Website</div>
                <div class="org-detail-text">
                    <a target="_blank" :href="organization.website">{{organization.website}}</a>
                </div>
            </div>
            <div class="org-detail-row">
                <div class="org-detail-title">Beschreibung</div>
                <div class="org-detail-text">{{organization.description}}</div>
            </div>
            <div class="org-detail-row">
                <div class="org-detail-title" v-if="organization.administrators.length === 1">E-Mail Administrator</div>
                <div class="org-detail-title" v-if="organization.administrators.length > 1">E-Mail Administratoren</div>
                <div class="org-detail-text">
                    <div v-for="administrator in organization.administrators">
                        {{administrator}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['organization']
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    #tc-detail-info {
        #org-detail-info-container {
            display: table;
            border-bottom: 1px solid $divider;
            padding-bottom: 12px;
            .org-detail-row {
                display: table-row;
                .org-detail-title {
                    display: table-cell;
                    padding: 6px 24px 6px 0;
                    font-weight: 500;
                    font-size: 14px;
                    min-width: 140px;
                }
                .org-detail-text {
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
