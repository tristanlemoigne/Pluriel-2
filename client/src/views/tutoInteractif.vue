<template>
    <div class="tutoInteractif">
        <div class="camDetection" :class="camIsActive === true ? 'camIsActive' : ''">
            <p class="textGlow">Vous avez besoin de la webcam pour profiter de l’expérience</p>
            <img class="svgGlow mobile" src="/assets/img/webcam.svg" alt>
            <p class="textGlow">Activez votre webcam pour continuer</p>
        </div>

        <div class="tutoExplanation" :class="camIsActive === true ? 'camIsActive' : ''">
            <h2 class="textGlow">Faites à présent usage de vos amulettes</h2>

            <div class="explanationContainer">
                <TrackerVideo
                    v-if="!isMobile"
                    :hasStarted="camIsActive"
                    v-show="this.uiDatas.isDebugMode"
                />

                <div>
                    <p>Orientez l’écran de vos téléphones face à la webcam</p>
                    <img class="svgGlow mobile" src="/assets/img/tuto.svg" alt>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TrackerVideo from "@/components/TrackerVideo.vue";
import { TweenMax, Power2, TimelineLite } from "gsap/TweenMax";
import { threeBus } from "@/main";

export default {
    name: "experience",
    components: { TrackerVideo },
    props: {
        roomState: Object
    },
    data: () => ({
        uiDatas: {
            isDebugMode: true
        },
        camIsActive: Boolean
    }),
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object
    },
    methods: {},
    mounted() {
        //  Check if user has activated his camera
        if (!this.isMobile) {
            const checkCameraIsActivated = setInterval(() => {
                navigator.getMedia =
                    navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;

                navigator.getMedia(
                    { video: true },
                    () => {
                        if (
                            this.$props.roomState.currentStep.activatesCam ===
                            true
                        ) {
                            // Start tracking
                            console.log("we can start tracking");
                            this.$data.camIsActive = true;
                            clearInterval(checkCameraIsActivated);
                        }
                    },
                    function() {
                        console.error("webcam is not available");
                    }
                );
            }, 500);
        }

        // bus.$emit("setRoomState", {currentStep: {name:'NEXT'}})
    }
};
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

.tutoInteractif {
    .camDetection {
        transition: opacity 0.5s ease-in;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        max-width: 300px;
        margin: 0 auto;
        position: relative;
        top: 50%;
        transform: translateY(-50%);

        &.camIsActive {
            opacity: 0;
        }

        img {
            margin: 30px 0;
        }
        p:last-of-type {
            font-weight: bold;
        }
    }

    .tutoExplanation {
        transition: opacity 0.5s 0.5s ease-in;
        opacity: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        &.camIsActive {
            opacity: 1;
        }

        p {
            text-align: center;
        }

        .explanationContainer {
            display: flex;
            margin-top: 100px;
            justify-content: center;
            align-items: center;
            justify-content: space-between;

            video {
                width: 800px;
                height: 535px;
                // filter: grayscale(100%);
            }

            p {
                font-weight: bold;
            }
        }
    }
}
</style>
