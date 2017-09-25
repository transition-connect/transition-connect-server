<template>
    <div class="tc-loader-container">
        <div class="tc-loader"></div>
    </div>
</template>

<script>

    export default {}
</script>

<style lang="scss">
    .tc-loader-container {
        display: inline-block;
        .tc-loader {
            display: inline-block;
            border: 4px solid #f3f3f3; /* Light grey */
            border-top: 4px solid #3498db; /* Blue */
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    }
</style>
