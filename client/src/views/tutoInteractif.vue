<template>
    <div class="blackBg">
        <div class="tutoInteractif" v-if="!isMobile">
            <div class="camDetection" v-bind:class="{ visible: !camIsActive }">
                <p class="textGlow">Vous avez besoin de la webcam pour profiter de l’expérience</p>
                <img class="svgGlow mobile" src="/assets/img/webcam.svg" alt>
                <p class="textGlow">Activez votre webcam pour continuer</p>
            </div>

            <div class="tutoExplanation" v-bind:class="{ visible: camIsActive }">
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

        <div class="tutoInteractifMobile textGlow" v-if="isMobile">
            <div class="camDetection" v-bind:class="{ visible: !camIsActive }">
                <p>Activez la webcam sur votre ordinateur pour poursuivre l’expérience</p>
                <img class="svgGlow mobile" src="/assets/img/webcam.svg" alt>
            </div>

            <div class="amulettes" v-bind:class="{ visible: camIsActive }">
                <div v-if="character === 'lamar'">
                    <img src="assets/img/AmuletteLamarGlow.png" alt>
                </div>
                <div v-if="character === 'zanit'">
                    <img src="assets/img/AmuletteZanitGlow.png" alt>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TrackerVideo from "@/components/TrackerVideo.vue";
import { TweenMax, Power2, TimelineLite } from "gsap/TweenMax";
import { threeBus, bus } from "@/main";
import socket from "@/socket.js";
import { setInterval } from "timers";

export default {
    name: "experience",
    components: { TrackerVideo },
    props: {
        roomState: Object
    },
    data: function() {
        return {
            uiDatas: {
                isDebugMode: true
            },
            camIsActive: false,
            character: undefined,
            isCameraActivated: null
        };
    },
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object
    },
    watch: {
        "roomState.currentStep": {
            handler: function(currentStep, oldStep) {
                if (currentStep !== oldStep && currentStep !== undefined) {
                    window.clearInterval(this.isCameraActivated);
                    this.camIsActive = true;
                }
            },
            deep: true
        }
    },
    methods: {
        checkCameraIsActivated() {
            this.isCameraActivated = window.setInterval(function() {
                navigator.getMedia =
                    navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;

                navigator.getMedia(
                    { video: true },
                    function() {
                        // Start tracking
                        bus.$emit("setRoomState", {
                            currentStep: {
                                camIsActive: true
                            }
                        });
                    },
                    function() {
                        console.error("webcam is not available");
                    }
                );
            }, 500);
        }
    },
    mounted() {
        //  Check if user has activated his camera
        if (!this.isMobile) {
            this.checkCameraIsActivated();
        }

        if (this.roomState.lamar === socket.id) {
            this.character = "lamar";
        } else if (this.roomState.zanit === socket.id) {
            this.character = "zanit";
        } else {
            this.character = undefined;
        }
    }
};
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";
.blackBg {
    background: rgba(0, 0, 0, 0.45);
}
.tutoInteractif {
    div.visible {
        opacity: 1;
    }

    .camDetection {
        opacity: 0;
        transition: opacity 0.5s ease-in;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        max-width: 300px;
        margin: 0 auto;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

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

            p {
                font-weight: bold;
            }
        }
    }
}

.tutoInteractifMobile {
    div.visible {
        opacity: 1;
    }

    .camDetection {
        opacity: 0;
        transition: opacity 0.5s ease-in;
        position: absolute;
        top: 50%;
        left: 0;
        text-align: center;
        transform: translateY(-50%);

        p {
            padding: 25px;
        }
    }

    .amulettes {
        transition: opacity 0.5s ease-in;
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: $black;

        img {
            width: 110%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
}
</style>
