<template>
    <div class="canvasContainer">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script>
import ThreeEntryPointMob from "../../threejs/ThreeEntryPointMob.js"
import { threeBus } from "../../main"

export default {
    name: "ThreeContainerMob",
    props: {
        roomState: Object,
        character: String
    },
    data() {
        return {
            threeEntryPoint: null
        }
    },
    mounted() {
        this.$data.threeEntryPoint = ThreeEntryPointMob(this.$refs.canvas)
    },
    beforeDestroy() {
        tracker.removeAllListeners()
    },
    watch: {
        "roomState.currentStep": {
            handler: function(currentStep, oldStep) {
                if (oldStep.name !== currentStep.name){
                    threeBus.$emit("change to step", currentStep)
                }
            },
            deep: true
        }
    }
}
</script>

<style lang="scss" scoped>
.canvasContainer {
    background: linear-gradient(#3e3fac, #f177be);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
