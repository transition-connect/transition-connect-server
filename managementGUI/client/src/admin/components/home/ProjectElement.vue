<template>
    <div class="project-container">
        <div class="project-title">
            {{project.name}}
        </div>
    </div>
</template>

<script>
    export default {
        props: ['project'],
        created: function () {
            console.log(this.project);
        }
    }
</script>

<style lang="scss">
    .project-container {
        padding-left: 18px;
        margin-bottom: 8px;
        .project-title {
            font-weight: 300;
            font-size: 18px;
        }
    }
</style>
