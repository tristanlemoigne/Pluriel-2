<template>
    <div class="canvasContainer">
        <canvas ref="canvas"></canvas>
        <div class="gradient normalGradient"></div>
        <div class="gradient loseGradient"></div>
        <div class="gradient winGradient"></div>
    </div>
</template>

<script>
import ThreeEntryPointDsk from "../../threejs/ThreeEntryPointDsk.js";
import { threeBus } from "../../main";

export default {
    name: "ThreeContainerDsk",
    components: {},
    props: {
        roomState: Object
    },
    data: () => ({
        threeEntryPoint: null,
        camIsActive: Boolean
    }),
    computed: {
        currentStep() {
            return this.$props.roomState.currentStep;
        }
    },
    mounted() {
        this.$data.threeEntryPoint = ThreeEntryPointDsk(this.$refs.canvas);
    },
    methods: {
        animCubeFromTo() {
            threeEntryPoint.animThree;
        }
    },
    watch: {
        "roomState.currentStep": {
            handler: function(currentStep, oldStep) {
                if (oldStep.name !== currentStep.name)
                    threeBus.$emit("change to step", currentStep);
            },
            deep: true
        }
    }
};
</script>

<style lang="scss" scoped>
@import "@/config/styles.scss";

.gradient {
    transition: 6s ease;
    z-index: -1;
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.normalGradient {
    background: linear-gradient(#3e3fac, #f177be);
}
.winGradient {
    opacity: 0;
    background: linear-gradient(#da8f32, #3c7bd8);
}
.loseGradient {
    opacity: 0;
    background: linear-gradient(#3e3fac, #f177be);
}

.canvasContainer {
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
