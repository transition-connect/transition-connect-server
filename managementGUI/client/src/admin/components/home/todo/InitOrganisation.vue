<template>
    <div class="init-organisation">
        <div class="action-title">
            '<span class="org-name">{{actionData.organizationName}}</span>' wurde noch nicht konfiguriert
        </div>
        <div class="todo-commands">
            <button type="button" class="btn btn-warning">Konfigurieren</button>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['actionData'],
        components: {}
    }
</script>

<style lang="scss">
    @import "../../../../style/variable";

    .init-organisation {
        display: table;
        width: 100%;
        .action-title {
            display: table-cell;
            width: auto;
            vertical-align: middle;
            font-size: 16px;
            .org-name {
                cursor: pointer;
                font-weight: 500;
            }
            .org-name:hover {
                text-decoration: underline;
            }
        }
        .todo-commands {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 175px;
            margin-top: 8px;
        }
    }
</style>
