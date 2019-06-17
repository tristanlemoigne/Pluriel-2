<template>
    <div class="canvasContainer">
        <canvas ref="canvas"></canvas>
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
