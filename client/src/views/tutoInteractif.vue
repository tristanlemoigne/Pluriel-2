<template>
    <div>
        <div class="tutoInteractif"  v-if="!isMobile">
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

        <div class="tutoInteractifMobile" v-if="isMobile">
            <div class="camDetection" v-bind:class="{ visible: !camIsActive }">
                ACTIVE TA CAM SUR DESKTOP
            </div>

            <div class="amulettes" v-bind:class="{ visible: camIsActive }">
                <div v-if="character === 'lamar'">
                    JE SUIS LAMAR
                    <img src="assets/img/AmuletteLamarGlow.png" alt>
                </div>
                <div v-if="character === 'zanit'">
                    JE SUIS ZANIT
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
import { setInterval } from 'timers';

export default {
    name: "experience",
    components: { TrackerVideo },
    props: {
        roomState: Object
    },
    data: function(){
        return{
            uiDatas: {
                isDebugMode: true
            },
            camIsActive: false,
            character: undefined,
            checkCameraIsActivated: null
        }
    },
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object,
    },
    watch: {
        "roomState.currentStep": {
            handler: function(currentStep, oldStep) {
                if (currentStep !== oldStep && currentStep !== undefined) {
                    console.log("step HAS CHANGEd", currentStep, this)
                    clearInterval(this.checkCameraIsActivated)

                    // this.$data.camIsActive = true;
                }
            },
            deep: true
        }
    },
    methods: {},
    created(){
        //  Check if user has activated his camera
        if (!this.isMobile) {
            this.$data.checkCameraIsActivated = setInterval(()=>{
                console.log("check")
                navigator.getMedia =
                    navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;

                    navigator.getMedia({ video: true },()=>{
                        // Start tracking
                        console.log("CAM IS ACTIVATED", this)
                        bus.$emit("setRoomState", {currentStep: {name: "tuto_interactif"}})
                    },function(){
                        console.error("webcam is not available")
                    })
            }, 500)
        }
    }, 
    mounted() {
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


.tutoInteractif {
    div.visible{
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

.tutoInteractifMobile{
    div.visible{
        opacity: 1;
    }

    .camDetection{
        opacity: 0;
        transition: opacity 0.5s ease-in;
    }

    .amulettes{
        transition: opacity 0.5s ease-in;
        opacity: 0;
    }
}
</style>
